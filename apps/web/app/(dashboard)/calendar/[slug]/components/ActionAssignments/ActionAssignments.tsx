import React, { useState } from 'react';
import { useUserProfiles } from '@/core/User/useUserProfiles';
import { useShifts, Shift, useCopyShifts } from '@/features/SessionAssignments/hooks/useShifts';
import { useUpdateShift } from '@/features/SessionAssignments/hooks/useUpdateShift';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Copy, Loader2, ClipboardList } from 'lucide-react';
import ShiftBlockLines from './components/ShiftBlockLines';

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

// Helper function to format time labels
function formatTimeLabel(time: string | null): string {
  if (!time) return '';
  const [h, m] = time.split(':');
  const date = new Date();
  date.setHours(Number(h), Number(m), 0, 0);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

// Helper to convert 'HH:MM:SS' or 'HH:MM' to 'HH:MM'
function toHHMM(t: string | null | undefined): string {
  if (!t) return '06:00';
  return t.split(':').slice(0, 2).join(':');
}

// Helper to format date for display
function formatShortDate(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString(undefined, { month: 'numeric', day: 'numeric' });
}

function formatShortDay(dateString: string): string {
  const date = new Date(dateString + 'T00:00:00');
  return date.toLocaleDateString(undefined, { weekday: 'short' });
}

function toDateFromYMD(dateString?: string): Date | undefined {
  if (!dateString) return undefined;
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
}

function toYMD(date?: Date): string {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

const ActionAssignments: React.FC<ActionAssignmentsProps> = ({
  dates,
  selectedDate,
  onDateSelect,
  className = '',
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
  showShiftBlockLines = true
}) => {
  const { profiles, isLoading: profilesLoading, error: profilesError } = useUserProfiles();
  const { data: shifts, isLoading: shiftsLoading, error: shiftsError } = useShifts(dates);
  const copyShifts = useCopyShifts();
  const updateShift = useUpdateShift();

  // Dialog state
  const [internalOpen, setInternalOpen] = useState(false);
  const isDialogOpen = open ?? internalOpen;
  const setIsDialogOpen = onOpenChange ?? setInternalOpen;

  // Modal state for editing shifts
  const [editingCell, setEditingCell] = useState<{ profileId: string, date: string } | null>(null);
  const [modalStart, setModalStart] = useState<string>('06:00');
  const [modalEnd, setModalEnd] = useState<string>('07:00');
  const [copyFromOpen, setCopyFromOpen] = useState(false);
  const [copySourceDate, setCopySourceDate] = useState<string>('');
  const [copyError, setCopyError] = useState<string | null>(null);

  // Time options (30-min increments from 6:00 to 23:00)
  const timeOptions: string[] = [];
  for (let h = 6; h <= 23; h++) {
    timeOptions.push(`${h.toString().padStart(2, '0')}:00`);
    if (h !== 23) timeOptions.push(`${h.toString().padStart(2, '0')}:30`);
  }

  // Get shift for a specific profile and date
  const getShift = (profileId: string, date: string): Shift | undefined => {
    return shifts?.find(s => s.profileId === profileId && s.date === date);
  };

  // Open modal with current shift values if present
  const openCellModal = (profileId: string, date: string) => {
    const shift = getShift(profileId, date);
    setModalStart(toHHMM(shift?.start_time) || '06:00');
    setModalEnd(toHHMM(shift?.end_time) || '07:00');
    setEditingCell({ profileId, date });
  };

  const closeCellModal = () => setEditingCell(null);

  // Handle saving a shift
  const handleSave = () => {
    if (!editingCell) return;
    
    updateShift.mutate({
      profileId: editingCell.profileId,
      date: editingCell.date,
      startTime: modalStart,
      endTime: modalEnd,
    }, {
      onSuccess: () => {
        closeCellModal();
      },
      onError: (error) => {
        console.error('Shift create/update error:', error);
      }
    });
  };

  // Handle clearing a shift
  const handleClear = () => {
    if (!editingCell) return;
    
    updateShift.mutate({
      profileId: editingCell.profileId,
      date: editingCell.date,
      startTime: null,
      endTime: null,
    }, {
      onSuccess: () => {
        closeCellModal();
      },
      onError: (error) => {
        console.error('Shift clear error:', error);
      }
    });
  };

  // Loading state
  if (profilesLoading || shiftsLoading) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className={`h-8 px-3 ${className}`}
        disabled
      >
        <ClipboardList className="h-4 w-4 mr-2" />
        Loading...
      </Button>
    );
  }

  // Error state
  if (profilesError || shiftsError) {
    return (
      <Button
        variant="secondary"
        size="sm"
        className={`h-8 px-3 ${className}`}
        disabled
      >
        <ClipboardList className="h-4 w-4 mr-2" />
        Error
      </Button>
    );
  }

  // Filter profiles to only show technicians
  const technicianProfiles = profiles?.filter(profile => 
    profile.roles && 
    Array.isArray(profile.roles) && 
    profile.roles.includes('TECHNICIAN')
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

  const handleCopyFromOtherDate = () => {
    if (!targetDate) {
      setCopyError('Select a target date first.');
      return;
    }

    if (!copySourceDate) {
      setCopyError('Choose a source date to copy from.');
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
            'Failed to copy from the selected date. Please try again.';
          setCopyError(message);
        },
      }
    );
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
          <DialogHeader className="sm:flex-row sm:items-center sm:justify-between">
            <DialogTitle>Action Assignments</DialogTitle>
            <Popover open={copyFromOpen} onOpenChange={(open) => {
              setCopyError(null);
              setCopyFromOpen(open);
            }}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!targetDate}
                >
                  {copyShifts.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Copying...
                    </>
                  ) : (
                    'Copy from other date'
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-[360px] space-y-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Copy from other date</p>
                  <p className="text-xs text-muted-foreground">
                    Choose a source date to copy into {targetDate ? formatShortDate(targetDate) : 'this day'}.
                  </p>
                </div>
                <Calendar
                  mode="single"
                  selected={toDateFromYMD(copySourceDate)}
                  defaultMonth={toDateFromYMD(copySourceDate) ?? toDateFromYMD(targetDate ?? undefined)}
                  onSelect={(date) => {
                    setCopyError(null);
                    setCopySourceDate(toYMD(date ?? undefined));
                  }}
                  className="w-full min-w-[320px] rounded-md border p-2 [--cell-size:2.4rem]"
                />
                {copyError && (
                  <p className="text-xs text-destructive">{copyError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setCopyFromOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleCopyFromOtherDate}
                    disabled={!copySourceDate || !targetDate || copyShifts.isPending}
                  >
                    {copyShifts.isPending ? 'Copying...' : 'Copy'}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </DialogHeader>

          {/* Schedule Table */}
          <div className="w-full max-w-full overflow-x-auto">
            <Table className="max-w-full">
              <TableHeader>
                <TableRow>
                  <TableHead className="">
                    Name
                  </TableHead>
                  {dates.map((date) => (
                    <TableHead
                      key={date}
                      className={`text-center cursor-pointer transition-all duration-200 ${
                        selectedDate === date 
                          ? 'bg-muted text-foreground backdrop-blur-sm' 
                          : 'bg-gray-200/20 dark:bg-gray-700/20 text-gray-700 dark:text-gray-200 backdrop-blur-sm hover:bg-muted/70 dark:hover:bg-muted/30'
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
                {technicianProfiles.map(profile => (
                  <TableRow key={profile.id}>
                    <TableCell className="w-8 font-medium">
                      {profile.name || profile.id}
                    </TableCell>
                    {dates.map((date) => {
                      const shift = getShift(profile.id, date);
                      return (
                        <TableCell
                          key={date}
                          className={`max-w-8 text-center cursor-pointer hover:bg-muted/50 dark:hover:bg-muted/25 transition-all duration-200 backdrop-blur-sm ${
                            selectedDate === date 
                              ? 'bg-muted/70 dark:bg-muted/30' 
                              : 'bg-white/5 dark:bg-gray-800/5'
                          }`}
                          onClick={() => openCellModal(profile.id, date)}
                        >
                          {shift && shift.startTime && shift.endTime ? (
                            <span className="text-xs flex flex-col items-center justify-center leading-tight">
                              <span>{formatTimeLabel(shift.startTime)}</span>
                              <span>{formatTimeLabel(shift.endTime)}</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Time Range Picker Dialog */}
      <Dialog open={!!editingCell} onOpenChange={(open) => { if (!open) closeCellModal(); }}>
        <DialogContent className="w-full max-w-xs">
          <DialogHeader>
            <DialogTitle>Set Time Range</DialogTitle>
          </DialogHeader>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Start Time
            </label>
            <Select value={modalStart} onValueChange={(v) => setModalStart(v)} disabled={updateShift.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select start time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{formatTimeLabel(opt)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              End Time
            </label>
            <Select value={modalEnd} onValueChange={(v) => setModalEnd(v)} disabled={updateShift.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select end time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map((opt) => (
                  <SelectItem key={opt} value={opt}>{formatTimeLabel(opt)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {updateShift.isError && (
            <div className="mb-2 text-red-600 text-sm">
              Error saving shift. Please try again.
            </div>
          )}

          {updateShift.isPending && (
            <div className="mt-2 text-muted-foreground text-sm flex items-center">
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving shift...
            </div>
          )}

          <DialogFooter>
            <div className="flex justify-between w-full">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClear}
                disabled={updateShift.isPending}
              >
                Clear
              </Button>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeCellModal}
                  disabled={updateShift.isPending}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={updateShift.isPending}
                >
                  {updateShift.isPending ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ActionAssignments;
