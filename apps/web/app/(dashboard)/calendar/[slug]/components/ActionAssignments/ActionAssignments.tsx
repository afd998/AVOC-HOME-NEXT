"use client";

import React, { useState } from "react";
import { useUserProfiles } from "@/core/User/useUserProfiles";
import {
  useShifts,
  Shift,
  useCopyShifts,
} from "@/features/SessionAssignments/hooks/useShifts";
import { useUpdateShift } from "@/features/SessionAssignments/hooks/useUpdateShift";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Copy, Loader2, ClipboardList } from "lucide-react";
import ShiftBlockLines from "./components/ShiftBlockLines";
import UserAvatar from "@/core/User/UserAvatar";

interface ActionAssignmentsProps {
  dates: string[]; // Array of date strings in YYYY-MM-DD format
  selectedDate?: string; // Currently selected date for highlighting
  onDateSelect?: (date: string) => void; // Callback when a date is selected
  className?: string; // Additional CSS classes
  onCopyShiftBlocks?: () => void; // Callback for copying shift blocks
  isCopyingShiftBlocks?: boolean; // Loading state for copy operation
  pixelsPerMinute?: number; // Pixels per minute for width calculations
  contentWidth?: number; // Content width for container sizing
  pageZoom?: number; // Page zoom level
  scrollLeft?: number; // Horizontal scroll position for synchronization
  startHour?: number; // Grid start hour for offset calculations
  onSelectRange?: (range: { leftPx: number; widthPx: number } | null) => void; // Selection callback
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
  showShiftBlockLines?: boolean;
}

type TimeParts = { hour: string | null; period: "AM" | "PM" | null };

const hourOptions: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];
const periodOptions: Array<TimeParts["period"]> = ["AM", "PM"];
const EMPTY_TIME: TimeParts = { hour: null, period: null };

// Helper function to format time labels
function formatTimeLabel(time: string | null): string {
  if (!time) return "";
  const [h, m] = time.split(":");
  const date = new Date();
  date.setHours(Number(h), Number(m ?? 0), 0, 0);
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function parseTimeParts(time?: string | null): TimeParts {
  if (!time) return { ...EMPTY_TIME };
  const [h] = time.split(":");
  const hour = Number(h);
  const period = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return { hour: hour12.toString(), period };
}

function timePartsToString(parts: TimeParts): string | null {
  if (!parts.hour && !parts.period) return null;
  if (!parts.hour || !parts.period) return null;

  const hour = Number(parts.hour);
  const isPM = parts.period === "PM";
  const hour24 = hour === 12 ? (isPM ? 12 : 0) : isPM ? hour + 12 : hour;

  return `${hour24.toString().padStart(2, "0")}:00`;
}

function isIncomplete(parts: TimeParts): boolean {
  return Boolean((parts.hour && !parts.period) || (!parts.hour && parts.period));
}

// Helper to format date for display
function formatShortDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString(undefined, { month: "numeric", day: "numeric" });
}

function formatShortDay(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString(undefined, { weekday: "short" });
}

