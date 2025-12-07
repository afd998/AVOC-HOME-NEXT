"use client";

import { useMemo, useState } from "react";

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
import { ExternalLink } from "lucide-react";

type Row = {
  id: number;
  name: string;
  title: string;
  bio: string;
  cutoutImageUrl: string | null;
  imageUrl: string | null;
  rank?: number | null;
  email?: string | null;
  directoryUrl?: string | null;
};

type FacultyRecord = {
  id: number;
  kelloggdirectoryName?: string | null;
  twentyfiveliveName?: string | null;
  kelloggdirectoryTitle?: string | null;
  kelloggdirectoryBio?: string | null;
  cutoutImage?: string | null;
  kelloggdirectoryImageUrl?: string | null;
  email?: string | null;
  kelloggdirectoryBioUrl?: string | null;
};

export default function FacultySearch({ faculty }: { faculty: FacultyRecord[] }) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLocaleLowerCase("en-US");

  const filteredRows = useMemo(() => {
    const hasQuery = normalizedQuery.length > 0;
    const filtered = hasQuery
      ? faculty.filter((person) => {
          const fields = [
            person.kelloggdirectoryName ?? "",
            person.twentyfiveliveName ?? "",
          ].map((value) => value.toLocaleLowerCase("en-US"));

          return fields.some((field) => field.includes(normalizedQuery));
        })
      : faculty;

    return filtered.map((person) => ({
      id: person.id,
      name:
        person.kelloggdirectoryName ??
        person.twentyfiveliveName ??
        "Unknown",
      title: person.kelloggdirectoryTitle ?? "",
      bio: person.kelloggdirectoryBio ?? "",
      cutoutImageUrl: person.cutoutImage ?? null,
      imageUrl: person.kelloggdirectoryImageUrl ?? null,
      email: person.email ?? null,
      directoryUrl: person.kelloggdirectoryBioUrl ?? null,
    }));
  }, [faculty, normalizedQuery]);

  const total = filteredRows.length;
  const rows = filteredRows;
  const hasQuery = Boolean(normalizedQuery.length);
  const totalLabel = hasQuery ? total : faculty.length;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4">
      <Card className="bg-background shadow-md">
        <CardHeader>
          <CardTitle>Faculty Directory</CardTitle>
          <CardDescription>
            Search for Kellogg faculty by directory name or 25Live name.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <Input
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
              }}
              placeholder="Search faculty by name... (e.g., smith, john)"
              className="md:max-w-md"
            />
            <div className="flex items-center gap-2 text-sm text-muted-foreground md:ml-auto">
              <Badge variant="secondary">
                {hasQuery
                  ? `${totalLabel.toLocaleString()} match${
                      totalLabel === 1 ? "" : "es"
                    }`
                  : `${faculty.length.toLocaleString()} total`}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 w-full max-h-[40rem] overflow-y-auto pr-1 mt-2 pt-2">
        {rows.length > 0 ? (
          rows.map((row) => (
            <Link href={`/faculty/${row.id}`} key={row.id} className="block w-full">
              <Card key={row.id} className="w-full">
                  <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start">
                    <FacultyAvatar
                      imageUrl={row.imageUrl || ""}
                      cutoutImageUrl={row.cutoutImageUrl || undefined}
                      instructorName={row.name}
                 
                      size="lg"
                      className="mx-auto md:mx-0"
                    />
                    <div className="space-y-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="break-words">{row.name}</span>
                      {row.directoryUrl ? (
                        <a
                          href={row.directoryUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(event) => event.stopPropagation()}
                          className="text-primary hover:underline inline-flex items-center gap-1 text-sm"
                          title="Open directory profile"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : null}
                    </CardTitle>
                    <CardDescription className="break-words">
                      {row.title || "No title listed"}
                    </CardDescription>
                    {row.email ? (
                      <a
                        href={`mailto:${row.email}`}
                        className="block text-sm text-primary hover:underline break-words"
                        onClick={(event) => event.stopPropagation()}
                      >
                        {row.email}
                      </a>
                    ) : null}
                  </div>
                </CardHeader>
                {typeof row.rank === "number" && (
                  <CardFooter className="pt-0">
                    <Badge variant="outline">Rank {row.rank.toFixed(2)}</Badge>
                  </CardFooter>
                )}
              </Card>
            </Link>
          ))
        ) : hasQuery ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              No faculty found for "{query}".
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
