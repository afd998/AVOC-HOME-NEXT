"use client";

import { Icon } from "@iconify/react";
import type { HydratedTask } from "@/lib/data/calendar/taskscalendar";
import { cn } from "@/lib/utils";

type TaskIconProps = {
  task: Pick<HydratedTask, "taskDictDetails">;
  className?: string;
};

const DEFAULT_ICON_NAME = "mdi:help-circle-outline";
const DEFAULT_COLOR = "#6b7280";
const DEFAULT_BG = "rgba(107, 114, 128, 0.15)";

const toTrimmedString = (value: unknown): string | null => {
  if (typeof value !== "string") {
    return null;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
};

const withOpacity = (color: string, alpha: number): string | null => {
  const hexMatch = color.match(/^#([0-9a-f]{3,8})$/i);
  if (hexMatch) {
    const hex = hexMatch[1];
    const expand = (value: string) =>
      value.length === 1 ? value.repeat(2) : value;

    let r = 0;
    let g = 0;
    let b = 0;
    if (hex.length === 3 || hex.length === 4) {
      r = parseInt(expand(hex[0]), 16);
      g = parseInt(expand(hex[1]), 16);
      b = parseInt(expand(hex[2]), 16);
    } else if (hex.length === 6 || hex.length === 8) {
      r = parseInt(hex.slice(0, 2), 16);
      g = parseInt(hex.slice(2, 4), 16);
      b = parseInt(hex.slice(4, 6), 16);
    } else {
      return null;
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  const rgbMatch = color.match(
    /^rgba?\(\s*([0-9.]+)\s*,\s*([0-9.]+)\s*,\s*([0-9.]+)(?:\s*,\s*[0-9.]+\s*)?\)$/i
  );
  if (rgbMatch) {
    const [, r, g, b] = rgbMatch;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  return null;
};

export const TaskIcon = ({ task, className }: TaskIconProps) => {
  const icon = task.taskDictDetails?.icon ?? null;
  const iconRecord =
    icon && typeof icon === "object" ? (icon as Record<string, unknown>) : null;

  const rawName = iconRecord ? iconRecord["name"] : undefined;
  const rawColor = iconRecord ? iconRecord["color"] : undefined;

  const iconName =
    toTrimmedString(rawName) ?? toTrimmedString(icon) ?? DEFAULT_ICON_NAME;
  const colorValue = toTrimmedString(rawColor) ?? DEFAULT_COLOR;

  const shouldUseInlineColor =
    colorValue === "" ||
    /^#[0-9a-f]{3,8}$/i.test(colorValue) ||
    colorValue.startsWith("rgb") ||
    colorValue.startsWith("hsl") ||
    /^[a-z]+$/i.test(colorValue);

  const iconClassName = `w-4 h-4 ${shouldUseInlineColor ? "" : colorValue}`.trim();
  const iconStyle =
    shouldUseInlineColor && colorValue !== "" ? { color: colorValue } : undefined;

  const backgroundColor =
    (shouldUseInlineColor && colorValue !== ""
      ? withOpacity(colorValue, 0.50)
      : null) ?? DEFAULT_BG;

  return (
    <div
      className={cn(
        "flex items-center justify-center w-full h-full rounded-full",
        className
      )}
      style={{ backgroundColor }}
    >
      <Icon
        icon={iconName}
        width={16}
        height={16}
        className={iconClassName}
        style={iconStyle}
      />
    </div>
  );
};
