"use client"
import * as React from "react";
import { ZoomIn } from "lucide-react";
import { Slider } from "@/components/ui/slider";

export function Sliders({
  initial,
  onUpdate,
}: {
  initial: any;
  onUpdate: (
    patch: Partial<{
      zoom: number;
      pixelsPerMin: number;
      rowHeight: number;
      startHour: number;
      endHour: number;
    }>
  ) => void;
}) {
  const formatHourLabel = React.useCallback((hour: number) => {
    const normalized = ((hour % 24) + 24) % 24;
    const hour12 = normalized % 12 || 12;
    const suffix = normalized >= 12 ? "PM" : "AM";
    return `${hour12} ${suffix}`;
  }, []);

  console.log("initial", initial);
  return (
    <div className="space-y-4">
      {/* Page Zoom */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <ZoomIn className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Zoom</span>
        </div>
        <Slider
          value={[initial.zoom]}
          min={0.5}
          max={2}
          step={0.1}
          onValueChange={(v) => onUpdate({ zoom: v[0] })}
          onValueCommit={(v) => {
            const val = v[0];
            console.log("[Sidebar] onValueCommit zoom ->", val);
            onUpdate({ zoom: val });
          }}
          className="w-full"
          aria-label="Page zoom"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>50%</span>
          <span className="font-medium">{Math.round(initial.zoom * 100)}%</span>
          <span>200%</span>
        </div>
      </div>

      {/* Pixels per Minute */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Pixels/min</span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {initial.pixelsPerMin.toFixed(2)}
          </span>
        </div>
        <Slider
          value={[initial.pixelsPerMin]}
          min={0.5}
          max={8}
          step={0.1}
          onValueChange={(v) => onUpdate({ pixelsPerMin: v[0] })}
          onValueCommit={(v) => {
            const val = v[0];
            console.log("[Sidebar] onValueCommit pixels_per_min ->", val);
            onUpdate({ pixelsPerMin: val });
          }}
          className="w-full"
          aria-label="Pixels per minute"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>0.5</span>
          <span>4.0</span>
        </div>
      </div>

      {/* Row Height */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Row Height</span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {Math.round(initial.rowHeight * initial.zoom)}px
          </span>
        </div>
        <Slider
          value={[initial.rowHeight]}
          min={60}
          max={160}
          step={2}
          onValueChange={(v) => onUpdate({ rowHeight: v[0] })}
          onValueCommit={(v) => {
            const val = v[0];
            console.log("[Sidebar] onValueCommit row_height ->", val);
            onUpdate({ rowHeight: val });
          }}
          className="w-full"
          aria-label="Row height pixels"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>90px</span>
          <span>160px</span>
        </div>
      </div>

      {/* Schedule Hours */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Schedule Hours</span>
          <span className="text-xs tabular-nums text-muted-foreground">
            {formatHourLabel(initial.startHour)} –{" "}
            {formatHourLabel(initial.endHour)}
          </span>
        </div>
        <Slider
          value={[initial.startHour, initial.endHour]}
          min={0}
          max={23}
          step={1}
          onValueChange={(values) => {
            if (!Array.isArray(values) || values.length < 2) return;
            onUpdate({ startHour: values[0], endHour: values[1] });
          }}
          onValueCommit={(values) => {
            if (!Array.isArray(values) || values.length < 2) return;
            let [start, end] = values;
            start = Math.max(0, Math.min(22, Math.round(start)));
            end = Math.max(start + 1, Math.min(23, Math.round(end)));
            onUpdate({ startHour: start, endHour: end });
            if (initial.startHour === start && initial.endHour === end) {
              return;
            }
            console.log("[Sidebar] onValueCommit schedule_hours ->", {
              start,
              end,
            });
            onUpdate({ startHour: start, endHour: end });
          }}
          className="w-full"
          aria-label="Visible hour range"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>12 AM</span>
          <span>11 PM</span>
        </div>
      </div>
    </div>
  );
}
