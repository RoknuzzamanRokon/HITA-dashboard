/**
 * Textarea Component
 * Reusable textarea with enhanced styling and functionality
 */

"use client";

import React, { forwardRef } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  resize?: "none" | "vertical" | "horizontal" | "both";
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { className, label, error, helperText, resize = "vertical", id, ...props },
    ref
  ) => {
    const textareaId =
      id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          id={textareaId}
          className={cn(
            // Base styles
            "block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6",

            // Default state
            "ring-gray-300 focus:ring-blue-600",

            // Error state
            error && "ring-red-300 focus:ring-red-500",

            // Disabled state
            props.disabled && "bg-gray-50 text-gray-500 cursor-not-allowed",

            // Resize options
            {
              "resize-none": resize === "none",
              "resize-y": resize === "vertical",
              "resize-x": resize === "horizontal",
              resize: resize === "both",
            },

            className
          )}
          ref={ref}
          {...props}
        />

        {/* Helper text or error message */}
        {(error || helperText) && (
          <div className="mt-1">
            {error && <p className="text-sm text-red-600">{error}</p>}
            {!error && helperText && (
              <p className="text-sm text-gray-500">{helperText}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
