import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";

export const Avatar = ({ className, ...props }) => (
  <AvatarPrimitive.Root className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props} />
);

export const AvatarImage = ({ className, ...props }) => (
  <AvatarPrimitive.Image className={cn("aspect-square h-full w-full object-cover", className)} {...props} />
);

export const AvatarFallback = ({ className, ...props }) => (
  <AvatarPrimitive.Fallback
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-neutral-200 text-sm font-semibold text-black dark:bg-neutral-700 dark:text-white",
      className
    )}
    {...props}
  />
);

/** Convenience wrapper: <UserAvatar user={user} className="h-12 w-12" /> */
export function UserAvatar({ user, className }) {
  return (
    <Avatar className={className}>
      <AvatarImage src={user?.avatar} alt={user?.name} />
      <AvatarFallback>{user?.name?.[0] ?? "?"}</AvatarFallback>
    </Avatar>
  );
}
