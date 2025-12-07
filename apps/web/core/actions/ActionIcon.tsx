import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { getActionIconConfig } from "./utils/getActionIcon";

type ActionIconProps = {
  action: { type?: string | null; subType?: string | null };
  size?: "sm" | "md" | "lg";
  className?: string;
  iconClassName?: string;
};

const wrapperBySize: Record<NonNullable<ActionIconProps["size"]>, string> = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

const iconBySize: Record<NonNullable<ActionIconProps["size"]>, string> = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
  lg: "h-8 w-8",
};

export default function ActionIcon({
  action,
  size = "md",
  className,
  iconClassName,
}: ActionIconProps) {
  const { icon, colorClass } = getActionIconConfig(action);

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border bg-background",
        wrapperBySize[size],
        className
      )}
    >
      <Icon
        icon={icon}
        className={cn(iconBySize[size], colorClass, iconClassName)}
      />
    </span>
  );
}
