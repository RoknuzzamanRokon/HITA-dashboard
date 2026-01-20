"use client";

import React, { useState, useEffect } from "react";

interface RealTimeTimestampProps {
  dateString: string;
  className?: string;
  updateInterval?: number; // in milliseconds
}

const formatTimeAgo = (dateString: string) => {
  try {
    const date = new Date(dateString);

    // Check if date is valid
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 10) return "Just now";
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;

    return date.toLocaleDateString();
  } catch (error) {
    return "Error";
  }
};

export const RealTimeTimestamp: React.FC<RealTimeTimestampProps> = ({
  dateString,
  className = "",
  updateInterval = 10000, // Default 10 seconds for more frequent updates
}) => {
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(dateString));

  useEffect(() => {
    // Update immediately
    setTimeAgo(formatTimeAgo(dateString));

    // Set up interval to update regularly
    const interval = setInterval(() => {
      const newTimeAgo = formatTimeAgo(dateString);
      setTimeAgo(newTimeAgo);
    }, updateInterval);

    return () => {
      clearInterval(interval);
    };
  }, [dateString, updateInterval]);

  return (
    <span
      className={className}
      title={new Date(dateString).toLocaleString()}
      data-timestamp={dateString}
    >
      {timeAgo}
    </span>
  );
};
