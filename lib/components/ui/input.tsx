/**
 * Input component with error handling and validation
 */

"use client";

import React, { forwardRef } from "react";
import { clsx } from "clsx";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <div className="text-gray-400 text-sm">{leftIcon}</div>
            </div>
          )}

          <input
            id={inputId}
            type={type}
            className={clsx(
              // Base styles
              "block w-full rounded-md border-0 py-2 px-3 text-gray-900 shadow-sm ring-1 ring-inset placeholder:text-gray-400 focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6",
              // Default state
              "ring-gray-300 focus:ring-blue-600",
              // Error state
              error && "ring-red-300 focus:ring-red-500",
              // Icon padding
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              // Disabled state
              props.disabled && "bg-gray-50 text-gray-500 cursor-not-allowed",
              className
            )}
            ref={ref}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <div className="text-gray-400 text-sm">{rightIcon}</div>
            </div>
          )}
        </div>

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

Input.displayName = "Input";

export { Input };
