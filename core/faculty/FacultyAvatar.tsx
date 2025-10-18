
interface FacultyAvatarProps {
  imageUrl: string;
  cutoutImageUrl?: string | null; // Pre-processed cutout image URL (can be null from database)
  instructorName: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  maskRadius?: number; // Configurable radius for the circular mask (default: 50)
  priority?: boolean; // For above-the-fold images
}

interface MultipleFacultyAvatarsProps {
  instructorNames: string[];
  className?: string;
  size?: "sm" | "md" | "lg";
  maxAvatars?: number; // Maximum number of avatars to show
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-12 w-12",
  lg: "h-16 w-16",
};

export function FacultyAvatar({
  imageUrl,
  cutoutImageUrl,
  instructorName,
  className = "",
  size = "md",
  maskRadius = 63, // Default radius of 50, can be adjusted (smaller = tighter mask, larger = looser mask)
  priority = false, // For above-the-fold images
}: FacultyAvatarProps) {

  // Check if we have a valid cutout image
  const hasCutout =
    cutoutImageUrl &&
    typeof cutoutImageUrl === "string" &&
    cutoutImageUrl.length > 0;


  // If we have a cutout image, use the SVG with cutout effects
  if (hasCutout) {
    return (
      <div
        className={`group relative ${sizeClasses[size]} transition-all duration-300 ease-in-out ${className}`}
        style={{ overflow: "visible" }}
        title={instructorName}
      >
        {/* Purple gradient background */}
        <div
          className="absolute inset-0 rounded-full z-0"
          style={{
            background:
              "linear-gradient(135deg, #6b5b95 0%, #886ec4 50%, #9b8ce8 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

     

        {/* Foreground layer with cutout image and effects */}
        <div className="absolute inset-0 z-20" style={{ overflow: "visible" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 -10 100 130"
            className="w-full h-full transition-all duration-300 ease-in-out"
            style={{
              overflow: "visible",
            }}
          >
            <defs>
              <clipPath id="maskImage" clipPathUnits="userSpaceOnUse">
                <path d="M -13 -40 L 113 -40 L 113 50 A 63 63 0 0 1 -13 50 Z" />
              </clipPath>
              <clipPath id="maskBackground" clipPathUnits="userSpaceOnUse">
                <circle cx="50" cy="50" r="63" />
              </clipPath>
            </defs>

            {/* Cutout image with original portrait-style clipping */}
            <g
              clipPath="url(#maskImage)"
              className="transition-all duration-300 ease-in-out [transform:translate(0,10px)] group-hover:[transform:translate(0,8px)]"
            >
              {/* Cutout image with purple tint and scaling effects */}
              <image
                width="120"
                height="144"
                x="-15"
                y="0"
                fill="none"
                className="transition-all duration-300 ease-in-out [transform-origin:50%_50%] [transform:translateY(-30px)_scale(1.5)] group-hover:[transform:translateY(-30px)_scale(1.7)] [filter:sepia(1)_hue-rotate(240deg)_saturate(0.8)_brightness(0.9)_contrast(1.2)] group-hover:[filter:sepia(1)_hue-rotate(240deg)_saturate(1.5)_brightness(1.2)_contrast(1.3)]"
                href={cutoutImageUrl}
              />
            </g>
          </svg>
        </div>
      </div>
    );
  }

  // Regular image rendering with purple tint and hover effects (fallback for no cutout)
  if (imageUrl) {
    return (
      <div
        className={`group relative ${sizeClasses[size]} transition-all duration-300 ease-in-out ${className}`}
        title={instructorName}
      >
        {/* Purple gradient background */}
        <div
          className="absolute inset-0 rounded-full z-0"
          style={{
            background:
              "linear-gradient(135deg, #6b5b95 0%, #886ec4 50%, #9b8ce8 100%)",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        ></div>

        {/* Regular image with purple tint and hover effects */}
        <div className="absolute inset-0 z-10 rounded-full overflow-hidden">
          <img
            src={imageUrl}
            alt={instructorName}
            className="w-full h-full object-cover rounded-full transition-all duration-300 ease-in-out scale-100 group-hover:scale-110 [filter:brightness(0.9)_saturate(1.1)_contrast(1.05)] group-hover:[filter:brightness(1.1)_saturate(1.2)_contrast(1.1)] [mix-blend-mode:multiply]"
          />
        </div>

        {/* Purple overlay for tint effect */}
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
          ></div>
        </div>
      </div>
    );
  }

  // Fallback for when no image URL is provided
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-purple-200 flex items-center justify-center ${className}`}
      title={instructorName}
    >
      <span className="text-sm transition-all duration-200 ease-in-out">
        👤
      </span>
    </div>
  );
}

// New component to handle multiple instructor avatars
export function MultipleFacultyAvatars({
  instructorNames,
  className = "",
  size = "md",
  maxAvatars = 3,
}: MultipleFacultyAvatarsProps) {
  // If no instructors, return null
  if (!instructorNames || instructorNames.length === 0) {
    return null;
  }

  // For multiple instructors, show up to maxAvatars
  const displayNames = instructorNames.slice(0, maxAvatars);
  const remainingCount = instructorNames.length - maxAvatars;

  const avatarSizeClasses = {
    sm: "h-6 w-6 text-xs",
    md: "h-8 w-8 text-sm",
    lg: "h-10 w-10 text-base",
  };

  // If only one instructor, use a simple avatar
  if (instructorNames.length === 1) {
    return (
      <div
        className={`${avatarSizeClasses[size]} rounded-full bg-purple-200 flex items-center justify-center ${className}`}
        title={instructorNames[0]}
      >
        <span className="text-sm transition-all duration-200 ease-in-out">
          👤
        </span>
      </div>
    );
  }

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {displayNames.map((name, index) => (
        <div
          key={`${name}-${index}`}
          className={`${avatarSizeClasses[size]} rounded-full bg-linear-to-br from-blue-400 to-purple-500 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-medium shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md`}
          title={name}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={`${avatarSizeClasses[size]} rounded-full bg-gray-400 dark:bg-gray-600 border-2 border-white dark:border-gray-800 flex items-center justify-center text-white font-medium shadow-sm transition-all duration-200 hover:scale-110 hover:shadow-md`}
          title={`+${remainingCount} more instructor${
            remainingCount > 1 ? "s" : ""
          }`}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
