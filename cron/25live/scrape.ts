/**
 * 25Live Event Scraper
 * 
 * This module scrapes event data from Northwestern's 25Live system (a room booking/event management platform).
 * It uses Playwright to automate browser interactions for authentication, then makes API calls to fetch
 * event availability data and detailed event information.
 */

import { chromium, type Browser } from "playwright";
import dayjs from "dayjs";
import config from "../config";
import { eq, inArray, sql } from "drizzle-orm";
import { db } from "../../lib/db";
import { events, facultyEvents, faculty } from "../../lib/db/schema";
import {
  transformRawEventsToEvents,
  type RawEvent,
  type ProcessedEvent,
} from "./transformRawEventsToEvents";

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

/**
 * Fetch event data from 25Live system for a specific date
 * 
 * This function:
 * 1. Opens a browser and navigates to 25Live
 * 2. Performs automated login using Northwestern credentials
 * 3. Extracts authentication cookies
 * 4. Makes API calls to fetch event availability data
 * 5. Fetches detailed information for each event
 * 
 * @param startDate - Date in YYYY-MM-DD format to fetch events for
 * @returns Array of raw event data with details
 */
async function fetchEventsData(startDate: string): Promise<RawEvent[]> {
  const activeBrowser = await initBrowser();
  const context = await activeBrowser.newContext();
  const page = await context.newPage();

  try {
    // Navigate to 25Live availability page
    await page.goto(
      "https://25live.collegenet.com/pro/northwestern#!/home/availability"
    );
    
    // Wait for and click the sign-in button
    await page.waitForSelector(".c-nav-signin");
    await page.click(".c-nav-signin");
    
    // Fill in login credentials
    await page.waitForSelector('input[id="idToken1"]');
    await page.fill('input[id="idToken1"]', config.northwestern.username ?? "");
    await page.fill('input[id="idToken2"]', config.northwestern.password ?? "");
    await page.click('input[id="loginButton_0"]');
    
    // Wait for successful login and navigation to availability page
    await page.waitForNavigation();
    await page.waitForSelector('div[ui-view="availability"]');

    // Extract authentication cookies from the browser session
    // These cookies are needed for subsequent API calls to maintain authentication
    const cookies = await context.cookies();
    const cookieString = cookies
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; ");

    // Construct API URL for fetching availability data
    // This endpoint returns event availability information for the specified date
    const apiUrl = `https://25live.collegenet.com/25live/data/northwestern/run/availability/availabilitydata.json?obj_cache_accl=0&start_dt=${startDate}T00:00:00&comptype=availability_home&compsubject=location&page_size=100&space_favorite=T&include=closed+blackouts+pending+related+empty&caller=pro-AvailService.getData`;

    // Make authenticated API request to fetch availability data
    const response = await fetch(apiUrl, {
      headers: {
        Cookie: cookieString,
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Availability request failed with status ${response.status}`
      );
    }

    // Parse the JSON response containing event availability data
    const rawData: {
      subjects?: Array<Record<string, unknown>>;
    } = await response.json();

    // Return empty array if no subjects (event categories) are found
    if (!rawData.subjects) {
      return [];
    }

    /**
     * Process and flatten the raw event data structure
     * 
     * The 25Live API returns data in a hierarchical structure where:
     * - Each "subject" represents a category/group of events (e.g., "Academic Events", "Student Events")
     * - Each subject contains an "items" array with individual event data
     * - Each subject also has metadata properties (like subject name, type, etc.)
     * 
     * This processing step:
     * 1. Filters out subjects that don't have valid items arrays
     * 2. Flattens the hierarchical structure into a single array of events
     * 3. Merges subject metadata into each individual event item
     * 4. Prefixes subject properties with "subject_" to avoid naming conflicts
     */
    const processedData = rawData.subjects
      // Filter: Only keep subjects that have a valid items array
      .filter(
        (subject): subject is Record<string, unknown> & { items: RawEvent[] } =>
          Array.isArray((subject as { items?: unknown }).items)
      )
      // Reduce: Flatten the hierarchical structure into a single array
      .reduce<RawEvent[]>((acc, subject) => {
        // Destructure: Separate items array from other subject properties
        const { items, ...rest } = subject as { items: RawEvent[] } & Record<
          string,
          unknown
        >;
        
        // Transform subject metadata: Add "subject_" prefix to avoid conflicts
        const subjectData = Object.entries(rest).reduce<
          Record<string, unknown>
        >((obj, [key, value]) => {
          if (key !== "items") {
            // Prefix with "subject_" to distinguish from event properties
            obj[`subject_${key}`] = value;
          }
          return obj;
        }, {});

        // Merge: Combine each event item with its subject metadata
        const itemsWithSubject = items.map((item) => ({
          ...item,        // Original event data
          ...subjectData, // Subject metadata (prefixed with "subject_")
        }));

        // Accumulate: Add all processed events to the result array
        return [...acc, ...itemsWithSubject];
      }, []);

    /**
     * Fetch detailed information for each event
     * 
     * The initial API call only provides basic event information. This step fetches
     * detailed information for each event by making individual API calls.
     * 
     * Rate limiting: Adds a 200ms delay every 5 requests to avoid overwhelming the server
     */
    const detailPromises = processedData.map(async (item, index) => {
      // Rate limiting: Add delay every 5 requests to be respectful to the server
      if (index > 0 && index % 5 === 0) {
        await new Promise((resolve) => setTimeout(resolve, 200));
      }

      // Fetch detailed event information using the event's itemId
      const detailResponse = await fetch(
        `https://25live.collegenet.com/25live/data/northwestern/run/event/detail/evdetail.json?event_id=${item.itemId}&caller=pro-EvdetailDao.get`,
        {
          headers: {
            Cookie: cookieString, // Use same authentication cookies
          },
        }
      );

      // Handle failed detail requests gracefully
      if (!detailResponse.ok) {
        return {
          ...item,
          itemDetails: undefined, // Use undefined instead of null to match RawEvent type
          error: `Detail request failed with status ${detailResponse.status}`,
        };
      }

      // Parse the detailed event information
      const itemDetails = await detailResponse.json();

      // Return the original event data combined with detailed information
      return {
        ...item,
        itemDetails: itemDetails.evdetail, // Extract the actual detail data
      };
    });

    // Wait for all detail requests to complete and return the combined data
    return await Promise.all(detailPromises);
  } catch (error) {
    // Handle browser closure errors by retrying with a fresh browser instance
    if (
      error instanceof Error &&
      error.message.includes("Target page, context or browser has been closed")
    ) {
      browser = null; // Reset browser instance
      await initBrowser(); // Create new browser
      return fetchEventsData(startDate); // Retry the operation
    }
    throw error;
  } finally {
    // Always close the browser context to free up resources
    await context.close();
  }
}