function toDateFromYMD(dateString?: string): Date | undefined {
  if (!dateString) return undefined;
  const [year, month, day] = dateString.split("-").map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function toYMD(date?: Date): string {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const makeKey = (profileId: string, date: string) => `${profileId}__${date}`;

type DraftGrid = Record<
  string,
  {
    start: TimeParts;
    end: TimeParts;
  }
>;

type TimeToggleProps = {
  label: string;
  value: TimeParts;
  onChange: (parts: TimeParts) => void;
  disabled?: boolean;
};

function TimeToggleControl({ label, value, onChange, disabled }: TimeToggleProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      <span className="text-[11px] font-semibold uppercase text-muted-foreground tracking-wide">
        {label}
      </span>
      <div className="flex items-center gap-2 w-full">
        <ToggleGroup
          type="single"
          spacing={0}
          size="sm"
          variant="outline"
          value={value.hour ?? ""}
          onValueChange={(v) => onChange({ ...value, hour: v || null })}
          disabled={disabled}
          className="flex-1"
        >
          {hourOptions.map((opt) => (
            <ToggleGroupItem 
              key={opt} 
              value={opt} 
              className="px-2 flex-1 data-[state=on]:bg-green-600 data-[state=on]:text-white data-[state=on]:hover:bg-green-700"
            >
              {opt}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <ToggleGroup
          type="single"
          spacing={0}
          size="sm"
          variant="outline"
          value={value.period ?? ""}
          onValueChange={(v) =>
            onChange({ ...value, period: (v as TimeParts["period"]) || null })
          }
          disabled={disabled}
        >
          {periodOptions.map((opt) => (
            <ToggleGroupItem 
              key={opt} 
              value={opt} 
              className={`px-3 ${
                opt === "AM" 
                  ? "data-[state=on]:bg-blue-600 data-[state=on]:text-white data-[state=on]:hover:bg-blue-700"
                  : "data-[state=on]:bg-red-600 data-[state=on]:text-white data-[state=on]:hover:bg-red-700"
              }`}
            >
              {opt}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>
    </div>
  );
}

const ActionAssignments: React.FC<ActionAssignmentsProps> = ({
  dates,
  selectedDate,
  onDateSelect,
  className = "",
  onCopyShiftBlocks,
  isCopyingShiftBlocks = false,
  pixelsPerMinute,
  contentWidth,
  pageZoom,
  scrollLeft,
  startHour,
  onSelectRange,
  open,
  onOpenChange,
  hideTrigger = false,
  showShiftBlockLines = true,
}) => {
  const { profiles, isLoading: profilesLoading, error: profilesError } = useUserProfiles();
  const { data: shifts, isLoading: shiftsLoading, error: shiftsError } = useShifts(dates);
  const copyShifts = useCopyShifts();
  const updateShift = useUpdateShift();

  const [internalOpen, setInternalOpen] = useState(false);
  const isDialogOpen = open ?? internalOpen;
  const setIsDialogOpen = onOpenChange ?? setInternalOpen;

  const [copyFromOpen, setCopyFromOpen] = useState(false);
  const [copySourceDate, setCopySourceDate] = useState<string>("");
  const [copyError, setCopyError] = useState<string | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [draftTimes, setDraftTimes] = useState<DraftGrid>({});
  const [batchError, setBatchError] = useState<string | null>(null);
  const [isSavingBatch, setIsSavingBatch] = useState(false);

  // Loading state
  if (profilesLoading || shiftsLoading) {
    return (
      <Button variant="secondary" size="sm" className={`h-8 px-3 ${className}`} disabled>
        <ClipboardList className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  // Error state
  if (profilesError || shiftsError) {
    return (
      <Button variant="secondary" size="sm" className={`h-8 px-3 ${className}`} disabled>
        <ClipboardList className="h-4 w-4 mr-2" />
        Error
      </Button>
    );
  }

  // Filter profiles to only show technicians
  const technicianProfiles =
    profiles?.filter(
      (profile) =>
        profile.roles && Array.isArray(profile.roles) && profile.roles.includes("TECHNICIAN"),
    ) || [];

  const canShowShiftBlockLines =
    showShiftBlockLines &&
    pixelsPerMinute != null &&
    contentWidth != null &&
    pageZoom != null &&
    scrollLeft != null &&
    startHour != null &&
    dates.length > 0;

  const targetDate = selectedDate ?? dates[0] ?? null;

  // Get shift for a specific profile and date
  const getShift = (profileId: string, date: string): Shift | undefined => {
    return shifts?.find((s) => s.profileId === profileId && s.date === date);
  };

  const getDraftFromShift = (profileId: string, date: string) => {
    const shift = getShift(profileId, date);
    return {
      start: parseTimeParts(shift?.startTime ?? null),
      end: parseTimeParts(shift?.endTime ?? null),
    };
  };

  const getDraftForCell = (profileId: string, date: string) => {
    const key = makeKey(profileId, date);
    return draftTimes[key] ?? getDraftFromShift(profileId, date);
  };

  const handleTimeChange = (
    profileId: string,
    date: string,
    which: "start" | "end",
    parts: TimeParts,
  ) => {
    const key = makeKey(profileId, date);
    setDraftTimes((prev) => {
      const base = prev[key] ?? getDraftFromShift(profileId, date);
      return {
        ...prev,
        [key]: {
          start: which === "start" ? parts : base.start,
          end: which === "end" ? parts : base.end,
        },
      };
    });
  };

  const handleClearCell = (profileId: string, date: string) => {
    const key = makeKey(profileId, date);
    setDraftTimes((prev) => ({
      ...prev,
      [key]: { start: { ...EMPTY_TIME }, end: { ...EMPTY_TIME } },
    }));
  };

  const hasIncompleteDrafts = Object.values(draftTimes).some(
    (draft) => isIncomplete(draft.start) || isIncomplete(draft.end),
  );

  const handleCopyFromOtherDate = () => {
    if (!targetDate) {
      setCopyError("Select a target date first.");
      return;
    }

    if (!copySourceDate) {
      setCopyError("Choose a source date to copy from.");
      return;
    }

    copyShifts.mutate(
      { sourceDate: copySourceDate, targetDate },
      {
        onSuccess: () => {
          setCopyError(null);
          setCopyFromOpen(false);
        },
        onError: (error) => {
          const message =
            (error as Error)?.message ||
            "Failed to copy from the selected date. Please try again.";
          setCopyError(message);
        },
      },
    );
  };

  const handleStartEditing = () => {
    setBatchError(null);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setDraftTimes({});
    setBatchError(null);
    setIsEditing(false);
  };

  const handleSaveBatch = async () => {
    setBatchError(null);
    if (hasIncompleteDrafts) {
      setBatchError("Finish selecting AM/PM for any edited times before saving.");
      return;
    }

    const entries = Object.entries(draftTimes);
    if (entries.length === 0) {
      setIsEditing(false);
      return;
    }

    setIsSavingBatch(true);
    try {
      for (const [key, draft] of entries) {
        const [profileId, ...rest] = key.split("__");
        const date = rest.join("__");
        const shift = getShift(profileId, date);
        const originalStart = shift?.startTime ?? null;
        const originalEnd = shift?.endTime ?? null;
        const nextStart = timePartsToString(draft.start);
        const nextEnd = timePartsToString(draft.end);
        const hasChange = nextStart !== originalStart || nextEnd !== originalEnd;
        if (!hasChange) continue;

        await updateShift.mutateAsync({
          profileId,
          date,
          startTime: nextStart,
          endTime: nextEnd,
        });
      }

      setDraftTimes({});
      setIsEditing(false);
    } catch (error) {
      setBatchError((error as Error)?.message ?? "Failed to save changes.");
    } finally {
      setIsSavingBatch(false);
    }
  };

  return (
    <>
      {/* Button to open dialog (optional) */}
      {!hideTrigger && (
        <Button
          variant="default"
          size="sm"
          className={`h-8 px-3 ${className}`}
          onClick={() => setIsDialogOpen(true)}
        >
          <ClipboardList className="h-4 w-4 mr-2" />
          Shifts
        </Button>
      )}

      {/* Shift Block Lines - shown under the button */}
      {canShowShiftBlockLines && (
        <ShiftBlockLines
          date={dates[0]}
          className="mt-2"
          pixelsPerMinute={pixelsPerMinute}
          contentWidth={contentWidth}
          pageZoom={pageZoom}
          scrollLeft={scrollLeft}
          startHour={startHour}
          onSelectRange={onSelectRange}
        />
      )}

      {/* Dialog with the table */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-full max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sm:flex-row sm:items-center sm:justify-between gap-3">
            <DialogTitle>Action Assignments</DialogTitle>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant={isEditing ? "secondary" : "outline"}
                size="sm"
                onClick={isEditing ? handleCancelEditing : handleStartEditing}
                disabled={isSavingBatch}
              >
                {isEditing ? "Cancel editing" : "Edit schedule"}
              </Button>
              <Popover
                open={copyFromOpen}
                onOpenChange={(open) => {
                  setCopyError(null);
                  setCopyFromOpen(open);
                }}
              >
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" disabled={!targetDate || isEditing}>
                    {copyShifts.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Copying...
                      </>
                    ) : (
                      "Copy from other date"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-[360px] space-y-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Copy from other date</p>
                    <p className="text-xs text-muted-foreground">
                      Choose a source date to copy into {targetDate ? formatShortDate(targetDate) : "this day"}.
                    </p>
                  </div>
                  <Calendar
                    mode="single"
                    selected={toDateFromYMD(copySourceDate)}
                    defaultMonth={
                      toDateFromYMD(copySourceDate) ?? toDateFromYMD(targetDate ?? undefined)
                    }
                    onSelect={(date) => {
                      setCopyError(null);
                      setCopySourceDate(toYMD(date ?? undefined));
                    }}
                    className="w-full min-w-[320px] rounded-md border p-2 [--cell-size:2.4rem]"
                  />
                  {copyError && <p className="text-xs text-destructive">{copyError}</p>}
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setCopyFromOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCopyFromOtherDate}
                      disabled={!copySourceDate || !targetDate || copyShifts.isPending}
                    >
                      {copyShifts.isPending ? "Copying..." : "Copy"}
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </DialogHeader>

          {/* Schedule Table */}
          <div className="w-full max-w-full overflow-x-auto">
            <Table className="max-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  {dates.map((date) => (
                    <TableHead
                      key={date}
                      className={`text-center cursor-pointer transition-all duration-200 ${
                        selectedDate === date
                          ? "bg-muted text-foreground backdrop-blur-sm"
                          : "bg-gray-200/20 dark:bg-gray-700/20 text-gray-700 dark:text-gray-200 backdrop-blur-sm hover:bg-muted/70 dark:hover:bg-muted/30"
                      }`}
                      onClick={() => onDateSelect?.(date)}
                    >
                      <div className="flex flex-col items-center">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col items-center">
                            <span className="font-semibold">{formatShortDay(date)}</span>
                            <span className="text-xs">{formatShortDate(date)}</span>
                          </div>
                          {selectedDate === date && onCopyShiftBlocks && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                onCopyShiftBlocks();
                              }}
                              disabled={isCopyingShiftBlocks}
                              className="text-xs px-2 py-1 h-auto min-h-[2.5rem]"
                            >
                              {isCopyingShiftBlocks ? (
                                <>
                                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                  <span className="text-center">
                                    <div>Copying...</div>
                                  </span>
                                </>
                              ) : (
                                <>
                                  <Copy className="h-3 w-3 mr-1" />
                                  <span className="text-center">
                                    <div>Copy shift blocks to other </div>
                                    <div>days with same schedule</div>
                                  </span>
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {technicianProfiles.map((profile) => (
                  <TableRow key={profile.id}>
                    <TableCell className="w-8 font-medium">
                      <UserAvatar profile={profile} size="sm" />
                    </TableCell>
                    {dates.map((date) => {
                      const shift = getShift(profile.id, date);
                      const key = makeKey(profile.id, date);
                      const draft = getDraftForCell(profile.id, date);
                      const originalStart = shift?.startTime ?? null;
                      const originalEnd = shift?.endTime ?? null;
                      const draftStart = timePartsToString(draft.start);
                      const draftEnd = timePartsToString(draft.end);
                      const hasDraftChange =
                        draftTimes[key] &&
                        (draftStart !== originalStart || draftEnd !== originalEnd);

                      return (
                        <TableCell
                          key={date}
                          className={`max-w-8 transition-all duration-200 backdrop-blur-sm ${
                            selectedDate === date
                              ? "bg-muted/70 dark:bg-muted/30"
                              : "bg-white/5 dark:bg-gray-800/5"
                          } ${hasDraftChange ? "ring-1 ring-primary/50 bg-primary/5" : ""}`}
                        >
                          {isEditing ? (
                            <div className="flex flex-col gap-3">
                              <TimeToggleControl
                                label="Start"
                                value={draft.start}
                                onChange={(parts) =>
                                  handleTimeChange(profile.id, date, "start", parts)
                                }
                                disabled={isSavingBatch}
                              />
                              <TimeToggleControl
                                label="End"
                                value={draft.end}
                                onChange={(parts) =>
                                  handleTimeChange(profile.id, date, "end", parts)
                                }
                                disabled={isSavingBatch}
                              />
                              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                <span>
                                  {draftStart || draftEnd
                                    ? `${draftStart ? formatTimeLabel(draftStart) : "—"} → ${
                                        draftEnd ? formatTimeLabel(draftEnd) : "—"
                                      }`
                                    : "No time set"}
                                </span>
                                <Button
                                  variant="ghost"
                                  size="xs"
                                  onClick={() => handleClearCell(profile.id, date)}
                                  disabled={isSavingBatch}
                                >
                                  Clear
                                </Button>
                              </div>
                            </div>
                          ) : shift && shift.startTime && shift.endTime ? (
                            <span className="text-xs flex flex-col items-center justify-center leading-tight">
                              <span>{formatTimeLabel(shift.startTime)}</span>
                              <span>{formatTimeLabel(shift.endTime)}</span>
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter className="sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="text-sm text-destructive min-h-[1.25rem]">
              {batchError || (hasIncompleteDrafts ? "Finish AM/PM selections before saving." : "")}
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <Button variant="outline" onClick={handleCancelEditing} disabled={isSavingBatch}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveBatch}
                    disabled={isSavingBatch || hasIncompleteDrafts}
                  >
                    {isSavingBatch ? "Saving..." : "Save all changes"}
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionAssignments;
