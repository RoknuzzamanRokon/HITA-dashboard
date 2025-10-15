/**
 * Toast Notification Component
 * Beautiful toast notifications with smooth animations and icons
 */

"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "warning" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "success", title, message });
    },
    [addToast]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "error", title, message });
    },
    [addToast]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "warning", title, message });
    },
    [addToast]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      addToast({ type: "info", title, message });
    },
    [addToast]
  );

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        success,
        error,
        warning,
        info,
      }}
    >
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  );
}

interface ToastItemProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  React.useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const getIcon = () => {
    switch (toast.type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getColorClasses = () => {
    switch (toast.type) {
      case "success":
        return "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-900";
      case "error":
        return "bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-900";
      case "warning":
        return "bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200 text-yellow-900";
      case "info":
        return "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 text-blue-900";
    }
  };

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border backdrop-blur-xl shadow-lg transition-all duration-300 ease-out",
        "transform-gpu",
        getColorClasses(),
        isVisible && !isRemoving
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      )}
      style={{
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)",
      }}
    >
      {/* Animated progress bar */}
      <ProgressBar duration={toast.duration || 5000} type={toast.type} />

      <div className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">{toast.title}</p>
            {toast.message && (
              <p className="mt-1 text-sm opacity-90">{toast.message}</p>
            )}

            {toast.action && (
              <button
                onClick={toast.action.onClick}
                className="mt-2 text-sm font-medium underline hover:no-underline transition-all duration-200"
              >
                {toast.action.label}
              </button>
            )}
          </div>

          <button
            onClick={handleRemove}
            className="flex-shrink-0 rounded-lg p-1 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 hover:scale-110"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Progress Bar Component with CSS-in-JS animation
function ProgressBar({
  duration,
  type,
}: {
  duration: number;
  type: ToastType;
}) {
  const [width, setWidth] = useState(100);

  React.useEffect(() => {
    // Start the animation
    const startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.max(0, 100 - (elapsed / duration) * 100);

      setWidth(progress);

      if (progress > 0) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [duration]);

  const getColorClasses = () => {
    switch (type) {
      case "success":
        return "from-green-400 to-emerald-500";
      case "error":
        return "from-red-400 to-rose-500";
      case "warning":
        return "from-yellow-400 to-amber-500";
      case "info":
        return "from-blue-400 to-indigo-500";
    }
  };

  return (
    <div
      className={cn(
        "absolute top-0 left-0 h-1 bg-gradient-to-r transition-all ease-linear",
        getColorClasses()
      )}
      style={{
        width: `${width}%`,
        transition: "width 16ms linear",
      }}
    />
  );
}