/**
 * Save processed events to the database
 * 
 * This function handles the database operations for storing scraped event data:
 * 1. Identifies events that no longer exist (deleted events)
 * 2. Removes deleted events and their associated faculty assignments
 * 3. Inserts new events or updates existing ones using upsert logic
 * 
 * @param processedEvents - Array of processed event data to save
 * @param scrapeDate - Date string for the events being processed
 */
async function saveEvents(
  processedEvents: ProcessedEvent[],
  scrapeDate: string
): Promise<void> {
  console.log(`\n📅 Saving events for date: ${scrapeDate}`);
  console.log(`📊 Processing ${processedEvents.length} events`);
  
  // Get all existing events for the specified date
  const existingEvents = await db
    .select({ id: events.id })
    .from(events)
    .where(eq(events.date, scrapeDate));
  
  console.log(`🗃️  Found ${existingEvents.length} existing events in database`);

  // Create a set of current event IDs for efficient lookup
  const currentEventIds = new Set(
    processedEvents
      .map((event) => event.id)
      .filter((id): id is number => typeof id === "number")
  );

  // Find events that exist in the database but not in the current scrape (deleted events)
  const deletedEventIds = existingEvents
    .map(({ id }) => id)
    .filter((id): id is number => !currentEventIds.has(id));

  console.log(`🗑️  Found ${deletedEventIds.length} events to delete`);

  // Remove deleted events and their associated faculty assignments
  if (deletedEventIds.length > 0) {
    console.log(`🧹 Deleting ${deletedEventIds.length} obsolete events...`);
    
    // First delete faculty event assignments (foreign key constraint)
    const deletedFacultyEvents = await db
      .delete(facultyEvents)
      .where(inArray(facultyEvents.event, deletedEventIds));
    console.log(`👥 Deleted faculty event assignments for obsolete events`);

    // Then delete the events themselves
    await db.delete(events).where(inArray(events.id, deletedEventIds));
    console.log(`✅ Deleted ${deletedEventIds.length} obsolete events`);
  }

  // If no events to save, exit early
  if (processedEvents.length === 0) {
    console.log(`⚠️  No events to save, exiting early`);
    return;
  }

  const processedEventIds = processedEvents
    .map((event) => event.id)
    .filter((id): id is number => typeof id === "number");

  const instructorNameSet = new Set<string>();
  processedEvents.forEach((event) => {
    if (!Array.isArray(event.instructorNames)) {
      return;
    }

    event.instructorNames.forEach((name) => {
      if (typeof name !== "string") {
        return;
      }

      const trimmedName = name.trim();
      if (trimmedName.length > 0) {
        instructorNameSet.add(trimmedName);
      }
    });
  });

  const instructorNames = Array.from(instructorNameSet);
  const facultyByName = new Map<string, number>();

  console.log(`👨‍🏫 Found ${instructorNames.length} unique instructor names`);

  if (instructorNames.length > 0) {
    const facultyMatches = await db
      .select({
        id: faculty.id,
        name: faculty.twentyfiveliveName,
      })
      .from(faculty)
      .where(inArray(faculty.twentyfiveliveName, instructorNames));

    console.log(`🔍 Matched ${facultyMatches.length} instructors in faculty database`);

    facultyMatches.forEach(({ id, name }) => {
      if (name) {
        facultyByName.set(name.trim(), id);
      }
    });
  }

  const facultyEventRows: Array<{ event: number; faculty: number }> = [];
  const seenPairs = new Set<string>();

  processedEvents.forEach((event) => {
    if (typeof event.id !== "number" || !Array.isArray(event.instructorNames)) {
      return;
    }

    event.instructorNames.forEach((name) => {
      if (typeof name !== "string") {
        return;
      }

      const trimmedName = name.trim();
      if (!trimmedName) {
        return;
      }

      const facultyId = facultyByName.get(trimmedName);
      if (!facultyId) {
        return;
      }

      const pairKey = `${event.id}-${facultyId}`;
      if (seenPairs.has(pairKey)) {
        return;
      }

      seenPairs.add(pairKey);
      facultyEventRows.push({
        event: event.id as number,
        faculty: facultyId,
      });
    });
  });

  console.log(`🔗 Created ${facultyEventRows.length} faculty-event relationships`);

  // Insert new events or update existing ones (upsert operation)
  console.log(`💾 Upserting ${processedEvents.length} events...`);
  await db
    .insert(events)
    .values(processedEvents)
    .onConflictDoUpdate({
      target: events.id, // Conflict resolution based on event ID
      set: {
        // Update all fields with new values from the scrape
        date: sql`excluded.date`,
        eventType: sql`excluded.event_type`,
        lectureTitle: sql`excluded.lecture_title`,
        roomName: sql`excluded.room_name`,
        resources: sql`excluded.resources`,
        itemId: sql`excluded.item_id`,
        itemId2: sql`excluded.item_id2`,
        startTime: sql`excluded.start_time`,
        endTime: sql`excluded.end_time`,
        raw: sql`excluded.raw`,
        eventName: sql`excluded.event_name`,
        updatedAt: sql`excluded.updated_at`,
        organization: sql`excluded.organization`,
        instructorNames: sql`excluded.instructor_names`,
      },
    });
  console.log(`✅ Successfully upserted events`);

  if (processedEventIds.length > 0) {
    console.log(`🧹 Cleaning up existing faculty-event relationships...`);
    await db
      .delete(facultyEvents)
      .where(inArray(facultyEvents.event, processedEventIds));
    console.log(`🗑️  Deleted existing faculty-event relationships`);
  }

  if (facultyEventRows.length > 0) {
    console.log(`👥 Inserting ${facultyEventRows.length} faculty-event relationships...`);
    await db.insert(facultyEvents).values(facultyEventRows);
    console.log(`✅ Successfully inserted faculty-event relationships`);
  }

  console.log(`🎉 Save events completed for ${scrapeDate}\n`);
}

/**
 * Main execution function
 * 
 * Orchestrates the entire scraping process:
 * 1. Determines the target date (can be offset from today)
 * 2. Fetches raw event data from 25Live
 * 3. Transforms raw data into processed events
 * 4. Saves processed events to the database
 */
async function main(): Promise<void> {
  // Parse command line argument for date offset (defaults to 0 = today)
  const offset = Number.parseInt(process.argv[2] ?? "0", 10);
  const date = dayjs().add(offset, "day").format("YYYY-MM-DD");
  
  // Initialize browser and perform the scraping workflow
  await initBrowser();
  const data = await fetchEventsData(date);
  const processedEvents = transformRawEventsToEvents(data);
  await saveEvents(processedEvents, date);
}

/**
 * Script entry point with proper error handling and cleanup
 * 
 * This immediately invoked async function (IIFE) ensures:
 * - Browser resources are properly cleaned up
 * - Process exit codes are set correctly for error conditions
 * - Errors are properly propagated
 */
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
