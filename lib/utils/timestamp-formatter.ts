/**
 * Utility functions for formatting timestamps
 */

/**
 * Formats a timestamp to relative time (e.g., "2 hours ago", "3 days ago")
 * for recent updates within the last 7 days, otherwise returns null
 */
export function formatRelativeTime(timestamp: string | null | undefined): string | null {
    if (!timestamp) return null;

    try {
        const date = new Date(timestamp);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return null;
        }

        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffSeconds / 60);
        const diffHours = Math.floor(diffMinutes / 60);
        const diffDays = Math.floor(diffHours / 24);

        // Only show relative time for updates within the last 7 days
        if (diffDays > 7) {
            return null;
        }

        // Format relative time
        if (diffSeconds < 60) {
            return "just now";
        } else if (diffMinutes < 60) {
            return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
        } else {
            return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
        }
    } catch (error) {
        console.error("Error formatting relative time:", error);
        return null;
    }
}

/**
 * Formats a timestamp to locale-specific format using Intl.DateTimeFormat
 */
export function formatLocaleTimestamp(timestamp: string | null | undefined): string {
    if (!timestamp) return "Not available";

    try {
        const date = new Date(timestamp);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return "Not available";
        }

        return new Intl.DateTimeFormat(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        }).format(date);
    } catch (error) {
        console.error("Error formatting locale timestamp:", error);
        return "Not available";
    }
}

/**
 * Formats a timestamp to ISO 8601 format for tooltips
 */
export function formatISOTimestamp(timestamp: string | null | undefined): string {
    if (!timestamp) return "Not available";

    try {
        const date = new Date(timestamp);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return "Not available";
        }

        return date.toISOString();
    } catch (error) {
        console.error("Error formatting ISO timestamp:", error);
        return "Not available";
    }
}

/**
 * Gets the display timestamp - relative time if within 7 days, otherwise locale format
 */
export function getDisplayTimestamp(timestamp: string | null | undefined): string {
    const relativeTime = formatRelativeTime(timestamp);

    if (relativeTime) {
        return relativeTime;
    }

    return formatLocaleTimestamp(timestamp);
}
