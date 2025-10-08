/**
 * Badge Component
 * Small status indicators and labels
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "default"
    | "secondary"
    | "success"
    | "warning"
    | "error"
    | "info"
    | "outline";
  size?: "sm" | "md" | "lg";
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          // Base styles
          "inline-flex items-center rounded-full font-medium",

          // Size variants
          {
            "px-2 py-0.5 text-xs": size === "sm",
            "px-2.5 py-1 text-xs": size === "md",
            "px-3 py-1.5 text-sm": size === "lg",
          },

          // Color variants
          {
            "bg-gray-100 text-gray-800": variant === "default",
            "bg-gray-200 text-gray-700": variant === "secondary",
            "bg-green-100 text-green-800": variant === "success",
            "bg-yellow-100 text-yellow-800": variant === "warning",
            "bg-red-100 text-red-800": variant === "error",
            "bg-blue-100 text-blue-800": variant === "info",
            "border border-gray-300 text-gray-700 bg-transparent":
              variant === "outline",
          },

          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
