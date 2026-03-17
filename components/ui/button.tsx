import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-warm disabled:pointer-events-none disabled:opacity-60",
  {
    variants: {
      variant: {
        primary:
          "bg-gold-warm text-white hover:bg-[#b0742f] active:bg-[#9a652a]",
        secondary:
          "bg-white dark:bg-navy/30 border border-navy dark:border-gray-med text-navy dark:text-cream hover:bg-gray-light dark:hover:bg-navy/50",
        ghost:
          "bg-transparent text-blue-main hover:underline",
        danger:
          "bg-red-500 text-white hover:bg-red-600",
        pray:
          "bg-blue-soft dark:bg-navy/40 text-navy dark:text-cream border border-blue-200 dark:border-navy hover:bg-blue-main hover:text-white dark:hover:bg-blue-main",
        "pray-done":
          "bg-blue-main text-white border border-blue-main cursor-not-allowed",
      },
      size: {
        sm: "h-8 px-3 text-xs",
        md: "h-10 px-4 text-sm",
        lg: "h-12 px-6 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
