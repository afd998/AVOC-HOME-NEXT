import { chromium, type Browser } from "playwright";
import dayjs from "dayjs";
import config from "../config";
import { eq, inArray, InferInsertModel, sql } from "drizzle-orm";
import { events, facultyEvents, faculty, tasks, captureQc } from "../../lib/db/schema";
import { pipe } from "remeda";
import { getEvents } from "./Events/getEvents";
import { getTasks } from "./Tasks/getTasks";
import {
  availabilityResponseSchema,
  eventDetailResponseSchema,
  rawEventSchema,
  type AvailabilitySubject,
  type RawEvent,
} from "./schemas";

import { getResourceEvents } from "./ResourceEvents/getResourceEvents";
import { saveResourceEvents } from "./ResourceEvents/saveResourceEvents";
import { saveEvents } from "./Events/saveEvents";
import { saveTasks } from "./Tasks/saveTasks";
import { getCaptureQc } from "./Tasks/captureQc/getCaptureQc";
import { saveCaptureQc } from "./Tasks/captureQc/saveCaptureQc";
import { getFacultyEvents } from "./FacultyEvents/getFacultyEvents";
import { saveFacultyEvents } from "./FacultyEvents/SaveFacultyEvents";
import { resourceEvents } from "../../lib/db/schema";
import { InferSelectModel } from "drizzle-orm";
import type { RawEvent as RawEventFromSchema } from "./schemas";
import { fetchEventsData } from "./fetchData";

export type CaptureQcRow = InferInsertModel<typeof captureQc>;
export type EventResource = {
  itemName: string;
  quantity: number | null;
  instruction: string | null;
};

export type ProcessedEvent = Omit<
  InferInsertModel<typeof events>,
  "resources"
> & {
  resources: EventResource[];
};
// Validate configuration to ensure all required environment variables are present
config.validate();
export type ResourceEventRow = InferInsertModel<typeof resourceEvents>;
export type FacultyEventRow = InferSelectModel<typeof facultyEvents>;
export type TaskRow = InferInsertModel<typeof tasks>;
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
  type Batch = {
    events: ProcessedEvent[];
    resourcesEvents: ResourceEventRow[];
    facultyEvents: FacultyEventRow[];
    tasks: TaskRow[];
    captureQc: CaptureQcRow[];
  };
  const emptyBatch: Batch = {
    events: [],
    resourcesEvents: [],
    facultyEvents: [],
    tasks: [],
    captureQc: [],
  };
  const browserInstance = await initBrowser();
  const raw = await fetchEventsData(browserInstance, date);
  
  const batch = await pipe(
    raw,
    (raw: RawEvent[]): Batch => {
      const events = getEvents(raw);
      return { ...emptyBatch, events };
    },
    async (b: Batch) => {
      const [resourcesEvents, facultyEvents, tasks] = await Promise.all([
        getResourceEvents(b.events),
        getFacultyEvents(b.events),
        getTasks(b.events),
      ]);
      const batchWithJoins = { ...b, resourcesEvents, facultyEvents, tasks };
      const captureQc = await getCaptureQc(batchWithJoins.tasks);
      return { ...batchWithJoins, captureQc };
    }
  );
  await saveEvents([...batch.events], date);
  await Promise.all([
    saveResourceEvents([...batch.resourcesEvents], batch.events, date),
    saveFacultyEvents([...batch.facultyEvents], batch.events, date),
    saveTasks([...batch.tasks], date),
  ]);
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
  process.exitCode = 1;
  throw error;
});
