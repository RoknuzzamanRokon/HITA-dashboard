"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";

export interface ThemeSettings {
  theme: Theme;
  accentColor: string;
  borderRadius: "none" | "sm" | "md" | "lg" | "xl";
  animations: boolean;
  reducedMotion: boolean;
}

interface ThemeContextType {
  settings: ThemeSettings;
  updateSettings: (newSettings: Partial<ThemeSettings>) => void;
  resolvedTheme: "light" | "dark";
}

const defaultSettings: ThemeSettings = {
  theme: "system",
  accentColor: "blue",
  borderRadius: "md",
  animations: true,
  reducedMotion: false,
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [settings, setSettings] = useState<ThemeSettings>(defaultSettings);
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  // Load settings from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const savedSettings = localStorage.getItem("theme-settings");
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Failed to parse theme settings:", error);
      }
    }
  }, []);

  // Update resolved theme based on settings and system preference
  useEffect(() => {
    const updateResolvedTheme = () => {
      if (settings.theme === "system") {
        const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
          .matches
          ? "dark"
          : "light";
        setResolvedTheme(systemTheme);
      } else {
        setResolvedTheme(settings.theme);
      }
    };

    updateResolvedTheme();

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateResolvedTheme);

    return () => mediaQuery.removeEventListener("change", updateResolvedTheme);
  }, [settings.theme]);

  // Apply theme to document (only after mount to avoid hydration issues)
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Apply theme class
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);

    // Apply accent color
    root.style.setProperty("--accent-color", settings.accentColor);

    // Apply border radius
    const radiusMap = {
      none: "0px",
      sm: "0.25rem",
      md: "0.5rem",
      lg: "0.75rem",
      xl: "1rem",
    };
    root.style.setProperty("--border-radius", radiusMap[settings.borderRadius]);

    // Apply animation preferences
    if (settings.reducedMotion || !settings.animations) {
      root.style.setProperty("--animation-duration", "0.01ms");
    } else {
      root.style.setProperty("--animation-duration", "150ms");
    }
  }, [mounted, resolvedTheme, settings]);

  const updateSettings = (newSettings: Partial<ThemeSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    // Save to localStorage
    localStorage.setItem("theme-settings", JSON.stringify(updatedSettings));
  };

  return (
    <ThemeContext.Provider value={{ settings, updateSettings, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  // Add simplified theme helpers
  const theme = context.resolvedTheme;
  const setTheme = (newTheme: "light" | "dark" | "system") => {
    context.updateSettings({ theme: newTheme });
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return {
    ...context,
    theme,
    setTheme,
    toggleTheme,
  };
}
