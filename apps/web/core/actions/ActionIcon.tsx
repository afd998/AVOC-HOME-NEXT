import { Icon } from "@iconify/react";
import { cn } from "@/lib/utils";
import { getActionIconConfig } from "./utils/getActionIcon";

type ActionIconProps = {
  action: { type?: string | null; subType?: string | null };
  size?: "sm" | "md" | "lg";
  variant?: "neutral" | "muted" | "tinted";
  className?: string;
  iconClassName?: string;
  colorClassName?: string;
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
  variant = "neutral",
  className,
  iconClassName,
  colorClassName,
}: ActionIconProps) {
  const { icon, colorClass } = getActionIconConfig(action);

  const tintedBackground =
    colorClass.startsWith("text-") && colorClass.includes("-")
      ? colorClass.replace(/^text-/, "bg-")
      : "bg-primary";

  const backgroundClass =
    variant === "muted"
      ? "bg-muted/50"
      : variant === "tinted"
        ? tintedBackground
        : "bg-background";

  const borderClass = variant === "tinted" ? "border-transparent" : "border";

  const iconColorClass =
    variant === "tinted"
      ? colorClassName ?? "text-white"
      : colorClassName ?? colorClass;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        borderClass,
        wrapperBySize[size],
        backgroundClass,
        className
      )}
    >
      <Icon
        icon={icon}
        className={cn(iconBySize[size], iconColorClass, iconClassName)}
      />
    </span>
  );
}
