"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Item, ItemContent } from "@/components/ui/item";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import type { HydratedTask } from "@/lib/data/calendar/taskscalendar";

type CaptureQCProps = {
  task: HydratedTask;
};

type QCStatus = "pass" | "fail" | "pending" | "waived" | "na";

// Dynamic form values based on qcItem IDs
type CaptureQcFormValues = Record<string, QCStatus>;

// Convert database status to form status
const statusFromDbValue = (
  value: "pass" | "fail" | "waived" | "na" | null | undefined
): QCStatus => {
  if (value === "pass" || value === "fail" || value === "waived" || value === "na") {
    return value;
  }
  return "pending";
};

// Get qcItems from captureQcDetails (with type assertion for nested relations)
// When using Drizzle relations with 'with', the relation object replaces the foreign key
type QcItemWithDict = {
  qc: number;
  qcItemDictId: number; // Foreign key ID
  status: "pass" | "fail" | "waived" | "na" | null;
  qcItemDict: {
    // Nested relation object (when loaded via 'with')
    id: number;
    displayName: string;
    instruction: string;
  } | null;
};

type QcWithItems = {
  qcItems?: QcItemWithDict[];
};

export default function CaptureQC({ task }: CaptureQCProps) {
  const referenceNumber = task.id;
  const scheduledTime = task.startTime;
  const captureQc = (task.captureQcDetails as QcWithItems | null) ?? null;
  const qcItems = captureQc?.qcItems ?? [];

  // Create a stable serialized key from qcItems for memoization
  // This only changes when the actual data changes, not when the array reference changes
  const qcItemsSerialized = useMemo(() => {
    if (!qcItems || qcItems.length === 0) return "";
    return JSON.stringify(
      qcItems.map((item) => ({
        qc: item.qc,
        qcItemDictId: item.qcItemDict?.id ?? item.qcItemDictId,
        status: item.status,
      }))
    );
  }, [
    // Use serialized representation for stable comparison
    qcItems
      ?.map((item) => `${item.qc}-${item.qcItemDict?.id ?? item.qcItemDictId}-${item.status}`)
      .join("|") ?? "",
  ]);

  // Create form field names from qcItem IDs (composite key: qc-qcItemDictId)
  const defaultValues = useMemo<CaptureQcFormValues>(() => {
    const values: CaptureQcFormValues = {};
    qcItems.forEach((qcItem) => {
      // Use the relation object's id if available, otherwise fallback
      const qcItemDictId = qcItem.qcItemDict?.id ?? qcItem.qcItemDictId;
      const fieldKey = `${qcItem.qc}-${qcItemDictId}`;
      values[fieldKey] = statusFromDbValue(qcItem.status);
    });
    return values;
  }, [qcItemsSerialized]);

  const form = useForm<CaptureQcFormValues>({
    defaultValues,
  });

  // Use a ref to track previous serialized values and only reset when they actually change
  const previousValuesRef = useRef<string>("");

  useEffect(() => {
    if (previousValuesRef.current !== qcItemsSerialized) {
      previousValuesRef.current = qcItemsSerialized;
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qcItemsSerialized]); // Only depend on the serialized key, not defaultValues or form

  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold uppercase text-muted-foreground">
        Capture QC
      </h3>
      <Item className="flex flex-col gap-2" variant="outline" size="sm">
        <ItemContent className="flex flex-col w-full gap-1">
          <form className="mt-3" onSubmit={form.handleSubmit(() => {})}>
            <FieldSet className="gap-4">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <FieldLegend
                  variant="label"
                  className="mb-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  Quality Checklist
                </FieldLegend>
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
             
              <FieldSeparator />
              {qcItems.length === 0 ? (
                <div className="py-4 text-sm text-muted-foreground">
                  No QC items found for this task.
                </div>
              ) : (
                <FieldGroup className="gap-3">
                  {qcItems.map((qcItem) => {
                    const qcItemDict = qcItem.qcItemDict;
                    if (!qcItemDict) {
                      return null;
                    }

                    // Use composite key: qc-qcItemDictId for form field name
                    // Note: qcItemDict.id is the same as the foreign key, but we use the relation object
                    const fieldKey = `${qcItem.qc}-${qcItemDict.id}`;
                    const fieldId = `capture-qc-${fieldKey}`;
                    const label = qcItemDict.displayName;
                    const description = qcItemDict.instruction;

                    return (
                      <Field
                        key={fieldKey}
                        orientation="responsive"
                        className="items-start rounded-md border border-border bg-background px-3 py-3 text-sm"
                      >
                        <div className="flex flex-1 flex-col gap-1">
                          <FieldLabel
                            id={`${fieldId}-label`}
                            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                          >
                            {label}
                          </FieldLabel>
                          <FieldDescription
                            id={`${fieldId}-description`}
                            className="text-xs text-muted-foreground"
                          >
                            {description}
                          </FieldDescription>
                        </div>
                        <Controller
                          name={fieldKey}
                          control={form.control}
                          render={({ field }) => (
                            <ToggleGroup
                              id={fieldId}
                              type="single"
                              variant="outline"
                              size="sm"
                              spacing={0}
                              value={field.value}
                              aria-labelledby={`${fieldId}-label`}
                              aria-describedby={`${fieldId}-description`}
                              onValueChange={(nextValue) =>
                                field.onChange((nextValue as QCStatus) || "pending")
                              }
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
                              <ToggleGroupItem
                                value="waived"
                                aria-label={`${label} waived`}
                                className="data-[state=on]:bg-amber-500 data-[state=on]:text-white"
                              >
                                Waived
                              </ToggleGroupItem>
                              <ToggleGroupItem
                                value="na"
                                aria-label={`${label} not applicable`}
                                className="data-[state=on]:bg-slate-500 data-[state=on]:text-white"
                              >
                                N/A
                              </ToggleGroupItem>
                            </ToggleGroup>
                          )}
                        />
                      </Field>
                    );
                  })}
                </FieldGroup>
              )}
            </FieldSet>
          </form>
        </ItemContent>
      </Item>
      <div className="text-xs text-muted-foreground">
        Reference #{referenceNumber} · Scheduled {scheduledTime ?? "TBD"}
      </div>
    </section>
  );
}
