import React, { createContext, useContext, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

// "light" | "dark" | "system"
const ThemeContext = createContext({
  theme: "light",
  resolvedTheme: "light",
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem("pitchnode_theme") || "light";
  });

  const getResolved = (t) => {
    if (t === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return t;
  };

  const [resolvedTheme, setResolvedTheme] = useState(() => getResolved(localStorage.getItem("pitchnode_theme") || "light"));

  const applyTheme = (t) => {
    const resolved = getResolved(t);
    setResolvedTheme(resolved);
    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  useEffect(() => {
    applyTheme(theme);
    // Listen for system preference changes when in "system" mode
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => { if (theme === "system") applyTheme("system"); };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem("pitchnode_theme", newTheme);
    applyTheme(newTheme);
    // Persist to user profile
    try {
      await base44.auth.updateMe({ theme_preference: newTheme });
    } catch (e) {
      // non-critical
    }
  };

  // On mount: sync from user profile if available
  useEffect(() => {
    (async () => {
      try {
        const user = await base44.auth.me();
        if (user?.theme_preference && user.theme_preference !== theme) {
          setThemeState(user.theme_preference);
          localStorage.setItem("pitchnode_theme", user.theme_preference);
          applyTheme(user.theme_preference);
        }
      } catch (e) {
        // not logged in, use localStorage
      }
    })();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);