import React, { createContext, useContext, useEffect } from "react";
import { useCompany } from "./useCompany";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  const { company, companyId } = useCompany();
  const queryClient = useQueryClient();
  const theme = company?.theme || "light";

  const updateThemeMutation = useMutation({
    mutationFn: async (newTheme) => {
      if (!companyId) return;
      return base44.entities.Company.update(companyId, { theme: newTheme });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["company", companyId] });
    },
  });

  const setTheme = (newTheme) => {
    updateThemeMutation.mutate(newTheme);
  };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}