import { type SeriesRow } from "shared";
import { type RawEvent } from "../schemas";
import { getEventType } from "../events/index";
import { filterNonAcademicKECSeries } from "./utils";

/**
 * Creates series rows from raw fetched data.
 * Each raw item represents a series with multiple reservations (events) inside.
 * Series data is extracted from itemDetails.occur.prof[0].rsv array.
 */
export function makeSeriesRows(rawData: RawEvent[]): SeriesRow[] {
  const seriesMap = new Map<number, SeriesRow>();

  const filteredSeries = filterNonAcademicKECSeries(rawData).filter((item) => {
    const isPrivateEvent =
      item.itemId === 0 &&
      (item.itemName === "(Private)" || item.itemName === "Closed");

    // Drop invalid/empty series up front so we don't insert bad dates/ids
    if (
      isPrivateEvent ||
      !item.itemId ||
      item.itemId === 0 ||
      item.itemId2 === 0 ||
      item.subject_itemName?.includes("&")
    ) {
      return false;
    }

    const rsv = item.itemDetails?.occur?.prof?.[0]?.rsv ?? [];
    const dates = rsv
      .map((r) => r.reservation_start_dt?.split("T")[0])
      .filter((d): d is string => d != null && d.length > 0);

    return rsv.length > 0 && dates.length > 0;
  });

  for (const item of filteredSeries) {
    // Skip if we've already processed this series
    if (seriesMap.has(item.itemId)) {
      continue;
    }

    // Get reservations from the nested structure
    const rsv = item.itemDetails?.occur?.prof?.[0]?.rsv ?? [];

    // Extract and sort dates from reservations
    const dates = rsv
      .map((r) => r.reservation_start_dt?.split("T")[0])
      .filter((d): d is string => d != null && d.length > 0)
      .sort();

    const firstDate = dates[0];
    const lastDate = dates[dates.length - 1];

    if (!firstDate || !lastDate) {
      continue;
    }

    seriesMap.set(item.itemId, {
      id: item.itemId,
      createdAt: new Date().toISOString(),
      seriesName: item.itemName ?? "",
      seriesType: getEventType(item) ?? "",
      totalEvents: rsv.length,
      firstDate,
      lastDate,
      raw: item,
    });
  }

  return Array.from(seriesMap.values());
}
