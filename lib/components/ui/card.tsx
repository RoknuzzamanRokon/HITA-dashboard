/**
 * Premium Card Component with glassmorphism effects
 * Container component for content sections with modern styling
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "glass" | "elevated";
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      padding = "md",
      hover = true,
      onClick,
      ...props
    },
    ref
  ) => {
    const [isClicked, setIsClicked] = React.useState(false);

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (onClick) {
        setIsClicked(true);
        setTimeout(() => setIsClicked(false), 200);
        onClick(e);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          // Base styles
          "rounded-xl transition-all duration-300 ease-out relative overflow-hidden",
          "before:absolute before:inset-0 before:rounded-xl before:transition-opacity before:duration-300",

          // Variant styles
          {
            // Default variant
            "bg-white shadow-sm border border-gray-100": variant === "default",

            // Gradient variant
            "bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-lg border border-gray-200":
              variant === "gradient",

            // Glass morphism variant
            "bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl":
              variant === "glass",
            "before:bg-gradient-to-br before:from-white/10 before:to-transparent before:opacity-0":
              variant === "glass",

            // Elevated variant
            "bg-white shadow-xl border border-gray-100": variant === "elevated",
          },

          // Hover effects
          hover && {
            "hover:scale-[1.02] hover:shadow-lg": variant === "default",
            "hover:scale-[1.02] hover:shadow-xl": variant === "gradient",
            "hover:bg-white/30 hover:shadow-3xl hover:before:opacity-100":
              variant === "glass",
            "hover:scale-[1.02] hover:shadow-2xl": variant === "elevated",
          },

          // Click effects
          onClick && "cursor-pointer active:scale-[0.98]",
          isClicked && "animate-pulse",

          // Padding variants
          {
            "p-0": padding === "none",
            "p-4": padding === "sm",
            "p-6": padding === "md",
            "p-8": padding === "lg",
          },

          className
        )}
        onClick={handleClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleClick(e as any);
                }
              }
            : undefined
        }
        {...props}
      />
    );
  }
);

Card.displayName = "Card";

// Card Header Component
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, subtitle, actions, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-between p-6 border-b border-gray-200/50 backdrop-blur-sm",
          className
        )}
        {...props}
      >
        <div className="flex-1">
          {title && (
            <h3 className="text-lg font-semibold text-gray-900 tracking-tight">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1 font-medium">{subtitle}</p>
          )}
          {children}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">{actions}</div>
        )}
      </div>
    );
  }
);

CardHeader.displayName = "CardHeader";

// Card Content Component
export interface CardContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("p-6", className)} {...props} />;
  }
);

CardContent.displayName = "CardContent";

// Card Footer Component
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center justify-end space-x-2 p-6 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-gray-100/30 backdrop-blur-sm",
          className
        )}
        {...props}
      />
    );
  }
);

CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardContent, CardFooter };
