"use client";

import React from "react";
import { clsx } from "clsx";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  label?: string;
  description?: string;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  size = "md",
  label,
  description,
  className,
}: ToggleProps) {
  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  return (
    <div className={clsx("flex items-start gap-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled}
        onClick={handleToggle}
        className={clsx(
          "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent",
          "transition-all duration-300 ease-out focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          "group overflow-hidden",
          {
            // Size variants
            "h-5 w-9": size === "sm",
            "h-6 w-11": size === "md",
            "h-7 w-13": size === "lg",
          },
          {
            // Checked state
            "bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg":
              checked && !disabled,
            "bg-gradient-to-r from-gray-200 to-gray-300": !checked && !disabled,
            "bg-gray-100": disabled,
          }
        )}
      >
        {/* Background glow effect */}
        <span
          className={clsx(
            "absolute inset-0 rounded-full transition-all duration-300",
            {
              "shadow-[0_0_20px_rgba(59,130,246,0.4)]": checked && !disabled,
              "shadow-none": !checked || disabled,
            }
          )}
        />

        {/* Toggle thumb */}
        <span
          className={clsx(
            "pointer-events-none inline-block rounded-full bg-white shadow-lg ring-0",
            "transition-all duration-300 ease-out transform",
            "group-hover:scale-110 group-active:scale-95",
            {
              // Size variants for thumb
              "h-4 w-4": size === "sm",
              "h-5 w-5": size === "md",
              "h-6 w-6": size === "lg",
            },
            {
              // Position based on size and state
              "translate-x-0": !checked && size === "sm",
              "translate-x-4": checked && size === "sm",
              "translate-x-0": !checked && size === "md",
              "translate-x-5": checked && size === "md",
              "translate-x-0": !checked && size === "lg",
              "translate-x-6": checked && size === "lg",
            }
          )}
        >
          {/* Inner glow effect */}
          <span
            className={clsx(
              "absolute inset-0 rounded-full transition-all duration-300",
              {
                "bg-gradient-to-r from-blue-100 to-blue-200":
                  checked && !disabled,
                "bg-white": !checked || disabled,
              }
            )}
          />
        </span>

        {/* Ripple effect */}
        <span className="absolute inset-0 rounded-full overflow-hidden">
          <span className="absolute inset-0 bg-white/30 transform scale-0 group-active:scale-100 transition-transform duration-200 rounded-full" />
        </span>
      </button>

      {(label || description) && (
        <div className="flex flex-col">
          {label && (
            <label
              className={clsx(
                "text-sm font-medium text-gray-900 dark:text-gray-100 cursor-pointer",
                { "opacity-50": disabled }
              )}
              onClick={handleToggle}
            >
              {label}
            </label>
          )}
          {description && (
            <p
              className={clsx("text-xs text-gray-500 dark:text-gray-400 mt-1", {
                "opacity-50": disabled,
              })}
            >
              {description}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
