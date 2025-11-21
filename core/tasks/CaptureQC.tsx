"use client";

import { createContext, useContext, useEffect, useMemo, useRef } from "react";
import { Controller, useForm, type UseFormReturn } from "react-hook-form";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import { Item, ItemContent } from "@/components/ui/item";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import type { HydratedTask } from "@/lib/data/calendar/taskscalendar";
import { InferSelectModel } from "drizzle-orm";
import { qcItems, qcItemDict, qcs, qcStatus, failMode, waitedReason } from "@/drizzle/schema";
import { cn } from "@/lib/utils";

type CaptureQCProps = {
  task: HydratedTask;
};

// Extract type from schema enum
type QCStatus = (typeof qcStatus.enumValues)[number] | null;
type FailMode = (typeof failMode.enumValues)[number] | "waived" | null;
type WaivedReason = (typeof waitedReason.enumValues)[number] | null;

// Dynamic form values based on qcItem IDs
// Status fields: `${qc}-${qcItemDictId}` -> QCStatus
// Fail mode fields: `${qc}-${qcItemDictId}-failMode` -> FailMode
// Waived reason fields: `${qc}-${qcItemDictId}-waivedReason` -> WaivedReason
// Ticket number fields: `${qc}-${qcItemDictId}-ticket` -> string
export type CaptureQcFormValues = Record<string, QCStatus | FailMode | WaivedReason | string>;

// Convert database status to form status
const statusFromDbValue = (
  value: "pass" | "fail" | "na" | null | undefined
): QCStatus => {
  if (value === "pass" || value === "fail" || value === "na") {
    return value;
  }
  return null;
};

// Get types from schema
type QcItemRow = InferSelectModel<typeof qcItems>;
type QcItemDictRow = InferSelectModel<typeof qcItemDict>;
type QcRow = InferSelectModel<typeof qcs>;

// When using Drizzle relations with 'with', the relation object is nested
type QcItemWithDict = QcItemRow & {
  qcItemDict: QcItemDictRow;
};

type QcWithItems = QcRow & {
  qcItems?: QcItemWithDict[];
};

// Context to expose form instance
type CaptureQCFormContextValue = UseFormReturn<CaptureQcFormValues> | null;
const CaptureQCFormContext = createContext<CaptureQCFormContextValue>(null);

export const useCaptureQCForm = () => {
  const context = useContext(CaptureQCFormContext);
  return context;
};

