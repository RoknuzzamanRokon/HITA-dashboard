/**
 * Modal Component
 * Reusable modal dialog for forms and content display
 */

"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  children: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  className?: string;
  animation?: "slide" | "fade" | "scale";
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  "2xl": "max-w-6xl",
  full: "max-w-[95vw] max-h-[95vh]",
};

const animationClasses = {
  slide: {
    enter: "animate-slide-in-from-bottom",
    exit: "animate-slide-out-to-bottom",
  },
  fade: {
    enter: "animate-fade-in",
    exit: "animate-fade-out",
  },
  scale: {
    enter: "animate-scale-in",
    exit: "animate-scale-out",
  },
};

export function Modal({
  isOpen,
  onClose,
  title,
  size = "md",
  children,
  showCloseButton = true,
  closeOnOverlayClick = true,
  className,
  animation = "slide",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const [isAnimating, setIsAnimating] = React.useState(false);
  const [shouldRender, setShouldRender] = React.useState(isOpen);

  // Handle animation states
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsAnimating(true);
    } else if (shouldRender) {
      setIsAnimating(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, shouldRender]);

  // Handle escape key press and focus trap
  useEffect(() => {
    if (!shouldRender) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        );
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleEscape);
    document.addEventListener("keydown", handleTabKey);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("keydown", handleTabKey);
      document.body.style.overflow = "unset";
    };
  }, [shouldRender, onClose]);

  // Focus management - store previous focus and restore on close
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element when modal opens
      previousActiveElementRef.current = document.activeElement as HTMLElement;
    }

    if (isAnimating && modalRef.current) {
      const timer = setTimeout(() => {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled])'
        );
        const firstElement = focusableElements?.[0] as HTMLElement;
        firstElement?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }

    // Restore focus to the trigger element when modal closes
    if (!isOpen && !shouldRender && previousActiveElementRef.current) {
      previousActiveElementRef.current.focus();
      previousActiveElementRef.current = null;
    }
  }, [isAnimating, isOpen, shouldRender]);

  if (!shouldRender) return null;

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      aria-labelledby={title ? "modal-title" : undefined}
      role="dialog"
      aria-modal="true"
    >
      {/* Enhanced Backdrop with blur */}
      <div
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-xl transition-all duration-300",
          isAnimating ? "opacity-100" : "opacity-0"
        )}
        onClick={handleOverlayClick}
      />

      {/* Modal container */}
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          ref={modalRef}
          className={cn(
            "relative transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-xl text-left shadow-2xl border border-white/20",
            "w-full transition-all duration-300 ease-out",
            sizeClasses[size],

            // Animation classes
            isAnimating
              ? animationClasses[animation].enter
              : animationClasses[animation].exit,

            className
          )}
          style={{
            boxShadow:
              "0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)",
          }}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/50 bg-white/50 backdrop-blur-sm">
              {title && (
                <h3
                  id="modal-title"
                  className="text-lg font-semibold text-gray-900 tracking-tight"
                >
                  {title}
                </h3>
              )}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="rounded-xl p-2 text-gray-400 hover:text-gray-600 hover:bg-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 hover:scale-110"
                  aria-label="Close modal"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="relative p-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

// Modal Footer Component
interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalFooter({ children, className }: ModalFooterProps) {
  return (
    <div
      className={cn(
        "flex justify-end space-x-3 px-6 py-4 border-t border-gray-200/50 bg-gradient-to-r from-gray-50/50 to-gray-100/30 backdrop-blur-sm",
        className
      )}
    >
      {children}
    </div>
  );
}

// Modal Body Component
interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function ModalBody({ children, className }: ModalBodyProps) {
  return <div className={cn("px-6 py-4", className)}>{children}</div>;
}
