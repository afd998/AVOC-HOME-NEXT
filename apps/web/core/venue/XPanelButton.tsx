import Image from "next/image";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type XPanelButtonVariant = "label" | "icon";

type XPanelButtonProps = {
  href?: string | null;
  variant?: XPanelButtonVariant;
  className?: string;
  title?: string;
};

export function XPanelButton({
  href,
  variant = "label",
  className,
  title,
}: XPanelButtonProps) {
  const isIconOnly = variant === "icon";
  const buttonClasses = cn(
    "bg-blue-100 text-blue-900 hover:bg-blue-200 border border-blue-200",
    isIconOnly ? "px-2 py-2 h-9 w-9" : "gap-2",
    className
  );

  const image = (
    <Image
      src="/images/crestron_swirl_blue_cmyk.png"
      alt="Crestron"
      width={24}
      height={24}
      className={cn("h-6 w-6 rounded-sm object-contain", isIconOnly && "h-5 w-5")}
    />
  );

  const label = variant === "label" ? <span>XPanel</span> : null;
  const ariaLabel = title ?? "Open Crestron XPanel";

  if (href) {
    return (
      <Button
        asChild
        size={isIconOnly ? "icon" : "default"}
        className={buttonClasses}
      >
        <a
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={isIconOnly ? ariaLabel : undefined}
        >
          {image}
          {label}
        </a>
      </Button>
    );
  }

  return (
    <Button
      size={isIconOnly ? "icon" : "default"}
      className={buttonClasses}
      disabled
      title={title ?? "No Crestron link available for this venue"}
      aria-label={ariaLabel}
    >
      {image}
      {label}
    </Button>
  );
}
