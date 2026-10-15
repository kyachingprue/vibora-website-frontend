import { useEffect } from "react";
import { useSelector } from "react-redux";

/**
 * Applies the `dark` class on <html> based on the Redux theme mode.
 * light  -> always light
 * dark   -> always dark
 * system -> follows the OS and reacts to OS changes live
 */
export default function ThemeProvider({ children }) {
  const mode = useSelector((s) => s.theme.mode);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const dark = mode === "dark" || (mode === "system" && media.matches);
      document.documentElement.classList.toggle("dark", dark);
    };
    apply();
    if (mode === "system") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [mode]);

  return children;
}
