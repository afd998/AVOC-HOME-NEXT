"use client";

import { Icon, type IconProps } from "@iconify/react";

type FacultyIconProps = Omit<IconProps, "icon">;

export function FacultyIcon(props: FacultyIconProps) {
  return <Icon icon="mdi:account-graduation-outline" {...props} />;
}
