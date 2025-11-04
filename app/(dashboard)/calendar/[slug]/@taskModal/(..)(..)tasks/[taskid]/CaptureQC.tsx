"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@/components/ui/item";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { HydratedTask } from "@/lib/data/calendar/taskscalendar";

type CaptureQCProps = {
  task: HydratedTask;
};

type QCStatus = "pass" | "fail" | "pending";

type CaptureQcFormValues = {
  programVideoCamera: QCStatus;
  programVideoContent1: QCStatus;
  programVideoContent2: QCStatus;
  programAudio: QCStatus;
};

const statusFromValue = (value: boolean | null | undefined): QCStatus => {
  if (value === true) {
    return "pass";
  }
  if (value === false) {
    return "fail";
  }
  return "pending";
};

export default function CaptureQC({ task }: CaptureQCProps) {
  const referenceNumber = task.id;
  const scheduledTime = task.startTime;
  const captureQc = task.captureQcDetails ?? null;

  const defaultValues = useMemo<CaptureQcFormValues>(
    () => ({
      programVideoCamera: statusFromValue(captureQc?.programVideoCamera),
      programVideoContent1: statusFromValue(captureQc?.programVideoContent1),
      programVideoContent2: statusFromValue(captureQc?.programVideoContent2),
      programAudio: statusFromValue(captureQc?.programAudio),
    }),
    [
      captureQc?.programAudio,
      captureQc?.programVideoCamera,
      captureQc?.programVideoContent1,
      captureQc?.programVideoContent2,
    ]
  );

  const form = useForm<CaptureQcFormValues>({
    defaultValues,
  });

  useEffect(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  const checklistItems: ReadonlyArray<{
    label: string;
    description: string;
    name: keyof CaptureQcFormValues;
  }> = [
    {
      label: "Program Video Camera",
      description: "Confirm the primary camera feed is live and stable.",
      name: "programVideoCamera",
    },
    {
      label: "Program Video Content Feed 1",
      description: "Verify the primary content share is displaying correctly.",
      name: "programVideoContent1",
    },
    {
      label: "Program Video Content Feed 2",
      description: "Check any secondary content feed or backup display.",
      name: "programVideoContent2",
    },
    {
      label: "Program Audio",
      description: "Ensure the program audio is audible and balanced.",
      name: "programAudio",
    },
  ];

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold uppercase text-muted-foreground">
        Capture QC
      </h3>
      <Item className="flex flex-col gap-2" variant="outline" size="sm">
        <ItemContent className="flex flex-col gap-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <ItemTitle className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Quality Checklist
            </ItemTitle>
            <Button
              variant="secondary"
              size="sm"
              asChild
              className="flex items-center gap-2 self-start uppercase tracking-wide sm:self-auto"
            >
              <Link
                href="https://kellogg-northwestern.hosted.panopto.com/Panopto/Pages/Sessions/List.aspx#status=%5B2%2C5%5D"
                target="_blank"
                rel="noopener noreferrer"
              >
                Panopto
                <ExternalLink className="size-4" aria-hidden="true" />
              </Link>
            </Button>
          </div>
          <ItemDescription className="whitespace-pre-wrap text-sm text-foreground">
            Review the capture setup on-site and confirm recording readiness before the scheduled start.
            Use the task panel to log any issues you uncover and sync with operations staff if follow-up is required.
          </ItemDescription>
          <form className="mt-3 space-y-3" onSubmit={form.handleSubmit(() => {})}>
            {checklistItems.map(({ label, description, name }) => (
              <div
                key={name}
                className="flex flex-col gap-2 rounded-md border border-border px-3 py-3 text-sm sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {label}
                  </span>
                  <span className="text-xs text-muted-foreground">{description}</span>
                </div>
                <Controller
                  name={name}
                  control={form.control}
                  render={({ field }) => (
                    <ToggleGroup
                      type="single"
                      variant="outline"
                      size="sm"
                      spacing={0}
                      value={field.value}
                      onValueChange={(nextValue) => field.onChange((nextValue as QCStatus) || "pending")}
                      className="self-start sm:self-auto"
                    >
                      <ToggleGroupItem
                        value="pending"
                        aria-label={`${label} pending`}
                        className="data-[state=on]:bg-muted data-[state=on]:text-foreground"
                      >
                        Pending
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="pass"
                        aria-label={`${label} passed`}
                        className="data-[state=on]:bg-emerald-500 data-[state=on]:text-white"
                      >
                        Pass
                      </ToggleGroupItem>
                      <ToggleGroupItem
                        value="fail"
                        aria-label={`${label} failed`}
                        className="data-[state=on]:bg-red-500 data-[state=on]:text-white"
                      >
                        Fail
                      </ToggleGroupItem>
                    </ToggleGroup>
                  )}
                />
              </div>
            ))}
          </form>
        </ItemContent>
      </Item>
      <div className="text-xs text-muted-foreground">
        Reference #{referenceNumber} · Scheduled {scheduledTime ?? "TBD"}
      </div>
    </section>
  );
}
