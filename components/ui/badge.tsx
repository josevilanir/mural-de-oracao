import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        active:    "bg-blue-100 text-blue-700",
        chronic:   "bg-amber-100 text-amber-700",
        answered:  "bg-green-100 text-green-700",
        testimony: "bg-yellow-400 text-white font-bold animate-bounce",
        anonymous: "bg-gray-100 text-gray-500",
        category:  "bg-cream text-navy border border-gray-med",
        admin:     "bg-red-100 text-red-700",
      },
    },
    defaultVariants: {
      variant: "active",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
