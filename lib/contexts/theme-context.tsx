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

  // Always use light theme (dark mode removed)
  useEffect(() => {
    setResolvedTheme("light");
  }, []);

  // Apply theme to document (only after mount to avoid hydration issues)
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;

    // Always apply light theme
    root.classList.remove("light", "dark");
    root.classList.add("light");

    // Apply accent color with full color theme
    root.style.setProperty("--accent-color", settings.accentColor);

    // Apply color theme variables
    const colorThemes: Record<
      string,
      { primary: string; primaryRgb: string; hover: string; light: string }
    > = {
      blue: {
        primary: "#3b82f6",
        primaryRgb: "59, 130, 246",
        hover: "#2563eb",
        light: "#dbeafe",
      },
      red: {
        primary: "#ef4444",
        primaryRgb: "239, 68, 68",
        hover: "#dc2626",
        light: "#fee2e2",
      },
      green: {
        primary: "#10b981",
        primaryRgb: "16, 185, 129",
        hover: "#059669",
        light: "#d1fae5",
      },
      purple: {
        primary: "#8b5cf6",
        primaryRgb: "139, 92, 246",
        hover: "#7c3aed",
        light: "#ede9fe",
      },
      orange: {
        primary: "#f97316",
        primaryRgb: "249, 115, 22",
        hover: "#ea580c",
        light: "#ffedd5",
      },
      pink: {
        primary: "#ec4899",
        primaryRgb: "236, 72, 153",
        hover: "#db2777",
        light: "#fce7f3",
      },
      teal: {
        primary: "#14b8a6",
        primaryRgb: "20, 184, 166",
        hover: "#0d9488",
        light: "#ccfbf1",
      },
      indigo: {
        primary: "#6366f1",
        primaryRgb: "99, 102, 241",
        hover: "#4f46e5",
        light: "#e0e7ff",
      },
      black: {
        primary: "#1f2937",
        primaryRgb: "31, 41, 55",
        hover: "#111827",
        light: "#f3f4f6",
      },
      yellow: {
        primary: "#eab308",
        primaryRgb: "234, 179, 8",
        hover: "#ca8a04",
        light: "#fef9c3",
      },
      cyan: {
        primary: "#06b6d4",
        primaryRgb: "6, 182, 212",
        hover: "#0891b2",
        light: "#cffafe",
      },
      lime: {
        primary: "#84cc16",
        primaryRgb: "132, 204, 22",
        hover: "#65a30d",
        light: "#ecfccb",
      },
      rose: {
        primary: "#f43f5e",
        primaryRgb: "244, 63, 94",
        hover: "#e11d48",
        light: "#ffe4e6",
      },
      amber: {
        primary: "#f59e0b",
        primaryRgb: "245, 158, 11",
        hover: "#d97706",
        light: "#fef3c7",
      },
      emerald: {
        primary: "#10b981",
        primaryRgb: "16, 185, 129",
        hover: "#059669",
        light: "#d1fae5",
      },
      violet: {
        primary: "#7c3aed",
        primaryRgb: "124, 58, 237",
        hover: "#6d28d9",
        light: "#ede9fe",
      },
      sky: {
        primary: "#0ea5e9",
        primaryRgb: "14, 165, 233",
        hover: "#0284c7",
        light: "#e0f2fe",
      },
    };

    const theme = colorThemes[settings.accentColor] || colorThemes.blue;
    root.style.setProperty("--primary-color", theme.primary);
    root.style.setProperty("--primary-rgb", theme.primaryRgb);
    root.style.setProperty("--primary-hover", theme.hover);
    root.style.setProperty("--primary-light", theme.light);

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
