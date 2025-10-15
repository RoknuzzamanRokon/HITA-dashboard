"use client";

import React from "react";
import { clsx } from "clsx";
import { Check } from "lucide-react";

export interface ColorOption {
  name: string;
  value: string;
  color: string;
  gradient?: string;
}

export interface ColorPickerProps {
  value: string;
  onChange: (value: string) => void;
  options: ColorOption[];
  label?: string;
  className?: string;
}

const defaultColors: ColorOption[] = [
  {
    name: "Blue",
    value: "blue",
    color: "#3b82f6",
    gradient: "from-blue-500 to-blue-600",
  },
  {
    name: "Purple",
    value: "purple",
    color: "#8b5cf6",
    gradient: "from-purple-500 to-purple-600",
  },
  {
    name: "Pink",
    value: "pink",
    color: "#ec4899",
    gradient: "from-pink-500 to-pink-600",
  },
  {
    name: "Green",
    value: "green",
    color: "#10b981",
    gradient: "from-green-500 to-green-600",
  },
  {
    name: "Orange",
    value: "orange",
    color: "#f59e0b",
    gradient: "from-orange-500 to-orange-600",
  },
  {
    name: "Red",
    value: "red",
    color: "#ef4444",
    gradient: "from-red-500 to-red-600",
  },
  {
    name: "Cyan",
    value: "cyan",
    color: "#06b6d4",
    gradient: "from-cyan-500 to-cyan-600",
  },
  {
    name: "Indigo",
    value: "indigo",
    color: "#6366f1",
    gradient: "from-indigo-500 to-indigo-600",
  },
];

export function ColorPicker({
  value,
  onChange,
  options = defaultColors,
  label,
  className,
}: ColorPickerProps) {
  return (
    <div className={clsx("space-y-3", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </label>
      )}

      <div className="grid grid-cols-4 gap-3">
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={clsx(
              "relative w-12 h-12 rounded-xl transition-all duration-300 ease-out",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              "focus-visible:ring-blue-500 hover:scale-110 active:scale-95",
              "group overflow-hidden shadow-lg hover:shadow-xl",
              {
                "ring-2 ring-gray-900 dark:ring-white ring-offset-2":
                  value === option.value,
              }
            )}
            style={{ backgroundColor: option.color }}
            title={option.name}
          >
            {/* Gradient overlay */}
            {option.gradient && (
              <div
                className={clsx(
                  "absolute inset-0 bg-gradient-to-br opacity-80",
                  option.gradient
                )}
              />
            )}

            {/* Hover effect */}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Selected indicator */}
            {value === option.value && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 rounded-full p-1 animate-scale-in">
                  <Check className="w-4 h-4 text-gray-900" />
                </div>
              </div>
            )}

            {/* Ripple effect */}
            <span className="absolute inset-0 rounded-xl overflow-hidden">
              <span className="absolute inset-0 bg-white/30 transform scale-0 group-active:scale-100 transition-transform duration-200 rounded-xl" />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
