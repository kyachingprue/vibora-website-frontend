import { useDispatch, useSelector } from "react-redux";
import { Sun, Moon, Monitor } from "lucide-react";
import { motion } from "motion/react";
import { setTheme } from "@/store/themeSlice";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

/** Compact button: cycles light -> dark -> system */
export function ThemeCycleButton() {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.theme.mode);
  const idx = OPTIONS.findIndex((o) => o.value === mode);
  const next = OPTIONS[(idx + 1) % OPTIONS.length];
  const Icon = OPTIONS[idx].icon;

  return (
    <Button variant="ghost" size="icon" aria-label={`Theme: ${mode}. Switch to ${next.label}`} title={`Theme: ${OPTIONS[idx].label}`} onClick={() => dispatch(setTheme(next.value))}>
      <motion.span key={mode} initial={{ rotate: -90, scale: 0.5, opacity: 0 }} animate={{ rotate: 0, scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
        <Icon className="h-5 w-5" />
      </motion.span>
    </Button>
  );
}

/** Segmented control: Light | Dark | System */
export function ThemeSwitch({ className }) {
  const dispatch = useDispatch();
  const mode = useSelector((s) => s.theme.mode);

  return (
    <div className={cn("relative flex rounded-full bg-neutral-100 p-1 dark:bg-neutral-800", className)} role="radiogroup" aria-label="Theme">
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = mode === value;
        return (
          <button
            key={value}
            role="radio"
            aria-checked={active}
            onClick={() => dispatch(setTheme(value))}
            className={cn(
              "relative z-10 flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors",
              active ? "text-black dark:text-white" : "text-neutral-500 hover:text-black dark:text-neutral-400 dark:hover:text-white"
            )}
          >
            {active && <motion.span layoutId="theme-pill" className="absolute inset-0 -z-10 rounded-full bg-white shadow dark:bg-neutral-600" transition={{ type: "spring", stiffness: 400, damping: 32 }} />}
            <Icon className="h-4 w-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
