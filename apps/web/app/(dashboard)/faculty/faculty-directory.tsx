"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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
import { ExternalLink } from "lucide-react";
import { FacultyIcon } from "@/app/(dashboard)/components/sidebar/faculty-icon";

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
  const router = useRouter();
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
  const navigateToFaculty = (id: number) => {
    router.push(`/faculty/${id}`);
  };

  return (
    <div className="mx-auto flex w-full flex-1 min-h-0 flex-col gap-8 px-6 py-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
        <Card className="bg-background shadow-md md:sticky md:top-4 md:w-[30rem] md:flex-shrink-0 md:self-start">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FacultyIcon className="h-5 w-5" />
              <span>Faculty Directory</span>
            </CardTitle>
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
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground md:ml-auto">
                <Badge variant="secondary">
                  {hasQuery
                    ? `${totalLabel.toLocaleString()} match${
                        totalLabel === 1 ? "" : "es"
                      }`
                    : faculty.length.toLocaleString()}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex-1 grid gap-4 w-full max-h-[40rem] overflow-y-auto pr-1 min-w-0">
          {rows.length > 0 ? (
            rows.map((row) => (
              <div
                key={row.id}
                className="block w-full cursor-pointer"
                role="link"
                tabIndex={0}
                onClick={() => navigateToFaculty(row.id)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    navigateToFaculty(row.id);
                  }
                }}
              >
                <Card className="w-full cursor-pointer">
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
                        (() => {
                          const displayEmail =
                            row.email.length > 50
                              ? `${row.email.slice(0, 50)}…`
                              : row.email;
                          return (
                        <a
                          href={`mailto:${row.email}`}
                          className="block text-sm text-primary hover:underline truncate"
                          onClick={(event) => event.stopPropagation()}
                          title={row.email}
                        >
                          {displayEmail}
                        </a>
                          );
                        })()
                      ) : null}
                    </div>
                  </CardHeader>
                  {typeof row.rank === "number" && (
                    <CardFooter className="pt-0">
                      <Badge variant="outline">Rank {row.rank.toFixed(2)}</Badge>
                    </CardFooter>
                  )}
                </Card>
              </div>
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
    </div>
  );
}
