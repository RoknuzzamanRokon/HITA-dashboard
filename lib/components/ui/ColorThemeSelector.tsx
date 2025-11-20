"use client";

import React, { useState } from "react";
import { Check } from "lucide-react";
import { useTheme } from "@/lib/contexts/theme-context";

export interface ColorTheme {
  id: string;
  name: string;
  primary: string;
  primaryRgb: string;
  hover: string;
  light: string;
}

export const colorThemes: ColorTheme[] = [
  {
    id: "blue",
    name: "Blue",
    primary: "#3b82f6",
    primaryRgb: "59, 130, 246",
    hover: "#2563eb",
    light: "#dbeafe",
  },
  {
    id: "red",
    name: "Red",
    primary: "#ef4444",
    primaryRgb: "239, 68, 68",
    hover: "#dc2626",
    light: "#fee2e2",
  },
  {
    id: "green",
    name: "Green",
    primary: "#10b981",
    primaryRgb: "16, 185, 129",
    hover: "#059669",
    light: "#d1fae5",
  },
  {
    id: "purple",
    name: "Purple",
    primary: "#8b5cf6",
    primaryRgb: "139, 92, 246",
    hover: "#7c3aed",
    light: "#ede9fe",
  },
  {
    id: "orange",
    name: "Orange",
    primary: "#f97316",
    primaryRgb: "249, 115, 22",
    hover: "#ea580c",
    light: "#ffedd5",
  },
  {
    id: "pink",
    name: "Pink",
    primary: "#ec4899",
    primaryRgb: "236, 72, 153",
    hover: "#db2777",
    light: "#fce7f3",
  },
  {
    id: "teal",
    name: "Teal",
    primary: "#14b8a6",
    primaryRgb: "20, 184, 166",
    hover: "#0d9488",
    light: "#ccfbf1",
  },
  {
    id: "indigo",
    name: "Indigo",
    primary: "#6366f1",
    primaryRgb: "99, 102, 241",
    hover: "#4f46e5",
    light: "#e0e7ff",
  },
  {
    id: "black",
    name: "Black",
    primary: "#1f2937",
    primaryRgb: "31, 41, 55",
    hover: "#111827",
    light: "#f3f4f6",
  },
  {
    id: "yellow",
    name: "Yellow",
    primary: "#eab308",
    primaryRgb: "234, 179, 8",
    hover: "#ca8a04",
    light: "#fef9c3",
  },
  {
    id: "cyan",
    name: "Cyan",
    primary: "#06b6d4",
    primaryRgb: "6, 182, 212",
    hover: "#0891b2",
    light: "#cffafe",
  },
  {
    id: "lime",
    name: "Lime",
    primary: "#84cc16",
    primaryRgb: "132, 204, 22",
    hover: "#65a30d",
    light: "#ecfccb",
  },
  {
    id: "rose",
    name: "Rose",
    primary: "#f43f5e",
    primaryRgb: "244, 63, 94",
    hover: "#e11d48",
    light: "#ffe4e6",
  },
  {
    id: "amber",
    name: "Amber",
    primary: "#f59e0b",
    primaryRgb: "245, 158, 11",
    hover: "#d97706",
    light: "#fef3c7",
  },
  {
    id: "emerald",
    name: "Emerald",
    primary: "#10b981",
    primaryRgb: "16, 185, 129",
    hover: "#059669",
    light: "#d1fae5",
  },
  {
    id: "violet",
    name: "Violet",
    primary: "#7c3aed",
    primaryRgb: "124, 58, 237",
    hover: "#6d28d9",
    light: "#ede9fe",
  },
  {
    id: "sky",
    name: "Sky",
    primary: "#0ea5e9",
    primaryRgb: "14, 165, 233",
    hover: "#0284c7",
    light: "#e0f2fe",
  },
];

interface ColorThemeSelectorProps {
  onClose?: () => void;
}

export const ColorThemeSelector: React.FC<ColorThemeSelectorProps> = ({
  onClose,
}) => {
  const { settings, updateSettings } = useTheme();
  const [selectedColor, setSelectedColor] = useState(settings.accentColor);

  const handleColorSelect = (colorId: string) => {
    setSelectedColor(colorId);
    updateSettings({ accentColor: colorId });

    // Apply color immediately
    const theme = colorThemes.find((t) => t.id === colorId);
    if (theme) {
      document.documentElement.style.setProperty(
        "--primary-color",
        theme.primary
      );
      document.documentElement.style.setProperty(
        "--primary-rgb",
        theme.primaryRgb
      );
      document.documentElement.style.setProperty(
        "--primary-hover",
        theme.hover
      );
      document.documentElement.style.setProperty(
        "--primary-light",
        theme.light
      );
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Choose Your Theme Color
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Select a color to personalize your experience
      </p>

      <div className="grid grid-cols-9 gap-4">
        {colorThemes.map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleColorSelect(theme.id)}
            className="relative flex flex-col items-center gap-3 p-4 rounded-lg border-2 transition-all hover:scale-105"
            style={{
              borderColor:
                selectedColor === theme.id ? theme.primary : "#e5e7eb",
              backgroundColor:
                selectedColor === theme.id ? theme.light : "white",
            }}
            aria-label={`Select ${theme.name} theme`}
            type="button"
          >
            {/* Color Circle */}
            <div
              className="w-16 h-16 rounded-full shadow-md flex items-center justify-center"
              style={{ backgroundColor: theme.primary }}
            >
              {selectedColor === theme.id && (
                <Check className="w-7 h-7 text-white" aria-hidden="true" />
              )}
            </div>

            {/* Color Name */}
            <span
              className="text-sm font-medium"
              style={{
                color: selectedColor === theme.id ? theme.primary : "#374151",
              }}
            >
              {theme.name}
            </span>
          </button>
        ))}
      </div>

      {onClose && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
            style={{
              backgroundColor:
                colorThemes.find((t) => t.id === selectedColor)?.primary ||
                "#3b82f6",
            }}
            type="button"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
};
