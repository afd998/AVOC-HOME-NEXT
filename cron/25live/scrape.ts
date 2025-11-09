import { chromium, type Browser } from "playwright";
import dayjs from "dayjs";
import config from "../config";
import { pipe } from "remeda";
import { getEvents } from "./Events/getEvents";
import { type AvailabilitySubject, type RawEvent } from "./schemas";
import { getResourceEvents } from "./ResourceEvents/getResourceEvents";
import { saveResourceEvents } from "./ResourceEvents/saveResourceEvents";
import { saveEvents } from "./Events/saveEvents";
import { saveTasks } from "./Tasks/saveTasks";
import { getCaptureQcRows } from "./Tasks/captureQc/getCaptureQcRows";
import { saveCaptureQcRows } from "./Tasks/captureQc/saveCaptureQcRows";
import { getFacultyEvents } from "./FacultyEvents/getFacultyEvents";
import { saveFacultyEvents } from "./FacultyEvents/SaveFacultyEvents";
import { fetchEventsData } from "./fetchData";
import { getQcItemRows } from "./Tasks/captureQc/QcItems/getQcItemRows";
import { saveQcItemRows } from "./Tasks/captureQc/QcItems/saveQcItemRows";
import { getHardwareEvents } from "./PropertiesEvents/getPropertiesEvents";
import { getActions } from "./Actions/getActions";
import {
  type ProcessedEvent,
  type QcRow,
  type ResourceEventRow,
  type FacultyEventRow,
  type TaskRow,
} from "../../lib/db/types";

// Validate configuration to ensure all required environment variables are present
config.validate();

// Global browser instance for reuse across requests
let browser: Browser | null = null;

/**
 * Initialize and return a browser instance
 * Uses singleton pattern to reuse the same browser across multiple requests
 * for better performance and resource management
 */
async function initBrowser(): Promise<Browser> {
  if (browser) {
    return browser;
  }
  browser = await chromium.launch({
    headless: config.browser.headless,
  });
  return browser;
}

async function main(): Promise<void> {
  // Parse command line argument for date offset (defaults to 0 = today)
  const offset = Number.parseInt(process.argv[2] ?? "0", 10);
  const date = dayjs().add(offset, "day").format("YYYY-MM-DD");
  console.log(`\n🚀 Starting scrape for date: ${date}`);

  type Batch = {
    events: ProcessedEvent[];
    resourcesEvents: ResourceEventRow[];
    facultyEvents: FacultyEventRow[];
    tasks: TaskRow[];
    captureQc: QcRow[];
  };
  const emptyBatch: Batch = {
    events: [],
    resourcesEvents: [],
    facultyEvents: [],
    tasks: [],
    captureQc: [],
  };
  const browserInstance = await initBrowser();
  console.log(`📥 Fetching raw events data...`);
  const raw = await fetchEventsData(browserInstance, date);
  console.log(`✅ Fetched ${raw.length} raw events`);

  console.log(`🔄 Processing events...`);
  const batch = await pipe(
    raw,
    async (raw: RawEvent[]): Promise<Batch> => {
      const events = await getEvents(raw);
      console.log(`📊 Processed ${events.length} events`);
      return { ...emptyBatch, events };
    },
    async (b: Batch) => {
      console.log(
        `🔗 Processing resource events, faculty events, and tasks...`
      );
      const [resourcesEvents, facultyEvents, hardwareEvents, actions] =
        await Promise.all([
          getResourceEvents(b.events),
          getFacultyEvents(b.events),
          getHardwareEvents(b.events),
          getActions(b.events),
        ]);
      console.log(
        `📦 Found ${resourcesEvents.length} resource events, ${facultyEvents.length} faculty events, ${hardwareEvents.length} hardware events, ${actions.length} actions, ${tasks.length} tasks`
      );
      const batchWithJoins = {
        ...b,
        resourcesEvents,
        facultyEvents,
        hardwareEvents,
        actions,
      };
      console.log(`🔍 Processing capture QC rows and QC items...`);
      const [captureQcRows, qcItemsRows] = await Promise.all([
        getCaptureQcRows(batchWithJoins.tasks),
        getQcItemRows(batchWithJoins.tasks),
      ]);
      console.log(
        `📋 Found ${captureQcRows.length} capture QC rows, ${qcItemsRows.length} QC item rows`
      );
      return { ...batchWithJoins, captureQcRows, qcItemsRows };
    }
  );

  console.log(`\n💾 Saving data to database...`);
  await saveEvents([...batch.events], date);
  await Promise.all([
    saveResourceEvents([...batch.resourcesEvents], batch.events, date),
    saveFacultyEvents([...batch.facultyEvents], batch.events, date),
    saveTasks([...batch.tasks], date),
  ]);
  await saveCaptureQcRows(batch.captureQcRows);
  await saveQcItemRows(batch.qcItemsRows);
  console.log(`\n✅ Scrape completed successfully for ${date}\n`);
}

void (async () => {
  try {
    await main();
  } finally {
    // Always clean up browser resources, even if an error occurs
    if (browser) {
      await (browser as Browser).close();
      browser = null;
    }
  }
})().catch((error) => {
  // Set exit code to indicate failure for process monitoring tools
  console.error(`\n❌ Scrape failed with error:`, error);
  process.exitCode = 1;
  throw error;
});
