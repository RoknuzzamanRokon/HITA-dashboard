/**
 * Button component with loading states and variants
 */

"use client";

import React, { forwardRef } from "react";
import { clsx } from "clsx";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "gradient"
    | "danger";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        className={clsx(
          // Base styles
          "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 ease-out",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "relative overflow-hidden group",
          "transform active:scale-95",

          // Size variants
          {
            "h-8 px-3 text-xs": size === "sm",
            "h-10 px-4 py-2 text-sm": size === "md",
            "h-12 px-6 py-3 text-base": size === "lg",
            "h-14 px-8 py-4 text-lg": size === "xl",
          },

          // Color variants
          {
            // Primary - Blue gradient
            "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl":
              variant === "primary",
            "hover:from-blue-700 hover:to-blue-800 focus-visible:ring-blue-600":
              variant === "primary",

            // Secondary - Gray gradient
            "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-900 shadow-md hover:shadow-lg":
              variant === "secondary",
            "hover:from-gray-200 hover:to-gray-300 focus-visible:ring-gray-500":
              variant === "secondary",

            // Outline - Transparent with border
            "border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50":
              variant === "outline",
            "hover:border-gray-400 focus-visible:ring-gray-500 shadow-sm hover:shadow-md":
              variant === "outline",

            // Ghost - Minimal styling
            "text-gray-700 hover:bg-gray-100 focus-visible:ring-gray-500":
              variant === "ghost",

            // Gradient - Premium gradient
            "bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 text-white shadow-xl":
              variant === "gradient",
            "hover:from-purple-700 hover:via-blue-700 hover:to-cyan-700 hover:shadow-2xl":
              variant === "gradient",
            "focus-visible:ring-purple-600 before:absolute before:inset-0":
              variant === "gradient",
            "before:bg-gradient-to-r before:from-white/20 before:to-transparent":
              variant === "gradient",
            "before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300":
              variant === "gradient",

            // Danger - Red gradient
            "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg hover:shadow-xl":
              variant === "danger",
            "hover:from-red-700 hover:to-red-800 focus-visible:ring-red-600":
              variant === "danger",
          },

          className
        )}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {/* Ripple effect overlay */}
        <span className="absolute inset-0 overflow-hidden rounded-xl">
          <span className="absolute inset-0 bg-white/20 transform scale-0 group-active:scale-100 transition-transform duration-300 rounded-full" />
        </span>

        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 relative z-10"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {!loading && leftIcon && (
          <span className="mr-2 relative z-10 transition-transform duration-200 group-hover:scale-110">
            {leftIcon}
          </span>
        )}

        <span className="relative z-10">{children}</span>

        {!loading && rightIcon && (
          <span className="ml-2 relative z-10 transition-transform duration-200 group-hover:scale-110">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
