/**
 * Notification utility functions
 */

import { BackendNotification } from '@/lib/api/notifications';

/**
 * Gets the most relevant timestamp for display from a notification
 * Prioritizes sent_at from meta_data over created_at
 */
export function getNotificationDisplayTimestamp(notification: BackendNotification): string {
    // First try to use sent_at from meta_data if available
    if (notification.meta_data?.sent_at) {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`📤 Using sent_at timestamp: ${notification.meta_data.sent_at} for notification ${notification.id}`);

            // Check for significant time difference
            const createdTime = new Date(notification.created_at).getTime();
            const sentTime = new Date(notification.meta_data.sent_at).getTime();
            const diffMinutes = Math.abs(createdTime - sentTime) / (1000 * 60);

            if (diffMinutes > 5) {
                console.warn(`⚠️ Large timestamp difference for notification ${notification.id}: ${diffMinutes.toFixed(2)} minutes`);
                console.warn(`   created_at: ${notification.created_at}`);
                console.warn(`   sent_at: ${notification.meta_data.sent_at}`);
            }
        }
        return notification.meta_data.sent_at;
    }

    // Fall back to created_at
    if (process.env.NODE_ENV === 'development') {
        console.debug(`📅 Using created_at timestamp: ${notification.created_at} for notification ${notification.id}`);
    }
    return notification.created_at;
}

/**
 * Gets the change timestamp from meta_data if available
 */
export function getNotificationChangeTimestamp(notification: BackendNotification): string | null {
    return notification.meta_data?.change_time || null;
}

/**
 * Checks if a notification has timing discrepancy between different timestamps
 */
export function hasTimestampDiscrepancy(notification: BackendNotification): boolean {
    const createdAt = new Date(notification.created_at);
    const sentAt = notification.meta_data?.sent_at ? new Date(notification.meta_data.sent_at) : null;

    if (!sentAt) return false;

    // Check if there's more than 1 minute difference
    const diffInMinutes = Math.abs(createdAt.getTime() - sentAt.getTime()) / (1000 * 60);
    return diffInMinutes > 1;
}