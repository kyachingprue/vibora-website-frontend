import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    variant: {
      default: "bg-brand-600 text-white",
      secondary: "bg-neutral-100 text-black dark:bg-neutral-800 dark:text-white",
      outline: "border border-neutral-300 text-black dark:border-neutral-700 dark:text-white",
    },
  },
  defaultVariants: { variant: "default" },
});

export const Badge = ({ className, variant, ...props }) => <span className={cn(badgeVariants({ variant }), className)} {...props} />;
