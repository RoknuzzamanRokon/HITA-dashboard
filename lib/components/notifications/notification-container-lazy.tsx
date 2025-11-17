"use client";

import dynamic from "next/dynamic";

// Lazy load NotificationContainer for better initial bundle size
export const NotificationContainerLazy = dynamic(
  () =>
    import("./notification-container").then((mod) => ({
      default: mod.NotificationContainer,
    })),
  {
    ssr: false,
    loading: () => null, // Don't show loading state for notifications
  }
);
