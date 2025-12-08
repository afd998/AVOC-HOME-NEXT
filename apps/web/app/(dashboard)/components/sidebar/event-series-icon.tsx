"use client";

import { Icon, type IconProps } from "@iconify/react";

type EventSeriesIconProps = Omit<IconProps, "icon">;

export function EventSeriesIcon(props: EventSeriesIconProps) {
  return (
    <Icon icon="material-symbols:event-repeat-rounded" {...props} />
  );
}
