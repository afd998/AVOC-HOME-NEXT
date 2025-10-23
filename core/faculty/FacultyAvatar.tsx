"use client";

import { cn } from "@/lib/utils";

export type FacultyAvatarSize = "sm" | "md" | "lg";

export interface FacultyAvatarProps {
  imageUrl?: string | null;
  cutoutImageUrl?: string | null;
  instructorName: string;
  className?: string;
  size?: FacultyAvatarSize;
  maskRadius?: number;
  priority?: boolean;
}

export interface FacultyAvatarItem {
  id?: string | number | null;
  displayName?: string | null;
  twentyfiveliveName?: string | null;
  twentyfivelive_name?: string | null;
  kelloggdirectoryName?: string | null;
  kelloggdirectory_name?: string | null;
  kelloggdirectoryImageUrl?: string | null;
  kelloggdirectory_image_url?: string | null;
  cutoutImage?: string | null;
  cutout_image?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
}

const sizeClasses: Record<FacultyAvatarSize, string> = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

const fallbackTextClasses: Record<FacultyAvatarSize, string> = {
  sm: "text-xs",
  md: "text-sm",
  lg: "text-base",
};

const badgeSizeClasses: Record<FacultyAvatarSize, string> = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
};

function pickFirstNonEmpty(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }
  return "";
}

export function getFacultyDisplayName(
  faculty?: FacultyAvatarItem | null
): string {
  if (!faculty) return "";
  return pickFirstNonEmpty(
    faculty.displayName,
    faculty.kelloggdirectoryName,
    faculty.kelloggdirectory_name,
    faculty.twentyfiveliveName,
    faculty.twentyfivelive_name
  );
}

function getFacultyImageUrl(faculty?: FacultyAvatarItem | null): string {
  if (!faculty) return "";
  return pickFirstNonEmpty(
    faculty.kelloggdirectoryImageUrl,
    faculty.kelloggdirectory_image_url,
    faculty.imageUrl,
    faculty.image_url
  );
}

function getFacultyCutoutUrl(
  faculty?: FacultyAvatarItem | null
): string | undefined {
  if (!faculty) return undefined;
  const cutout = pickFirstNonEmpty(
    faculty.cutoutImage,
    faculty.cutout_image
  );
  return cutout || undefined;
}

function getInitialFromName(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) {
    return "?";
  }

  for (const char of trimmed) {
    if (/[A-Za-z]/.test(char)) {
      return char.toUpperCase();
    }
  }

  return trimmed.charAt(0).toUpperCase() || "?";
}

export function getFacultyDisplayNames(
  faculty: FacultyAvatarItem[],
  options?: {
    fallbackNames?: Array<string | null | undefined>;
    max?: number;
  }
): string[] {
  const fallbackList =
    options?.fallbackNames?.map((name) =>
      typeof name === "string" ? name.trim() : ""
    ) ?? [];

  const computed = faculty.map((member, index) => {
    const direct = getFacultyDisplayName(member);
    if (direct) return direct;

    const fallback = fallbackList[index];
    if (fallback) return fallback;
    return "";
  });

  let normalized = computed.filter(Boolean);

  if (normalized.length === 0 && fallbackList.length > 0) {
    normalized = fallbackList.filter(Boolean);
  } else if (fallbackList.length > normalized.length) {
    fallbackList.slice(normalized.length).forEach((name) => {
      if (name) {
        normalized.push(name);
      }
    });
  }

  if (options?.max !== undefined) {
    return normalized.slice(0, options.max);
  }

  return normalized;
}

export function createFacultyStub(
  name: string,
  id?: string | number
): FacultyAvatarItem {
  const safeName = typeof name === "string" ? name.trim() : "";
  return {
    id: id ?? (safeName || undefined),
    displayName: safeName,
  };
}

