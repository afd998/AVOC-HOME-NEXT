"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { SeriesSearchResponse, SeriesSearchRow } from "@/lib/types/series";
import { formatDate } from "@/lib/utils/timeUtils";
import { FacultyItem } from "@/core/faculty/FacultyItem";

const MIN_QUERY_LENGTH = 2;
const PAGE_SIZE = 25;

export default function SeriesSearch() {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<SeriesSearchRow[]>([]);
  const [total, setTotal] = useState(0);
  const [displayQuery, setDisplayQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const normalizedQuery = query.trim();
  const meetsMinLength = normalizedQuery.length >= MIN_QUERY_LENGTH;

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedQuery(normalizedQuery);
    }, 300);

    return () => {
      clearTimeout(handle);
    };
  }, [normalizedQuery]);

  useEffect(() => {
    if (debouncedQuery.length < MIN_QUERY_LENGTH) {
      setResults([]);
      setTotal(0);
      setDisplayQuery("");
      setIsLoading(false);
      setErrorMessage(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setErrorMessage(null);

    const fetchResults = async () => {
      try {
        const response = await fetch(
          `/api/series/search?q=${encodeURIComponent(
            debouncedQuery
          )}&size=${PAGE_SIZE}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch series");
        }

        const payload = (await response.json()) as SeriesSearchResponse;
        const rows = payload.rows ?? [];
        const totalCount =
          typeof payload.total === "number" && Number.isFinite(payload.total)
            ? payload.total
            : rows.length;

        setResults(rows);
        setTotal(totalCount);
        setDisplayQuery(debouncedQuery);
        setIsLoading(false);
      } catch (error) {
        if ((error as Error)?.name === "AbortError") {
          return;
        }

        console.error("[ui] series search", error);
        setIsLoading(false);
        setErrorMessage("Unable to search series right now. Please try again.");
      }
    };

    fetchResults();

    return () => {
      controller.abort();
    };
  }, [debouncedQuery]);

  const statusLabel = useMemo(() => {
    if (!meetsMinLength) {
      return `Enter ${MIN_QUERY_LENGTH}+ characters`;
    }

    if (isLoading) {
      return "Searching...";
    }

    return `${total.toLocaleString()} match${
      total === 1 ? "" : "es"
    } available`;
  }, [meetsMinLength, isLoading, total]);

  const showSkeletons = isLoading && results.length === 0;

  return (
    <div className="space-y-4">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Search Series</CardTitle>
          <CardDescription>
            Lookup academic series by name. Searches run on the server so you
            only download the matches you need.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="relative flex-1 md:max-w-md">
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by series name (e.g., operations, accounting)"
                className="pr-9"
              />
              {isLoading ? (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              ) : null}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground md:ml-auto">
              <Badge variant="secondary">{statusLabel}</Badge>
            </div>
          </div>
          {errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : null}
        </CardContent>
      </Card>

      {!meetsMinLength ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Start typing to search for a series.
          </CardContent>
        </Card>
      ) : showSkeletons ? (
        <ResultsSkeleton />
      ) : results.length > 0 ? (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Showing up to {results.length.toLocaleString()} of{" "}
            {total.toLocaleString()} matches
            {displayQuery ? ` for "${displayQuery}"` : ""}.
          </p>
          {results.map((series) => (
            <SeriesResultCard key={series.id} series={series} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            {displayQuery
              ? `No series found for "${displayQuery}".`
              : "No series found for that search."}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SeriesResultCard({ series }: { series: SeriesSearchRow }) {
  const startDate = series.firstDate ? formatDate(series.firstDate) : "";
  const endDate = series.lastDate ? formatDate(series.lastDate) : "";
  const sameDay =
    Boolean(series.firstDate && series.lastDate) &&
    series.firstDate === series.lastDate;

  const dateRange = sameDay
    ? startDate
    : startDate && endDate
      ? `${startDate} - ${endDate}`
      : startDate || endDate || "Schedule TBD";

  const quarterLabel =
    series.quarter && series.year
      ? `${series.quarter} ${series.year}`
      : series.quarter ?? (series.year ? `${series.year}` : null);

  const seriesType = series.seriesType?.trim() || "Uncategorized";
  const instructors = Array.isArray(series.faculty) ? series.faculty : [];
  const visibleFaculty = instructors.slice(0, 3);
  const extraCount =
    instructors.length > visibleFaculty.length
      ? instructors.length - visibleFaculty.length
      : 0;

  return (
    <Link
      href={`/series/${series.id}`}
      className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      <Card className="transition-colors hover:border-primary/50">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-lg">{series.seriesName}</CardTitle>
              {quarterLabel ? (
                <CardDescription>{quarterLabel}</CardDescription>
              ) : null}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{seriesType}</Badge>
              <Badge variant="secondary">
                {series.totalEvents.toLocaleString()}{" "}
                {series.totalEvents === 1 ? "event" : "events"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <p className="text-muted-foreground">Dates</p>
            <p className="font-medium text-foreground">{dateRange}</p>
          </div>
          {visibleFaculty.length > 0 ? (
            <div className="space-y-2">
              <p className="text-muted-foreground">Instructors</p>
              <div className="flex flex-wrap items-center gap-2">
                {visibleFaculty.map((member) => (
                  <FacultyItem
                    key={`${series.id}-${member.id}`}
                    faculty={member}
                    compact
                  />
                ))}
                {extraCount > 0 ? (
                  <span className="text-xs font-medium text-muted-foreground">
                    +{extraCount} more
                  </span>
                ) : null}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>
    </Link>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