export default function CaptureQC({ task }: CaptureQCProps) {
  const referenceNumber = task.id;
  const scheduledTime = task.startTime;
  const captureQc = (task.captureQcDetails as QcWithItems | null) ?? null;
  const qcItems = captureQc?.qcItems ?? [];

  // Create a stable serialized key from qcItems for comparison
  const qcItemsKey = useMemo(() => {
    if (!qcItems || qcItems.length === 0) return "";
    return qcItems
      .map((item) => {
        // qcItemDict is the foreign key column name in the schema
        const qcItemDictId = item.qcItemDict?.id ?? item.qcItemDict;
        return `${item.qc}-${qcItemDictId}-${item.status ?? null}`;
      })
      .sort()
      .join("|");
  }, [qcItems]);

  // Create form field names from qcItem IDs (composite key: qc-qcItemDictId)
  const defaultValues = useMemo<CaptureQcFormValues>(() => {
    const values: CaptureQcFormValues = {};
    qcItems.forEach((qcItem) => {
      // qcItemDict is the foreign key column name in the schema
      // When relation is loaded, use qcItemDict.id, otherwise use qcItemDict (the FK value)
      const qcItemDictId = qcItem.qcItemDict?.id ?? qcItem.qcItemDict;
      const fieldKey = `${qcItem.qc}-${qcItemDictId}`;
      const failModeKey = `${fieldKey}-failMode`;
      const waivedReasonKey = `${fieldKey}-waivedReason`;
      const ticketKey = `${fieldKey}-ticket`;
      
      // Set status
      values[fieldKey] = statusFromDbValue(qcItem.status);
      
      // Set fail mode based on waived and failMode fields
      if (qcItem.waived === true) {
        values[failModeKey] = "waived";
      } else if (qcItem.failMode) {
        values[failModeKey] = qcItem.failMode;
      } else {
        values[failModeKey] = null;
      }
      
      // Set waived reason if it exists
      values[waivedReasonKey] = qcItem.waivedReason ?? null;
      
      // Set ticket number if it exists
      values[ticketKey] = qcItem.snTicket ?? "";
    });
    return values;
  }, [qcItemsKey]);

  const form = useForm<CaptureQcFormValues>({
    defaultValues,
  });

  // Track previous key to avoid unnecessary resets
  const previousKeyRef = useRef<string>("");

  useEffect(() => {
    // Only reset if the actual data changed, not just the reference
    if (previousKeyRef.current !== qcItemsKey) {
      previousKeyRef.current = qcItemsKey;
      form.reset(defaultValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qcItemsKey]); // Only depend on the stable key, not defaultValues or form

  return (
    <CaptureQCFormContext.Provider value={form}>
      <section className="space-y-2">
      <h3 className="text-sm font-semibold uppercase text-muted-foreground">
        QC Items
      </h3>
      <Item className="flex flex-col gap-2" variant="outline" size="sm">
        <ItemContent className="flex flex-col w-full gap-1">
          <form className="mt-3" onSubmit={form.handleSubmit(() => {})}>
            <FieldSet className="gap-4">
              {qcItems.length === 0 ? (
                <div className="py-4 text-sm text-muted-foreground">
                  No QC items found for this task.
                </div>
              ) : (
                <FieldGroup className="gap-3">
                  {qcItems.map((qcItem) => {
                    const qcItemDict = qcItem.qcItemDict;

                    // Use composite key: qc-qcItemDictId for form field name
                    // Note: qcItemDict.id is the same as the foreign key, but we use the relation object
                    const fieldKey = `${qcItem.qc}-${qcItemDict.id}`;
                    const fieldId = `qc-item-${fieldKey}`;
                    const label = qcItemDict.displayName;
                    const description = qcItemDict.instruction;

                    return (
                      <Field
                        key={fieldKey}
                        orientation="responsive"
                        className="@md/field-group:items-start items-start rounded-md border border-border bg-background px-3 py-3 text-sm"
                      >
                        <div className="flex flex-1 flex-col gap-1">
                          <FieldLabel
                            id={`${fieldId}-label`}
                            className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-2"
                          >
                            {qcItemDict.icon && (
                              <Icon
                                icon={qcItemDict.icon}
                                width={16}
                                height={16}
                                className="text-muted-foreground"
                              />
                            )}
                            {label}
                          </FieldLabel>
                          <FieldDescription
                            id={`${fieldId}-description`}
                            className="text-xs text-muted-foreground"
                          >
                            {description}
                          </FieldDescription>
                        </div>
                        <div className="flex flex-col gap-2 w-full">
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
                                value={field.value ?? ""}
                                aria-labelledby={`${fieldId}-label`}
                                aria-describedby={`${fieldId}-description`}
                                onValueChange={(nextValue) => {
                                  const newStatus = nextValue === "" ? null : (nextValue as QCStatus);
                                  field.onChange(newStatus);
                                  // Clear fail mode and ticket if status is not "fail"
                                  if (newStatus !== "fail") {
                                    form.setValue(`${fieldKey}-failMode`, null);
                                    form.setValue(`${fieldKey}-ticket`, "");
                                  }
                                }}
                                className="w-full"
                              >
                                <ToggleGroupItem
                                  value=""
                                  aria-label={`${label} pending`}
                                  className="data-[state=on]:bg-muted data-[state=on]:text-foreground flex-1 px-6"
                                >
                                  Pending
                                </ToggleGroupItem>
                                <ToggleGroupItem
                                  value="pass"
                                  aria-label={`${label} passed`}
                                  className="data-[state=on]:bg-emerald-500 data-[state=on]:text-white flex-1 px-6"
                                >
                                  Pass
                                </ToggleGroupItem>
                                <ToggleGroupItem
                                  value="fail"
                                  aria-label={`${label} failed`}
                                  className="data-[state=on]:bg-red-500 data-[state=on]:text-white flex-1 px-6"
                                >
                                  Fail
                                </ToggleGroupItem>
                                <ToggleGroupItem
                                  value="na"
                                  aria-label={`${label} not applicable`}
                                  className="data-[state=on]:bg-slate-500 data-[state=on]:text-white flex-1 px-6"
                                >
                                  N/A
                                </ToggleGroupItem>
                              </ToggleGroup>
                            )}
                          />
                          {/* Show fail mode options when status is "fail" */}
                          {form.watch(fieldKey) === "fail" && (
                            <div className="flex flex-col gap-2 w-full">
                              <Controller
                                name={`${fieldKey}-failMode`}
                                control={form.control}
                                rules={{
                                  required: "Please select a fail mode option",
                                }}
                                render={({ field: failModeField, fieldState }) => (
                                  <div className="flex flex-col gap-2">
                                    <ToggleGroup
                                      id={`${fieldId}-failMode`}
                                      type="single"
                                      variant="outline"
                                      size="sm"
                                      spacing={0}
                                      value={failModeField.value ?? ""}
                                      aria-labelledby={`${fieldId}-failMode-label`}
                                      onValueChange={(value) => {
                                        const newValue = value === "" ? null : (value as FailMode);
                                        failModeField.onChange(newValue);
                                        // Clear ticket if not ticketed
                                        if (newValue !== "Ticketed") {
                                          form.setValue(`${fieldKey}-ticket`, "");
                                        }
                                        // Clear waived reason if not waived
                                        if (newValue !== "waived") {
                                          form.setValue(`${fieldKey}-waivedReason`, null);
                                        }
                                      }}
                                      className={cn(
                                        "w-full",
                                        fieldState.invalid && "border-destructive"
                                      )}
                                    >
                                      <ToggleGroupItem
                                        value="Resolved Immediately"
                                        aria-label="Resolved"
                                        className="flex-1 px-6"
                                      >
                                        Resolved
                                      </ToggleGroupItem>
                                      <ToggleGroupItem
                                        value="waived"
                                        aria-label="Waived"
                                        className="flex-1 px-6"
                                      >
                                        Waived
                                      </ToggleGroupItem>
                                      <ToggleGroupItem
                                        value="Ticketed"
                                        aria-label="Ticketed"
                                        className="flex-1 px-6"
                                      >
                                        Ticketed
                                      </ToggleGroupItem>
                                    </ToggleGroup>
                                    <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                                  </div>
                                )}
                              />
                              {/* Show waived reason select when fail mode is "waived" */}
                              {form.watch(`${fieldKey}-failMode`) === "waived" && (
                                <Controller
                                  name={`${fieldKey}-waivedReason`}
                                  control={form.control}
                                  rules={{
                                    required: "Please select a waived reason",
                                    validate: (value) => {
                                      const currentFailMode = form.getValues(`${fieldKey}-failMode`);
                                      if (currentFailMode === "waived" && !value) {
                                        return "Please select a waived reason";
                                      }
                                      return true;
                                    },
                                  }}
                                  render={({ field: waivedReasonField, fieldState }) => (
                                    <div className="flex flex-col gap-1">
                                      <label
                                        htmlFor={`${fieldId}-waivedReason`}
                                        className="text-xs font-medium text-muted-foreground"
                                      >
                                        Waived Reason
                                      </label>
                                      <Select
                                        value={waivedReasonField.value ?? ""}
                                        onValueChange={(value) => {
                                          waivedReasonField.onChange(value === "" ? null : value);
                                        }}
                                      >
                                        <SelectTrigger
                                          id={`${fieldId}-waivedReason`}
                                          className={cn(
                                            "h-8 text-sm",
                                            fieldState.invalid && "border-destructive"
                                          )}
                                        >
                                          <SelectValue placeholder="Select waived reason" />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {waitedReason.enumValues.map((reason) => (
                                            <SelectItem key={reason} value={reason}>
                                              {reason}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                      <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                                    </div>
                                  )}
                                />
                              )}
                              {/* Show ticket number input when fail mode is "Ticketed" */}
                              {form.watch(`${fieldKey}-failMode`) === "Ticketed" && (
                                <Controller
                                  name={`${fieldKey}-ticket`}
                                  control={form.control}
                                  rules={{
                                    required: "Ticket number is required when ticketed",
                                    pattern: {
                                      value: /^INC\d{7}$/,
                                      message: "Must start with 'INC' followed by exactly 7 digits (e.g., INC1234567)",
                                    },
                                  }}
                                  render={({ field: ticketField, fieldState }) => (
                                    <div className="flex flex-col gap-1">
                                      <label
                                        htmlFor={`${fieldId}-ticket`}
                                        className="text-xs font-medium text-muted-foreground"
                                      >
                                        Ticket Number
                                      </label>
                                      <Input
                                        id={`${fieldId}-ticket`}
                                        type="text"
                                        placeholder="INC1234567"
                                        value={ticketField.value || ""}
                                        onChange={(e) => {
                                          // Auto-format: ensure uppercase and limit input
                                          const value = e.target.value.toUpperCase();
                                          // Only allow INC prefix and digits
                                          const filtered = value.replace(/[^INC0-9]/g, "");
                                          // Limit to INC + 7 digits max
                                          if (filtered.startsWith("INC")) {
                                            const digits = filtered.slice(3);
                                            if (digits.length <= 7) {
                                              ticketField.onChange(`INC${digits}`);
                                            } else {
                                              ticketField.onChange(`INC${digits.slice(0, 7)}`);
                                            }
                                          } else if (filtered.startsWith("IN")) {
                                            ticketField.onChange("IN");
                                          } else if (filtered.startsWith("I")) {
                                            ticketField.onChange("I");
                                          } else if (filtered === "") {
                                            ticketField.onChange("");
                                          }
                                        }}
                                        onBlur={ticketField.onBlur}
                                        aria-invalid={fieldState.invalid}
                                        className={cn(
                                          "h-8 text-sm",
                                          fieldState.invalid && "border-destructive"
                                        )}
                                      />
                                      <FieldError errors={fieldState.error ? [fieldState.error] : undefined} />
                                    </div>
                                  )}
                                />
                              )}
                            </div>
                          )}
                        </div>
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
    </CaptureQCFormContext.Provider>
  );
}
