import { cn } from "@/lib/utils";

export const Card = ({ className, ...props }) => (
  <div
    className={cn(
      "rounded-2xl border border-neutral-200 bg-white text-black shadow-sm dark:border-neutral-800 dark:bg-neutral-900 dark:text-white",
      className
    )}
    {...props}
  />
);

export const CardHeader = ({ className, ...props }) => <div className={cn("flex flex-col gap-1 p-4", className)} {...props} />;
export const CardTitle = ({ className, ...props }) => <h3 className={cn("text-base font-bold", className)} {...props} />;
export const CardDescription = ({ className, ...props }) => (
  <p className={cn("text-sm text-neutral-500 dark:text-neutral-400", className)} {...props} />
);
export const CardContent = ({ className, ...props }) => <div className={cn("p-4 pt-0", className)} {...props} />;
export const CardFooter = ({ className, ...props }) => <div className={cn("flex items-center p-4 pt-0", className)} {...props} />;
