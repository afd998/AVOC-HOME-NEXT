"use client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { getProfile } from "@/lib/data/profile";
import type { ProfileRow } from "@/lib/data/actions/actions";

type UserAvatarProps = {
  profile: ProfileRow;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
  variant?: "default" | "solid";
};

const sizeClasses: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  xs: "h-4 w-4",
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-12 w-12",
};

const fontSizeBySize: Record<NonNullable<UserAvatarProps["size"]>, string> = {
  xs: "8px",
  sm: "10px",
  md: "12px",
  lg: "14px",
};

const generateUserColor = (userId: string): string => {
  let hash = 0;
  for (let index = 0; index < userId.length; index += 1) {
    hash = userId.charCodeAt(index) + ((hash << 5) - hash);
  }

  const colors = [
    "#ef4444",
    "#3b82f6",
    "#10b981",
    "#eab308",
    "#8b5cf6",
    "#ec4899",
    "#6366f1",
    "#14b8a6",
    "#f97316",
    "#06b6d4",
    "#10b981",
    "#8b5cf6",
    "#f43f5e",
    "#f59e0b",
    "#84cc16",
    "#0ea5e9",
  ];

  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (value: string | null | undefined): string => {
  if (!value) {
    return "??";
  }

  const parts = value
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);

  if (parts.length === 0) {
    return "??";
  }

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

export default function UserAvatar({
  profile,
  size = "md",
  className,
  variant = "default",
}: UserAvatarProps) {
  const displayName = profile?.name?.trim() || profile?.id;
  const initials = getInitials(profile?.name ?? profile?.id);
  const color = generateUserColor(profile?.id ?? "");

  const style =
    variant === "solid"
      ? {
          backgroundColor: color,
          color: "#ffffff",
        }
      : {
          backgroundColor: `${color}40`,
          color,
        };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Avatar
          className={cn(sizeClasses[size], "font-medium", className)}
          data-variant={variant}
        >
          <AvatarFallback
            className="flex h-full w-full items-center justify-center uppercase"
            style={{
              ...style,
              fontSize: fontSizeBySize[size],
            }}
          >
            {initials}
          </AvatarFallback>
        </Avatar>
      </TooltipTrigger>
      <TooltipContent>{displayName}</TooltipContent>
    </Tooltip>
  );
}
