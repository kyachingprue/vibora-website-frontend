import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-20 w-full resize-none rounded-xl border border-neutral-300 bg-white px-4 py-3 text-sm text-black placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-400",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
