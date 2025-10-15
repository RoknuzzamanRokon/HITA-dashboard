/**
 * Responsive wrapper component that provides adaptive behavior
 * Combines all responsive utilities into a single wrapper
 */

import React from "react";
import {
  useResponsiveLayout,
  useBreakpoint,
  useTouchDevice,
} from "../../utils/responsive";
import { useOptimizedAnimation } from "../../utils/animations";
import { useReducedMotion } from "../../utils/performance";
import { LazyWrapper } from "./lazy-wrapper";
import { cn } from "../../utils";

interface ResponsiveWrapperProps {
  children: React.ReactNode;
  className?: string;

  // Responsive behavior
  adaptToDevice?: boolean;
  touchOptimized?: boolean;
  lazyLoad?: boolean;

  // Animation settings
  animateOnMount?: boolean;
  animationClass?: string;
  respectReducedMotion?: boolean;

  // Layout settings
  fullWidthOnMobile?: boolean;
  centerOnDesktop?: boolean;

  // Performance settings
  hardwareAccelerated?: boolean;

  // Accessibility
  focusManagement?: boolean;
  ariaLabel?: string;
}

/**
 * Comprehensive responsive wrapper that adapts to device capabilities
 */
export const ResponsiveWrapper: React.FC<ResponsiveWrapperProps> = ({
  children,
  className = "",
  adaptToDevice = true,
  touchOptimized = true,
  lazyLoad = false,
  animateOnMount = false,
  animationClass = "animate-optimized-fade-in",
  respectReducedMotion = true,
  fullWidthOnMobile = false,
  centerOnDesktop = false,
  hardwareAccelerated = false,
  focusManagement = false,
  ariaLabel,
}) => {
  const { isMobile, isTablet, isDesktop, isTouchDevice } =
    useResponsiveLayout();
  const prefersReducedMotion = useReducedMotion();

  // Animation configuration
  const animationProps = useOptimizedAnimation(animationClass, {
    reducedMotionFallback: respectReducedMotion ? "" : animationClass,
  });

  // Responsive classes
  const responsiveClasses = React.useMemo(() => {
    const classes: string[] = [];

    if (adaptToDevice) {
      if (isMobile) {
        classes.push("mobile-optimized");
        if (fullWidthOnMobile) classes.push("w-full");
      }

      if (isTablet) {
        classes.push("tablet-optimized");
      }

      if (isDesktop) {
        classes.push("desktop-optimized");
        if (centerOnDesktop) classes.push("mx-auto");
      }
    }

    if (touchOptimized && isTouchDevice) {
      classes.push("touch-optimized", "touch-target");
    }

    if (hardwareAccelerated) {
      classes.push("hw-accelerated");
    }

    return classes.join(" ");
  }, [
    adaptToDevice,
    touchOptimized,
    fullWidthOnMobile,
    centerOnDesktop,
    hardwareAccelerated,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
  ]);

  // Focus management
  const wrapperRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (focusManagement && wrapperRef.current) {
      const focusableElements = wrapperRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      // Ensure proper tab order
      focusableElements.forEach((element, index) => {
        if (!element.hasAttribute("tabindex")) {
          element.setAttribute("tabindex", "0");
        }
      });
    }
  }, [focusManagement]);

  const wrapperProps = {
    ref: wrapperRef,
    className: cn(
      "responsive-wrapper",
      responsiveClasses,
      animateOnMount && !prefersReducedMotion ? animationProps.className : "",
      className
    ),
    style: {
      ...(animateOnMount && !prefersReducedMotion ? animationProps.style : {}),
    },
    ...(ariaLabel && { "aria-label": ariaLabel }),
  };

  const content = <div {...wrapperProps}>{children}</div>;

  // Wrap with lazy loading if requested
  if (lazyLoad) {
    return <LazyWrapper>{content}</LazyWrapper>;
  }

  return content;
};

/**
 * Higher-order component for responsive behavior
 */
export function withResponsive<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<ResponsiveWrapperProps, "children"> = {}
) {
  const ResponsiveComponent = (props: P) => (
    <ResponsiveWrapper {...options}>
      <Component {...props} />
    </ResponsiveWrapper>
  );

  ResponsiveComponent.displayName = `ResponsiveWrapper(${
    Component.displayName || Component.name
  })`;

  return ResponsiveComponent;
}

/**
 * Responsive text component that adapts font size
 */
interface ResponsiveTextProps {
  children: React.ReactNode;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div";
  size?: "xs" | "sm" | "base" | "lg" | "xl" | "2xl" | "3xl";
  className?: string;
}

export const ResponsiveText: React.FC<ResponsiveTextProps> = ({
  children,
  as: Component = "p",
  size = "base",
  className = "",
}) => {
  const responsiveClass = `responsive-text-${size}`;

  return (
    <Component className={cn(responsiveClass, className)}>{children}</Component>
  );
};

/**
 * Responsive spacing component
 */
interface ResponsiveSpacingProps {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  direction?: "vertical" | "horizontal" | "all";
  className?: string;
}

export const ResponsiveSpacing: React.FC<ResponsiveSpacingProps> = ({
  children,
  size = "md",
  direction = "all",
  className = "",
}) => {
  const spacingClass = `responsive-spacing-${size}`;

  const directionClasses = {
    vertical: "my-auto",
    horizontal: "mx-auto",
    all: "m-auto",
  };

  return (
    <div className={cn(spacingClass, directionClasses[direction], className)}>
      {children}
    </div>
  );
};

export default ResponsiveWrapper;
