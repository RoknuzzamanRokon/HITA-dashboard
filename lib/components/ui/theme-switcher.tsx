/**
 * Theme Switcher Component
 * Allows users to switch between different color themes
 */

"use client";

import React, { useState, useEffect } from "react";

export type Theme = "blue" | "black" | "orange" | "teal";

interface ThemeSwitcherProps {
  className?: string;
}

export function ThemeSwitcher({ className }: ThemeSwitcherProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme>("blue");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem("theme") as Theme;
    if (savedTheme) {
      setCurrentTheme(savedTheme);
      applyTheme(savedTheme);
    }
  }, []);

  const applyTheme = (theme: Theme) => {
    const root = document.documentElement;
    if (theme === "blue") {
      root.removeAttribute("data-theme");
    } else {
      root.setAttribute("data-theme", theme);
    }
    localStorage.setItem("theme", theme);
  };

  const handleThemeChange = (theme: Theme) => {
    setCurrentTheme(theme);
    applyTheme(theme);
    setIsOpen(false);
  };

  const themes: { value: Theme; label: string; color: string; icon: string }[] =
    [
      { value: "blue", label: "Blue", color: "#3b82f6", icon: "🔵" },
      { value: "black", label: "Black", color: "#1f2937", icon: "⚫" },
      { value: "orange", label: "Orange", color: "#f97316", icon: "🟠" },
      { value: "teal", label: "Teal", color: "#14b8a6", icon: "🟢" },
    ];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-gray-200 transition-colors shadow-sm"
        aria-label="Change theme"
      >
        <svg
          className="h-5 w-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700">Theme</span>
        <svg
          className={`h-4 w-4 text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 overflow-hidden">
            <div className="p-3">
              <div className="mb-3 pb-3 border-b border-gray-200">
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  Choose Your Theme Color
                </h3>
                <p className="text-xs text-gray-500">
                  Select a color theme for your dashboard
                </p>
              </div>
              <div className="space-y-1">
                {themes.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => handleThemeChange(theme.value)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-all ${
                      currentTheme === theme.value
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-gray-900 shadow-sm"
                        : "text-gray-700"
                    }`}
                  >
                    <span className="text-2xl">{theme.icon}</span>
                    <span className="flex-1 text-left">
                      <span className="block font-semibold text-sm">
                        {theme.label}
                      </span>
                      <span className="block text-xs text-gray-500">
                        {theme.value === "blue" && "Professional & Clean"}
                        {theme.value === "black" && "Elegant & Modern"}
                        {theme.value === "orange" && "Vibrant & Energetic"}
                        {theme.value === "teal" && "Fresh & Contemporary"}
                      </span>
                    </span>
                    <div
                      className="w-8 h-8 rounded-lg border-2 border-gray-200 shadow-sm"
                      style={{ backgroundColor: theme.color }}
                    />
                    {currentTheme === theme.value && (
                      <svg
                        className="h-5 w-5 text-green-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
