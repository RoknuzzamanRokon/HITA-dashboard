"use client";

import React, { useEffect, useState } from "react";
import { Notification } from "@/lib/types/exports";

interface ToastProps {
  notification: Notification;
  onDismiss: () => void;
}

export function Toast({ notification, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  // Handle dismiss with exit animation
  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => {
      onDismiss();
    }, 300); // Match animation duration
  };

  // Get icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case "success":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        );
      case "info":
        return (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  // Get color classes based on notification type
  const getColorClasses = () => {
    switch (notification.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800";
      case "error":
        return "bg-red-50 border-red-200 text-red-800";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "info":
        return "bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  // Get icon color classes
  const getIconColorClasses = () => {
    switch (notification.type) {
      case "success":
        return "text-green-500";
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      case "info":
        return "text-blue-500";
    }
  };

  // Get action button color classes
  const getActionButtonClasses = () => {
    switch (notification.type) {
      case "success":
        return "text-green-700 hover:bg-green-100 focus:ring-green-500";
      case "error":
        return "text-red-700 hover:bg-red-100 focus:ring-red-500";
      case "warning":
        return "text-yellow-700 hover:bg-yellow-100 focus:ring-yellow-500";
      case "info":
        return "text-blue-700 hover:bg-blue-100 focus:ring-blue-500";
    }
  };

  return (
    <div
      role="alert"
      aria-live={notification.type === "error" ? "assertive" : "polite"}
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg
        min-w-[320px] max-w-[420px]
        ${getColorClasses()}
        ${isExiting ? "animate-slide-out-right" : "animate-slide-in-right"}
      `}
      style={{
        animation: isExiting
          ? "slideOutRight 0.3s ease-in forwards"
          : "slideInRight 0.3s ease-out forwards",
      }}
    >
      {/* Icon */}
      <div className={`shrink-0 ${getIconColorClasses()}`}>{getIcon()}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-semibold mb-1">{notification.title}</h3>
        <p className="text-sm opacity-90">{notification.message}</p>

        {/* Action button */}
        {notification.action && (
          <button
            onClick={() => {
              notification.action?.onClick();
              handleDismiss();
            }}
            className={`
              mt-2 text-sm font-medium px-3 py-1 rounded
              transition-colors duration-150
              focus:outline-none focus:ring-2 focus:ring-offset-2
              ${getActionButtonClasses()}
            `}
            aria-label={notification.action.label}
          >
            {notification.action.label}
          </button>
        )}
      </div>

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className={`
          shrink-0 p-1 rounded-md
          transition-colors duration-150
          hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${notification.type === "success" && "focus:ring-green-500"}
          ${notification.type === "error" && "focus:ring-red-500"}
          ${notification.type === "warning" && "focus:ring-yellow-500"}
          ${notification.type === "info" && "focus:ring-blue-500"}
        `}
        aria-label="Dismiss notification"
      >
        <svg
          className="w-5 h-5 opacity-60 hover:opacity-100"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Inline styles for animations */}
      <style jsx>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }

        .animate-slide-in-right {
          animation: slideInRight 0.3s ease-out forwards;
        }

        .animate-slide-out-right {
          animation: slideOutRight 0.3s ease-in forwards;
        }
      `}</style>
    </div>
  );
}
