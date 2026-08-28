import { cn } from "@/lib/utils";

type ClubLogoProps = {
  size?: number;
  className?: string;
};

export function ClubLogo({ size = 48, className }: ClubLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Giovinazzo Sunset Run"
      width={size}
      height={size}
      className={cn(
        "shrink-0 object-contain transition-transform group-hover:scale-105",
        className,
      )}
      style={{ width: size, height: size }}
    />
  );
}