export function FacultyAvatar({
  imageUrl,
  cutoutImageUrl,
  instructorName,
  className = "",
  size = "md",
  maskRadius = 63,
}: FacultyAvatarProps) {
  const resolvedImageUrl =
    typeof imageUrl === "string" ? imageUrl.trim() : "";
  const resolvedCutout =
    typeof cutoutImageUrl === "string" ? cutoutImageUrl.trim() : "";
  const hasCutout = resolvedCutout.length > 0;

  if (hasCutout) {
    const maskPath = `M -13 -40 L 113 -40 L 113 50 A ${maskRadius} ${maskRadius} 0 0 1 -13 50 Z`;

    return (
      <div
        className={cn(
          "group relative transition-all duration-300 ease-in-out",
          sizeClasses[size],
          className
        )}
        style={{ overflow: "visible" }}
        title={instructorName}
      >
        <div
          className="absolute inset-0 rounded-full z-0"
          style={{
            background:
              "linear-gradient(135deg, #6b5b95 0%, #886ec4 50%, #9b8ce8 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="absolute inset-0 z-20" style={{ overflow: "visible" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -10 100 130"
            className="w-full h-full transition-all duration-300 ease-in-out"
            style={{ overflow: "visible" }}
          >
            <defs>
              <clipPath id="maskImage" clipPathUnits="userSpaceOnUse">
                <path d={maskPath} />
              </clipPath>
              <clipPath id="maskBackground" clipPathUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r={maskRadius} />
              </clipPath>
            </defs>

            <g
              clipPath="url(#maskImage)"
              className="transition-all duration-300 ease-in-out [transform:translate(0,10px)] group-hover:[transform:translate(0,8px)]"
            >
              <image
                width="120"
                height="144"
                x="-15"
                y="0"
                fill="none"
                className="transition-all duration-300 ease-in-out [transform-origin:50%_50%] [transform:translateY(-30px)_scale(1.5)] group-hover:[transform:translateY(-30px)_scale(1.7)] [filter:sepia(1)_hue-rotate(240deg)_saturate(0.8)_brightness(0.9)_contrast(1.2)] group-hover:[filter:sepia(1)_hue-rotate(240deg)_saturate(1.5)_brightness(1.2)_contrast(1.3)]"
                href={resolvedCutout}
              />
            </g>
          </svg>
        </div>
      </div>
    );
  }

  if (resolvedImageUrl) {
    return (
      <div
        className={cn(
          "group relative transition-all duration-300 ease-in-out",
          sizeClasses[size],
          className
        )}
        title={instructorName}
      >
        <div
          className="absolute inset-0 rounded-full z-0"
          style={{
            background:
              "linear-gradient(135deg, #6b5b95 0%, #886ec4 50%, #9b8ce8 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        <div className="absolute inset-0 z-10 rounded-full overflow-hidden">
          <img
            src={resolvedImageUrl}
            alt={instructorName}
            className="w-full h-full object-cover rounded-full transition-all duration-300 ease-in-out scale-100 group-hover:scale-110 [filter:brightness(0.9)_saturate(1.1)_contrast(1.05)] group-hover:[filter:brightness(1.1)_saturate(1.2)_contrast(1.1)] [mix-blend-mode:multiply]"
          />
        </div>

        <div
          className="absolute inset-0 z-15 rounded-full transition-all duration-300 ease-in-out [mix-blend-mode:overlay]"
          style={{
            background:
              "linear-gradient(135deg, rgba(139, 110, 196, 0.2) 0%, rgba(155, 140, 232, 0.3) 50%, rgba(107, 91, 149, 0.15) 100%)",
          }}
        >
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{
              background:
                "linear-gradient(135deg, rgba(139, 110, 196, 0.3) 0%, rgba(155, 140, 232, 0.4) 50%, rgba(107, 91, 149, 0.2) 100%)",
            }}
          />
        </div>
      </div>
    );
  }

  const fallbackInitial = getInitialFromName(instructorName);

  return (
    <div
      className={cn(
        sizeClasses[size],
        "rounded-full bg-linear-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium",
        className
      )}
      title={instructorName}
    >
      <span
        className={cn(
          "transition-all duration-200 ease-in-out",
          fallbackTextClasses[size]
        )}
      >
        {fallbackInitial}
      </span>
    </div>
  );
}

export interface FacultyAvatarStackProps {
  faculty: FacultyAvatarItem[];
  maxVisible?: number;
  size?: FacultyAvatarSize;
  className?: string;
  avatarClassName?: string;
  overlapClassName?: string;
  remainingBadgeClassName?: string;
  showRemainingBadge?: boolean;
}

export function FacultyAvatarStack({
  faculty,
  maxVisible = 3,
  size = "md",
  className,
  avatarClassName,
  overlapClassName = "-space-x-2",
  remainingBadgeClassName,
  showRemainingBadge = true,
}: FacultyAvatarStackProps) {
  const normalized = (faculty ?? []).filter(Boolean) as FacultyAvatarItem[];

  if (normalized.length === 0) {
    return null;
  }

  const visible = normalized.slice(0, maxVisible);
  const remainingCount = normalized.length - visible.length;

  return (
    <div className={cn("flex items-center", className)}>
      <div className={cn("flex", overlapClassName)}>
        {visible.map((member, index) => {
          const instructorName = getFacultyDisplayName(member);
          const key =
            member?.id ?? `${instructorName || "faculty"}-${index}`;

          return (
            <FacultyAvatar
              key={key}
              imageUrl={getFacultyImageUrl(member)}
              cutoutImageUrl={getFacultyCutoutUrl(member)}
              instructorName={instructorName}
              size={size}
              className={avatarClassName}
            />
          );
        })}

        {showRemainingBadge && remainingCount > 0 && (
          <div
            className={cn(
              badgeSizeClasses[size],
              "rounded-full bg-gray-400 border-2 border-white dark:bg-gray-600 dark:border-gray-800 flex items-center justify-center text-white font-medium shadow-sm",
              remainingBadgeClassName
            )}
            title={`+${remainingCount} more instructor${
              remainingCount > 1 ? "s" : ""
            }`}
          >
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
}
