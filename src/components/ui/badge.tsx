import * as React from "react";
import { cn } from "@/lib/utils";

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: "default" | "secondary" | "destructive" | "outline";
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variantClasses = {
    default: "bg-primary text-primary-foreground border-transparent hover:bg-primary/80",
    secondary: "bg-muted text-muted-foreground border-transparent hover:bg-muted/80",
    destructive: "bg-destructive text-destructive-foreground border-transparent hover:bg-destructive/80",
    outline: "text-foreground border-border bg-transparent"
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
