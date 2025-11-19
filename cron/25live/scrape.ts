import { chromium, type Browser } from "playwright";
import dayjs from "dayjs";
import config from "../config";
import { pipe } from "remeda";
import { getEvents } from "./events/make-rows";
import { type AvailabilitySubject, type RawEvent } from "./schemas";
import { makeResourceEventsRows } from "./resourse-events/make-rows";
import { saveResourceEvents } from "./resourse-events/save-rows";
import { saveEvents } from "./events/save-rows";
import { makeFacultyEventsRows } from "./faculty-events/make-rows";
import { saveFacultyEvents } from "./faculty-events/save-rows";
import { fetchEventsData } from "./fetchData";
import { saveQcItemRows } from "./tasks/captureQc/QcItems/saveQcItemRows";
import { getActions } from "./actions/make-rows";
import { type ProcessedEvent } from "../../lib/db/types";
import { makeEventHybridRows } from "./event-hybrid/make-rows";
import { makeEventAVConfigRows } from "./event-av-config/make-rows";
import { makeEventOtherHardwareRows } from "./event-other-hardware/make-rows";
import { makeEventRecordingRows } from "./event-recording/make-rows";
import { makeQcItemRows } from "./qc-items/make-rows";
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
      return { events };
    },
    async (b: Batch) => {
      console.log(
        `🔗 Processing resource events, faculty events, and tasks...`
      );
      const [
        eventHybridRows,
        eventAVConfigRows,
        resourcesEvents,
        facultyEvents,
        eventOtherHardwareRows,
        eventRecordingRows,
      ] = await Promise.all([
        makeEventHybridRows(b.events),
        makeEventAVConfigRows(b.events),
        makeResourceEventsRows(b.events),
        makeFacultyEventsRows(b.events),
        makeEventOtherHardwareRows(b.events),
        makeEventRecordingRows(b.events),
      ]);
      console.log(
        `📦 Found ${eventHybridRows.length} event hybrid rows,
         ${eventAVConfigRows.length} event AV config rows,
          ${resourcesEvents.length} resource events,
           ${facultyEvents.length} faculty events,
           ${eventOtherHardwareRows.length} event other hardware rows,
           ${eventRecordingRows.length} event recording rows`
      );

      console.log(`🔍 Processing capture QC rows and QC items...`);
      const actions = await getActions(
        b.events,
        eventHybridRows,
        eventAVConfigRows,
        eventOtherHardwareRows,
        eventRecordingRows
      );
      const qcItemsRows = await makeQcItemRows(
        b.events,
        actions,
        eventHybridRows,
        eventAVConfigRows,
        eventOtherHardwareRows,
        eventRecordingRows
      );
      console.log(
        `📋 Found ${actions.length} actions, ${qcItemsRows.length} QC item rows`
      );
      return {
        ...b,
        eventHybridRows,
        eventAVConfigRows,
        eventOtherHardwareRows,
        eventRecordingRows,
        actions,
        qcItemsRows,
      };
    }
  );

  console.log(`\n💾 Saving data to database...`);
  await saveEvents([...batch.events], date);
  await Promise.all([
    saveResourceEvents([...batch.resourcesEvents], batch.events, date),
    saveFacultyEvents([...batch.facultyEvents], batch.events, date),
  ]);
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
