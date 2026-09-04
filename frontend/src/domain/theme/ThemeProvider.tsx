import { useEffect, useState, type PropsWithChildren } from "react";

import type { Theme } from "../enums/theme";
import { useAuth } from "../auth/useAuth";
import { useSettings } from "../../features/settings/hooks/useSettings";
import { ThemeContext, type ResolvedTheme } from "./theme-context";

const getSystemTheme = (): ResolvedTheme => window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

export function ThemeProvider({ children }: PropsWithChildren) {
  const { status } = useAuth();
  const settingsQuery = useSettings(status === "AUTHENTICATED");
  const [theme, setTheme] = useState<Theme>("SYSTEM");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());
  const resolvedTheme = theme === "SYSTEM" ? systemTheme : theme.toLowerCase() as ResolvedTheme;

  useEffect(() => {
    const savedTheme = settingsQuery.data?.data.theme;
    if (savedTheme) queueMicrotask(() => setTheme(savedTheme));
  }, [settingsQuery.data]);

  useEffect(() => {
    document.documentElement.dataset.theme = resolvedTheme;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const updateSystemTheme = () => setSystemTheme(getSystemTheme());
    mediaQuery.addEventListener("change", updateSystemTheme);
    return () => mediaQuery.removeEventListener("change", updateSystemTheme);
  }, [resolvedTheme]);

  return <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>{children}</ThemeContext.Provider>;
}
