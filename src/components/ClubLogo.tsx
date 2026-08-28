import { cn } from "@/lib/utils";

type ClubLogoProps = {
  size?: number;
  className?: string;
  /** Show full wordmark logo (default) or compact mark */
  variant?: "full" | "mark";
};

export function ClubLogo({ size = 40, className, variant = "full" }: ClubLogoProps) {
  const height = size;
  const width = variant === "full" ? Math.round(size * 2.4) : size;

  return (
    <img
      src="/logo.png"
      alt="Giovinazzo Sunset Run"
      width={width}
      height={height}
      className={cn(
        "shrink-0 object-contain transition-transform group-hover:scale-105",
        className,
      )}
      style={{ height, width: variant === "mark" ? height : width }}
    />
  );
}
