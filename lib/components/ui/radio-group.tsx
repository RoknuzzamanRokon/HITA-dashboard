"use client";

import React from "react";
import { clsx } from "clsx";

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

export interface RadioGroupProps {
  value: string;
  onChange: (value: string) => void;
  options: RadioOption[];
  name: string;
  label?: string;
  orientation?: "horizontal" | "vertical";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function RadioGroup({
  value,
  onChange,
  options,
  name,
  label,
  orientation = "vertical",
  size = "md",
  className,
}: RadioGroupProps) {
  return (
    <div className={clsx("space-y-3", className)}>
      {label && (
        <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
          {label}
        </label>
      )}

      <div
        className={clsx("space-y-2", {
          "flex space-y-0 space-x-4": orientation === "horizontal",
        })}
      >
        {options.map((option) => (
          <label
            key={option.value}
            className={clsx(
              "relative flex items-start cursor-pointer group",
              "p-3 rounded-xl border-2 transition-all duration-300 ease-out",
              "hover:shadow-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2",
              {
                "border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md":
                  value === option.value,
                "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600":
                  value !== option.value,
              }
            )}
          >
            <div className="flex items-center h-5">
              <input
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
                className="sr-only"
              />

              {/* Custom radio button */}
              <div
                className={clsx(
                  "relative rounded-full border-2 transition-all duration-300 ease-out",
                  "group-hover:scale-110 group-active:scale-95",
                  {
                    "w-4 h-4": size === "sm",
                    "w-5 h-5": size === "md",
                    "w-6 h-6": size === "lg",
                  },
                  {
                    "border-blue-500 bg-blue-500": value === option.value,
                    "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800":
                      value !== option.value,
                  }
                )}
              >
                {/* Inner dot */}
                {value === option.value && (
                  <div
                    className={clsx(
                      "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
                      "bg-white rounded-full animate-scale-in",
                      {
                        "w-1.5 h-1.5": size === "sm",
                        "w-2 h-2": size === "md",
                        "w-2.5 h-2.5": size === "lg",
                      }
                    )}
                  />
                )}

                {/* Glow effect */}
                {value === option.value && (
                  <div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 animate-pulse" />
                )}
              </div>
            </div>

            <div className="ml-3 flex-1">
              <div className="flex items-center gap-2">
                {option.icon && (
                  <span
                    className={clsx("transition-colors duration-300", {
                      "text-blue-600 dark:text-blue-400":
                        value === option.value,
                      "text-gray-500 dark:text-gray-400":
                        value !== option.value,
                    })}
                  >
                    {option.icon}
                  </span>
                )}
                <span
                  className={clsx(
                    "text-sm font-medium transition-colors duration-300",
                    {
                      "text-blue-900 dark:text-blue-100":
                        value === option.value,
                      "text-gray-900 dark:text-gray-100":
                        value !== option.value,
                    }
                  )}
                >
                  {option.label}
                </span>
              </div>

              {option.description && (
                <p
                  className={clsx(
                    "text-xs mt-1 transition-colors duration-300",
                    {
                      "text-blue-700 dark:text-blue-300":
                        value === option.value,
                      "text-gray-500 dark:text-gray-400":
                        value !== option.value,
                    }
                  )}
                >
                  {option.description}
                </p>
              )}
            </div>

            {/* Ripple effect */}
            <span className="absolute inset-0 rounded-xl overflow-hidden">
              <span className="absolute inset-0 bg-blue-500/10 transform scale-0 group-active:scale-100 transition-transform duration-200 rounded-xl" />
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
