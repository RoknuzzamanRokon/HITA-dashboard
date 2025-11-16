"use client";

import React, { useState } from "react";
import { Palette } from "lucide-react";
import { ColorThemeSelector, colorThemes } from "./ColorThemeSelector";
import { useTheme } from "@/lib/contexts/theme-context";

export const ColorThemeButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useTheme();

  const currentTheme = colorThemes.find((t) => t.id === settings.accentColor);

  return (
    <div className="relative">
      {/* Theme Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          focusRingColor: currentTheme?.primary || "#3b82f6",
        }}
        aria-label="Change theme color"
        type="button"
      >
        <div
          className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
          style={{ backgroundColor: currentTheme?.primary || "#3b82f6" }}
        />
        <Palette className="w-4 h-4 text-gray-600" aria-hidden="true" />
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
          Theme
        </span>
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fade-in">
            <ColorThemeSelector onClose={() => setIsOpen(false)} />
          </div>
        </>
      )}
    </div>
  );
};
