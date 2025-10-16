"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FacultyAvatar } from "@/core/faculty/FacultyAvatar";
import Link from "next/link";
function useDebounced<T>(value: T, ms = 250) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), ms);
    return () => clearTimeout(timer);
  }, [value, ms]);

  return debouncedValue;
}

type Row = {
  id: number;
  name: string;
  title: string;
  bio: string;
  cutoutImageUrl: string | null;
  imageUrl: string | null;
  rank?: number | null;
};

export default function FacultySearch() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<Row[]>([]);
  const [total, setTotal] = useState(0);
  const [size, setSize] = useState(50);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounced(query, 250);

  const trimmedQuery = debouncedQuery.trim();

  useEffect(() => {
    if (!trimmedQuery) {
      setRows([]);
      setTotal(0);
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchFaculty = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/faculty/search?q=${encodeURIComponent(
            trimmedQuery
          )}&page=${page}&size=${size}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch faculty results");
        }

        const data = await response.json();
        if (controller.signal.aborted) return;

        setRows((data.rows ?? []) as Row[]);
        setTotal(typeof data.total === "number" ? data.total : 0);
        if (typeof data.size === "number" && data.size !== size) {
          setSize(data.size);
        }
      } catch (error) {
        if ((error as Error).name === "AbortError") {
          return;
        }
        // Best-effort logging for troubleshooting without interrupting UX
        console.error("Faculty search failed", error);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchFaculty();

    return () => {
      controller.abort();
    };
  }, [trimmedQuery, page, size]);

  const canPrev = page > 0;
  const canNext = (page + 1) * size < total;
  const showingStart = total > 0 ? page * size + 1 : 0;
  const showingEnd = total > 0 ? Math.min((page + 1) * size, total) : total;
  const hasQuery = Boolean(trimmedQuery.length);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Faculty Directory</CardTitle>
          <CardDescription>
            Search for Kellogg faculty by name, title, or keywords.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(0);
              }}
              placeholder="Search faculty... (e.g., analytics, marketing, smith)"
              className="md:max-w-md"
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground md:ml-auto">
              {loading ? (
                <Badge variant="secondary">Searching...</Badge>
              ) : hasQuery ? (
                total ? (
                  <span>
                    {total.toLocaleString()} match
                    {total === 1 ? "" : "es"}
                  </span>
                ) : (
                  <span>No matches yet</span>
                )
              ) : (
                <span>Start typing to search</span>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canPrev}
            onClick={() => setPage((current) => Math.max(current - 1, 0))}
          >
            Prev
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={!canNext}
            onClick={() => setPage((current) => current + 1)}
          >
            Next
          </Button>
          {total > 0 ? (
            <span className="ml-auto text-sm text-muted-foreground">
              Showing {showingStart}-{showingEnd} of {total.toLocaleString()}
            </span>
          ) : hasQuery && !loading ? (
            <span className="ml-auto text-sm text-muted-foreground">
              No results
            </span>
          ) : null}
        </CardFooter>
      </Card>

      <div className="grid gap-4">
        {rows.length > 0 ? (
          rows.map((row) => (
            <Link href={`/faculty/${row.id}`} key={row.id}>
              <Card key={row.id}>
                <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start">
                  <FacultyAvatar
                    imageUrl={row.imageUrl || ""}
                    cutoutImageUrl={row.cutoutImageUrl || undefined}
                    instructorName={row.name}
                 
                    size="lg"
                    className="mx-auto md:mx-0"
                  />
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{row.name}</CardTitle>
                    <CardDescription>
                      {row.title || "No title listed"}
                    </CardDescription>
                  </div>
                </CardHeader>
                {row.bio && (
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {row.bio}
                    </p>
                  </CardContent>
                )}
                {typeof row.rank === "number" && (
                  <CardFooter className="pt-0">
                    <Badge variant="outline">Rank {row.rank.toFixed(2)}</Badge>
                  </CardFooter>
                )}
              </Card>
            </Link>
          ))
        ) : hasQuery && !loading ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No faculty found for "{debouncedQuery}".
            </CardContent>
          </Card>
        ) : !hasQuery ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Enter a query to explore faculty profiles.
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
