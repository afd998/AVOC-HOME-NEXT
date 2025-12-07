import { cn } from "@/lib/utils";

type IconProps = {
  className?: string;
  muted?: boolean;
};

export function ZoomIcon({ className, muted }: IconProps) {
  return (
    <img
      src="/images/zoomicon.png"
      alt="Zoom"
      className={cn(
        "size-4 select-none",
        className,
        muted && "opacity-40 grayscale"
      )}
      loading="lazy"
    />
  );
}

export function RecordingIcon({ className, muted }: IconProps) {
  return (
    <img
      src="/images/icons8-record-50.png"
      alt="Recording"
      className={cn(
        "size-4 select-none",
        className,
        muted && "opacity-40 grayscale"
      )}
      loading="lazy"
    />
  );
}
