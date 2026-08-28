import { cn } from "@/lib/utils";

type ClubLogoProps = {
  size?: number;
  className?: string;
};

export function ClubLogo({ size = 32, className }: ClubLogoProps) {
  return (
    <img
      src="/logo.svg"
      alt="Run Club Giovinazzo"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-full transition-transform group-hover:scale-110", className)}
    />
  );
}
