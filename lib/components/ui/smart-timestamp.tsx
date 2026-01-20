"use client";

import React from "react";
import { RealTimeTimestamp } from "./real-time-timestamp";

interface SmartTimestampProps {
  dateString: string;
  className?: string;
  showRelative?: boolean;
  showAbsolute?: boolean;
  updateInterval?: number;
  format?: "short" | "long" | "relative-only";
}

/**
 * Smart Timestamp Component
 * Automatically chooses between relative time and absolute time based on age
 * Always updates in real-time
 */
export const SmartTimestamp: React.FC<SmartTimestampProps> = ({
  dateString,
  className = "",
  showRelative = true,
  showAbsolute = false,
  updateInterval = 30000, // 30 seconds default
  format = "short",
}) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

  // For very recent timestamps (< 24 hours), show relative time
  if (showRelative && diffHours < 24) {
    return (
      <span className={className} title={date.toLocaleString()}>
        <RealTimeTimestamp
          dateString={dateString}
          updateInterval={updateInterval}
        />
        {showAbsolute && format !== "relative-only" && (
          <span className="text-xs opacity-75 ml-1">
            ({date.toLocaleDateString()})
          </span>
        )}
      </span>
    );
  }

  // For older timestamps, show absolute time
  const formatOptions: Intl.DateTimeFormatOptions =
    format === "long"
      ? {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      : {
          year: "numeric",
          month: "short",
          day: "numeric",
        };

  return (
    <span className={className} title={date.toLocaleString()}>
      {date.toLocaleDateString(undefined, formatOptions)}
    </span>
  );
};
