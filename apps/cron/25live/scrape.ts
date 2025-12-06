import { chromium, type Browser } from "playwright";
import dayjs from "dayjs";
import config from "../config";
import { makeEventRows } from "./events/make-rows";
import { makeResourceEventsRows } from "./resourse-events/make-rows";
import { saveResourceEvents } from "./resourse-events/save-rows";
import { saveEvents, updateEventSeriesPositions } from "./events/save-rows";
import { makeSeriesFacultyRows } from "./series-faculty/make-rows";
import { saveSeriesFaculty } from "./series-faculty/save-rows";
import { fetchSeriesData } from "./fetchData";
import { saveQcItemRows } from "./qc-items/save-rows";
import { getActions } from "./actions/make-rows";
import { enrichEvents } from "./events/enrich-events";
import { flattenEnrichedEvents } from "./events/flatten-enriched-events";
import { makeQcItemRows } from "./qc-items/make-rows";
import { saveEventHybridRows } from "./event-hybrid/save-rows";
import { saveEventAVConfigRows } from "./event-av-config/save-rows";
import { saveEventOtherHardwareRows } from "./event-other-hardware/save-rows";
import { saveEventRecordingRows } from "./event-recording/save-rows";
import { saveActions } from "./actions/save-rows";
import { pgPool } from "shared";
import { partitionEventsByStart } from "./utils/event-filters";
import { makeSeriesRows } from "./series/make-rows";
import { saveSeries, computeSeriesPositions } from "./series/save-rows";
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
  // Filter out '--' which pnpm may pass through when using `pnpm run scrape -- <offset>`
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  const offset = Number.parseInt(args[0] ?? "0", 10);
  const date = dayjs().add(offset, "day").format("YYYY-MM-DD");
  console.log(`\n🚀 Starting scrape for date: ${date}`);

  const browserInstance = await initBrowser();
  console.log(`📥 Fetching raw series data...`);
  const raw = await fetchSeriesData(browserInstance, date);
  console.log(`✅ Fetched ${raw.length} raw series`);

  // Create series rows from raw data (dedupe by id)
  console.log(`🔄 Processing series...`);
  const seriesRows = makeSeriesRows(raw);
  console.log(`📊 Created ${seriesRows.length} series rows`);

  // Create events by exploding reservations
  console.log(`🔄 Processing events from reservations...`);
  const events = await makeEventRows(raw, seriesRows);
  console.log(`📊 Created ${events.length} events`);

  // Create series-faculty rows (from series, not events)
  const seriesFacultyRows = await makeSeriesFacultyRows(raw, seriesRows);
  console.log(`👥 Created ${seriesFacultyRows.length} series-faculty rows`);

  // Collect unique series IDs for later processing
  const seriesIds = seriesRows
    .map((s) => s.id)
    .filter((id): id is number => id != null);

  const now = dayjs();
  const { futureEvents, startedEvents } = partitionEventsByStart(events, now);
  if (startedEvents.length > 0) {
    const startedIds = startedEvents
      .map((event) => event.id)
      .filter((id): id is number => typeof id === "number");
    console.log(
      `⏸️ Skipping ${startedEvents.length} events that already started: ${
        startedIds.length > 0 ? startedIds.join(", ") : "no IDs available"
      }`
    );
  } else {
    console.log(`▶️ No already-started events found for ${date}`);
  }

  console.log(`🔗 Processing resource events and enriching events...`);

  // Process resource events (doesn't need enriched events)
  const resourcesEvents = await makeResourceEventsRows(futureEvents);

  // Enrich events with extension data
  const enrichedEvents = enrichEvents(futureEvents);

  console.log(`🔍 Processing actions and QC items...`);
  const actions = await getActions(enrichedEvents);
  const qcItemsRows = await makeQcItemRows(enrichedEvents, actions);
  console.log(
    `📋 Found ${actions.length} actions, ${qcItemsRows.length} QC item rows`
  );

  const batch = {
    events: futureEvents,
    enrichedEvents,
    resourcesEvents,
    seriesFacultyRows,
    actions,
    qcItemsRows,
  };

  console.log(`\n💾 Saving data to database...`);

  // Flatten enriched events for saving
  const {
    eventHybridRows,
    eventAVConfigRows,
    eventOtherHardwareRows,
    eventRecordingRows,
  } = flattenEnrichedEvents(batch.enrichedEvents);

  // Save series first (for FK constraint)
  await saveSeries(seriesRows);
  console.log(`📚 Saved ${seriesRows.length} series`);

  // Save events
  const startedEventIds = startedEvents
    .map((event) => event.id)
    .filter((id): id is number => typeof id === "number");

  await saveEvents([...batch.events], date, startedEventIds);

  // Compute and update event positions based on all events in each series
  const positionMap = await computeSeriesPositions(seriesIds);
  await updateEventSeriesPositions(positionMap);
  console.log(`📚 Updated ${positionMap.size} event positions`);

  // Save extension tables and related data in parallel
  await Promise.all([
    saveEventHybridRows(eventHybridRows, batch.enrichedEvents),
    saveEventAVConfigRows(eventAVConfigRows),
    saveEventOtherHardwareRows(eventOtherHardwareRows, batch.enrichedEvents),
    saveEventRecordingRows(eventRecordingRows, batch.enrichedEvents),
    saveResourceEvents([...batch.resourcesEvents], batch.events, date),
    saveSeriesFaculty(batch.seriesFacultyRows, seriesRows),
  ]);

  // Save actions (QC items depend on these)
  await saveActions(batch.actions, date);

  // Save QC items last (depends on actions being saved)
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
    // Close database connection pool to prevent connection termination errors
    await pgPool.end();
  }
})().catch((error) => {
  // Set exit code to indicate failure for process monitoring tools
  console.error(`\n❌ Scrape failed with error:`, error);
  process.exitCode = 1;
  throw error;
});
