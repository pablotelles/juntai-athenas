import { type LucideIcon, type LucideProps } from "lucide-react";
import { cn } from "@/lib/cn";

export interface IconProps extends LucideProps {
  icon: LucideIcon;
}

export function Icon({
  icon: IconComponent,
  className,
  size = 16,
  ...props
}: IconProps) {
  return (
    <IconComponent
      size={size}
      className={cn("shrink-0", className)}
      aria-hidden="true"
      {...props}
    />
  );
}
