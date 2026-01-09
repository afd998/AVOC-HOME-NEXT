"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FacultyAvatar } from "@/core/faculty/FacultyAvatar";
import { ExternalLink } from "lucide-react";

export type FacultyCardData = {
  id: number;
  name: string;
  title: string;
  cutoutImageUrl: string | null;
  imageUrl: string | null;
  rank?: number | null;
  email?: string | null;
  directoryUrl?: string | null;
};

type FacultyCardProps = {
  faculty: FacultyCardData;
  onClick: () => void;
};

export function FacultyCard({ faculty, onClick }: FacultyCardProps) {
  return (
    <div
      className="block w-full cursor-pointer"
      role="link"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <Card className="w-full cursor-pointer hover:bg-accent/50 transition-colors">
        <CardHeader className="flex flex-row items-start gap-3 p-4">
          <FacultyAvatar
            imageUrl={faculty.imageUrl || ""}
            cutoutImageUrl={faculty.cutoutImageUrl || undefined}
            instructorName={faculty.name}
            size="md"
            className="flex-shrink-0"
          />
          <div className="min-w-0 flex-1 space-y-0.5">
            <CardTitle className="text-base flex items-center gap-1.5 flex-wrap">
              <span className="truncate">{faculty.name}</span>
              {faculty.directoryUrl ? (
                <a
                  href={faculty.directoryUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="text-primary hover:underline inline-flex items-center flex-shrink-0"
                  title="Open directory profile"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : null}
            </CardTitle>
            <CardDescription className="text-xs truncate">
              {faculty.title || "No title listed"}
            </CardDescription>
            {faculty.email ? (
              <a
                href={`mailto:${faculty.email}`}
                className="block text-xs text-primary hover:underline truncate"
                onClick={(event) => event.stopPropagation()}
                title={faculty.email}
              >
                {faculty.email}
              </a>
            ) : null}
            {typeof faculty.rank === "number" && (
              <Badge variant="outline" className="text-xs mt-1">
                Rank {faculty.rank.toFixed(2)}
              </Badge>
            )}
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
