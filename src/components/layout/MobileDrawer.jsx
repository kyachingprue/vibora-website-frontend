import { useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import { AnimatePresence, motion } from "motion/react";
import { X, LogOut } from "lucide-react";
import { closeDrawer } from "@/store/uiSlice";
import { logout } from "@/store/authSlice";
import { mainNav } from "@/config/nav";
import NavItem from "./NavItem";
import { Logo } from "./Navbar";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/avatar";
import { ThemeSwitch } from "@/components/ThemeToggle";
import { compact } from "@/lib/utils";

/**
 * Left drawer opened by the 3-bar button.
 * It slides in horizontally: from the left edge (x: -100%) into view (x: 0).
 */
export default function MobileDrawer() {
  const open = useSelector((s) => s.ui.drawerOpen);
  const user = useSelector((s) => s.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const close = () => dispatch(closeDrawer());

  // Esc to close + lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && dispatch(closeDrawer());
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, dispatch]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={close}
          />
          <motion.aside
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Main menu"
            className="fixed inset-y-0 left-0 z-50 flex w-[85%] max-w-sm flex-col bg-white text-black shadow-2xl dark:bg-neutral-950 dark:text-white"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={{ left: 0.4, right: 0 }}
            onDragEnd={(_, info) => (info.offset.x < -80 || info.velocity.x < -400) && close()}
          >
            <div className="flex items-center justify-between border-b border-neutral-200 p-4 dark:border-neutral-800">
              <Logo />
              <Button variant="ghost" size="icon" aria-label="Close menu" onClick={close}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {user && (
              <Link to="/profile" onClick={close} className="flex items-center gap-3 border-b border-neutral-200 p-4 dark:border-neutral-800">
                <UserAvatar user={user} className="h-12 w-12" />
                <div className="min-w-0">
                  <p className="truncate font-bold">{user.name}</p>
                  <p className="truncate text-sm text-neutral-500 dark:text-neutral-400">
                    @{user.username} · {compact(user.followers)} followers
                  </p>
                </div>
              </Link>
            )}

            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
              {mainNav.map((item, i) => (
                <motion.div key={item.to} initial={{ x: -24, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.05 + i * 0.03 }}>
                  <NavItem item={item} onClick={close} />
                </motion.div>
              ))}
            </nav>

            <div className="flex flex-col gap-3 border-t border-neutral-200 p-4 dark:border-neutral-800">
              <ThemeSwitch />
              <Button
                variant="outline"
                onClick={() => {
                  dispatch(logout());
                  close();
                  navigate("/login");
                }}
              >
                <LogOut className="h-4 w-4" /> Log out
              </Button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
