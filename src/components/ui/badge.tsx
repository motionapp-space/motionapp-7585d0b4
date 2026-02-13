import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        // DEFAULT is monochrome
        default: "border-transparent bg-accent text-accent-foreground",
        secondary: "border-transparent bg-accent text-accent-foreground",
        outline: "border-border text-foreground bg-transparent",
        destructive: "bg-destructive/10 text-foreground border border-destructive/40 [&>svg]:text-destructive",
        // Semantic variants use neutral text, icon gets color
        success: "bg-success/10 text-foreground border border-success/40 [&>svg]:text-success",
        warning: "bg-warning/12 text-foreground border border-warning/40 [&>svg]:text-warning",
        danger: "bg-destructive/10 text-foreground border border-destructive/40 [&>svg]:text-destructive",
        // Optional brand badge (use sparingly)
        brand: "border-transparent bg-primary text-primary-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant, ...props }, ref) => {
    return <div ref={ref} className={cn(badgeVariants({ variant }), className)} {...props} />;
  }
);
Badge.displayName = "Badge";

export { Badge, badgeVariants };
