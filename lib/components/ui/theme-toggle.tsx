"use client";

import React from "react";
import { useTheme } from "@/lib/contexts/theme-context";
import { Sun, Moon, Monitor } from "lucide-react";

export function ThemeToggle() {
  const { settings, updateSettings, resolvedTheme } = useTheme();

  const themes = [
    { value: "light" as const, icon: Sun, label: "Light" },
    { value: "dark" as const, icon: Moon, label: "Dark" },
    { value: "system" as const, icon: Monitor, label: "System" },
  ];

  return (
    <div className="flex items-center gap-1 p-1 bg-[rgb(var(--bg-secondary))] rounded-lg border border-[rgb(var(--border-primary))]">
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => updateSettings({ theme: value })}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md transition-all
            ${
              settings.theme === value
                ? "bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))] shadow-sm"
                : "text-[rgb(var(--text-tertiary))]"
            }
          `}
          title={`Switch to ${label} mode`}
          aria-label={`Switch to ${label} mode`}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
}

export function ThemeToggleCompact() {
  const { toggleTheme, resolvedTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] transition-all"
      title={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      aria-label={`Switch to ${
        resolvedTheme === "dark" ? "light" : "dark"
      } mode`}
    >
      {resolvedTheme === "dark" ? (
        <Sun className="w-5 h-5 text-[rgb(var(--text-primary))]" />
      ) : (
        <Moon className="w-5 h-5 text-[rgb(var(--text-primary))]" />
      )}
    </button>
  );
}
