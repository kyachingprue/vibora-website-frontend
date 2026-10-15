import { NavLink } from "react-router";
import { useSelector } from "react-redux";
import { motion } from "motion/react";
import { bottomNav } from "@/config/nav";
import { selectUnread } from "@/store/notificationsSlice";
import { cn } from "@/lib/utils";

/** Fixed bottom bar — only on small devices (hidden from md and up) */
export default function BottomNav() {
  const unread = useSelector(selectUnread);

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-lg md:hidden dark:border-neutral-800 dark:bg-neutral-950/90"
    >
      <ul className="mx-auto flex h-16 max-w-md items-center justify-around px-2">
        {bottomNav.map(({ to, label, icon: Icon, end, primary, badge }) => (
          <li key={to}>
            <NavLink to={to} end={end} aria-label={label} className="block">
              {({ isActive }) =>
                primary ? (
                  <motion.span
                    whileTap={{ scale: 0.9 }}
                    className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-600 to-pink-500 text-white shadow-lg"
                  >
                    <Icon className="h-6 w-6" />
                  </motion.span>
                ) : (
                  <motion.span
                    whileTap={{ scale: 0.85 }}
                    className={cn(
                      "relative flex flex-col items-center gap-0.5 px-3 py-1 text-[11px] font-semibold",
                      isActive ? "text-brand-600 dark:text-brand-400" : "text-neutral-600 dark:text-neutral-400"
                    )}
                  >
                    <span className="relative">
                      <Icon className="h-6 w-6" strokeWidth={isActive ? 2.6 : 2} />
                      {badge && unread > 0 && (
                        <span className="absolute -right-2 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-pink-500 px-1 text-[10px] font-bold text-white">
                          {unread}
                        </span>
                      )}
                    </span>
                    {label}
                  </motion.span>
                )
              }
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
