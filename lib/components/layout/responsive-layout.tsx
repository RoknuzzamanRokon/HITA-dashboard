/**
 * Responsive layout component with adaptive behavior
 * Provides responsive containers, grids, and spacing
 */

import React from "react";
import {
  useResponsiveLayout,
  useBreakpoint,
  useTouchDevice,
} from "../../utils/responsive";
import { useOptimizedAnimation } from "../../utils/animations";
import { cn } from "../../utils";

interface ResponsiveContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
}

/**
 * Responsive container with adaptive padding and max-width
 */
export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = "",
  maxWidth = "xl",
  padding = "md",
}) => {
  const { containerPadding } = useResponsiveLayout();

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full",
  };

  const paddingClasses = {
    none: "",
    sm: "px-4",
    md: "px-6",
    lg: "px-8",
  };

  return (
    <div
      className={cn(
        "mx-auto w-full",
        maxWidthClasses[maxWidth],
        paddingClasses[padding],
        className
      )}
      style={{ padding: padding === "md" ? containerPadding : undefined }}
    >
      {children}
    </div>
  );
};

interface ResponsiveGridProps {
  children: React.ReactNode;
  className?: string;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  minItemWidth?: string;
  autoFit?: boolean;
}

/**
 * Responsive grid with adaptive columns
 */
export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  className = "",
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = { mobile: "1rem", tablet: "1.5rem", desktop: "2rem" },
  minItemWidth,
  autoFit = false,
}) => {
  const { deviceType } = useBreakpoint();

  const currentColumns = React.useMemo(() => {
    switch (deviceType) {
      case "mobile":
        return columns.mobile || 1;
      case "tablet":
        return columns.tablet || columns.mobile || 2;
      case "desktop":
        return columns.desktop || columns.tablet || columns.mobile || 3;
      default:
        return 1;
    }
  }, [deviceType, columns]);

  const currentGap = React.useMemo(() => {
    switch (deviceType) {
      case "mobile":
        return gap.mobile || "1rem";
      case "tablet":
        return gap.tablet || gap.mobile || "1.5rem";
      case "desktop":
        return gap.desktop || gap.tablet || gap.mobile || "2rem";
      default:
        return "1rem";
    }
  }, [deviceType, gap]);

  const gridStyle = React.useMemo(() => {
    if (autoFit && minItemWidth) {
      return {
        display: "grid",
        gridTemplateColumns: `repeat(auto-fit, minmax(${minItemWidth}, 1fr))`,
        gap: currentGap,
      };
    }

    return {
      display: "grid",
      gridTemplateColumns: `repeat(${currentColumns}, 1fr)`,
      gap: currentGap,
    };
  }, [autoFit, minItemWidth, currentColumns, currentGap]);

  return (
    <div className={cn("w-full", className)} style={gridStyle}>
      {children}
    </div>
  );
};

interface ResponsiveStackProps {
  children: React.ReactNode;
  className?: string;
  direction?: {
    mobile?: "row" | "column";
    tablet?: "row" | "column";
    desktop?: "row" | "column";
  };
  spacing?: {
    mobile?: string;
    tablet?: string;
    desktop?: string;
  };
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
}

/**
 * Responsive stack (flex container) with adaptive direction
 */
export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  className = "",
  direction = { mobile: "column", tablet: "row", desktop: "row" },
  spacing = { mobile: "1rem", tablet: "1.5rem", desktop: "2rem" },
  align = "start",
  justify = "start",
}) => {
  const { deviceType } = useBreakpoint();

  const currentDirection = React.useMemo(() => {
    switch (deviceType) {
      case "mobile":
        return direction.mobile || "column";
      case "tablet":
        return direction.tablet || direction.mobile || "row";
      case "desktop":
        return (
          direction.desktop || direction.tablet || direction.mobile || "row"
        );
      default:
        return "column";
    }
  }, [deviceType, direction]);

  const currentSpacing = React.useMemo(() => {
    switch (deviceType) {
      case "mobile":
        return spacing.mobile || "1rem";
      case "tablet":
        return spacing.tablet || spacing.mobile || "1.5rem";
      case "desktop":
        return spacing.desktop || spacing.tablet || spacing.mobile || "2rem";
      default:
        return "1rem";
    }
  }, [deviceType, spacing]);

  const alignClasses = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
    around: "justify-around",
    evenly: "justify-evenly",
  };

  const directionClasses = {
    row: "flex-row",
    column: "flex-col",
  };

  return (
    <div
      className={cn(
        "flex",
        directionClasses[currentDirection],
        alignClasses[align],
        justifyClasses[justify],
        className
      )}
      style={{
        gap: currentSpacing,
      }}
    >
      {children}
    </div>
  );
};

interface TouchFriendlyButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  adaptiveSize?: boolean;
}

/**
 * Touch-friendly button with adaptive sizing
 */
export const TouchFriendlyButton: React.FC<TouchFriendlyButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  adaptiveSize = true,
  ...props
}) => {
  const isTouchDevice = useTouchDevice();
  const animationProps = useOptimizedAnimation(
    "hover:scale-105 active:scale-95"
  );

  const baseClasses =
    "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variantClasses = {
    primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500",
    outline:
      "border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
    ghost: "text-blue-600 hover:bg-blue-50 focus:ring-blue-500",
  };

  const sizeClasses = {
    sm:
      isTouchDevice && adaptiveSize
        ? "px-4 py-3 text-sm min-h-[3rem]"
        : "px-3 py-2 text-sm",
    md:
      isTouchDevice && adaptiveSize
        ? "px-6 py-3 text-base min-h-[3rem]"
        : "px-4 py-2 text-base",
    lg:
      isTouchDevice && adaptiveSize
        ? "px-8 py-4 text-lg min-h-[3.5rem]"
        : "px-6 py-3 text-lg",
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        animationProps.className,
        className
      )}
      style={animationProps.style}
      {...props}
    >
      {children}
    </button>
  );
};

interface ResponsiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  className?: string;
}

/**
 * Responsive modal that adapts to screen size
 */
export const ResponsiveModal: React.FC<ResponsiveModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  size = "md",
  className = "",
}) => {
  const { isMobile, isTablet } = useBreakpoint();
  const animationProps = useOptimizedAnimation(
    isMobile ? "animate-slide-in-from-bottom" : "animate-scale-in"
  );

  if (!isOpen) return null;

  const sizeClasses = React.useMemo(() => {
    if (isMobile) {
      return "w-full h-full max-h-full rounded-none";
    }

    const sizes = {
      sm: "max-w-sm",
      md: "max-w-md",
      lg: "max-w-lg",
      xl: "max-w-xl",
      full: "max-w-full",
    };

    return `${sizes[size]} max-h-[90vh] rounded-lg`;
  }, [isMobile, size]);

  const positionClasses = isMobile
    ? "inset-0"
    : "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={cn(
          "relative bg-white dark:bg-gray-800 shadow-xl",
          sizeClasses,
          positionClasses,
          animationProps.className,
          className
        )}
        style={animationProps.style}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}

        {/* Content */}
        <div className={cn("p-4", isMobile ? "flex-1 overflow-y-auto" : "")}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default {
  ResponsiveContainer,
  ResponsiveGrid,
  ResponsiveStack,
  TouchFriendlyButton,
  ResponsiveModal,
};
