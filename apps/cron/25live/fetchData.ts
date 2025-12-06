import { type Browser } from "playwright";
import config from "../config";
import { type RawEvent, availabilityResponseSchema, rawEventSchema, eventDetailResponseSchema, type AvailabilitySubject } from "./schemas";

export async function fetchSeriesData(browser: Browser, startDate: string): Promise<RawEvent[]> {
  const activeBrowser = browser;
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
    console.log("Username loaded:", config.northwestern.username ? "✓" : "✗ MISSING");
    console.log("Password loaded:", config.northwestern.password ? "✓" : "✗ MISSING");
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

    // Parse and validate the JSON response containing event availability data
    const availabilityJson = await response.json();
    const availability = availabilityResponseSchema.parse(availabilityJson);
    const subjects = availability.subjects ?? [];

    // Return empty array if no subjects (event categories) are found
    if (subjects.length === 0) {
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
    const processedData = subjects.reduce<RawEvent[]>((acc, subject) => {
      if (!Array.isArray(subject.items)) {
        return acc;
      }

      // Destructure: Separate items array from other subject properties
      const { items, ...rest } = subject as AvailabilitySubject & {
        items: NonNullable<AvailabilitySubject["items"]>;
      };

      // Transform subject metadata: Add "subject_" prefix to avoid conflicts
      const subjectData = Object.entries(
        rest as Record<string, unknown>
      ).reduce<Record<string, unknown>>((obj, [key, value]) => {
        if (key !== "items") {
          // Prefix with "subject_" to distinguish from event properties
          obj[`subject_${key}`] = value;
        }
        return obj;
      }, {});

      // Merge: Combine each event item with its subject metadata and validate
      const itemsWithSubject = items.map((item) =>
        rawEventSchema.parse({
          ...item, // Original event data
          ...subjectData, // Subject metadata (prefixed with "subject_")
        })
      );

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

      // Parse and validate the detailed event information
      const detailJson = await detailResponse.json();
      const detailData = eventDetailResponseSchema.parse(detailJson).evdetail;

      // Return the original event data combined with detailed information
      return {
        ...item,
        itemDetails: detailData, // Extract the actual detail data
      };
    });

    // Wait for all detail requests to complete and return the combined data
    return await Promise.all(detailPromises);
  } catch (error) {
    // Re-throw browser closure errors - let the caller handle browser recreation
    if (
      error instanceof Error &&
      error.message.includes("Target page, context or browser has been closed")
    ) {
      throw new Error("Browser was closed during operation");
    }
    throw error;
  } finally {
    // Always close the browser context to free up resources
    await context.close();
  }
}
