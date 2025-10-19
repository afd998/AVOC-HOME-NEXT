"use client";

import { Icon } from "@iconify/react";

type ResourceIconProps = {
  icon: unknown | null;
};

export const ResourceIcon = ({ icon }: ResourceIconProps) => {
  const DEFAULT_ICON_NAME = "mdi:help-circle-outline";
  const DEFAULT_COLOR = "#6b7280";

  const toTrimmedString = (value: unknown): string | null => {
    if (typeof value !== "string") {
      return null;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  };

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
  const iconStyle = shouldUseInlineColor && colorValue !== "" ? { color: colorValue } : undefined;

  return (
    <div className="flex items-center justify-center">
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
