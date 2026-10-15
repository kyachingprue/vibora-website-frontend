import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef(({ className, type = "text", ...props }, ref) => (
  <input
    ref={ref}
    type={type}
    className={cn(
      "flex h-10 w-full rounded-full border border-neutral-300 bg-white px-4 text-sm text-black placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-400",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";
