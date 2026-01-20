"use client";

import React from "react";
import { useNotification } from "./notification-provider";
import { Toast } from "./toast";

/**
 * NotificationContainer component
 *
 * Displays toast notifications in a fixed container positioned in the top-right corner.
 * Handles stacking of multiple notifications with proper spacing and z-index management.
 * Responsive positioning adapts for mobile devices.
 *
 * Requirements: 5.4, 5.8, 9.2, 9.3
 */
export function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  // Don't render container if no notifications
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div
      className="fixed top-4 right-4 z-9999 flex flex-col gap-3 pointer-events-none
                 max-w-[calc(100vw-2rem)] sm:max-w-md
                 md:top-6 md:right-6"
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="false"
    >
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          className="pointer-events-auto"
          style={{
            zIndex: 9999 - index, // Higher z-index for newer notifications
          }}
          role="status"
        >
          <Toast
            notification={notification}
            onDismiss={() => removeNotification(notification.id)}
          />
        </div>
      ))}
    </div>
  );
}
