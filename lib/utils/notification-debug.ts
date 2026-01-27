/**
 * Notification debugging utilities
 */

import { BackendNotification } from '@/lib/api/notifications';

/**
 * Debug function to log notification timestamp information
 */
export function debugNotificationTimestamps(notification: BackendNotification) {
    console.group(`🔍 Notification ${notification.id} Timestamp Debug`);

    console.log('📅 created_at:', notification.created_at);
    console.log('📅 created_at parsed:', new Date(notification.created_at).toLocaleString());

    if (notification.meta_data?.sent_at) {
        console.log('📤 sent_at:', notification.meta_data.sent_at);
        console.log('📤 sent_at parsed:', new Date(notification.meta_data.sent_at).toLocaleString());

        const createdTime = new Date(notification.created_at).getTime();
        const sentTime = new Date(notification.meta_data.sent_at).getTime();
        const diffMinutes = Math.abs(createdTime - sentTime) / (1000 * 60);

        console.log(`⏱️ Time difference: ${diffMinutes.toFixed(2)} minutes`);

        if (diffMinutes > 1) {
            console.warn('⚠️ Significant time difference detected!');
        }
    } else {
        console.log('📤 sent_at: Not available');
    }

    if (notification.meta_data?.change_time) {
        console.log('🔄 change_time:', notification.meta_data.change_time);
        console.log('🔄 change_time parsed:', new Date(notification.meta_data.change_time).toLocaleString());
    }

    console.log('📊 Status:', notification.status);
    console.log('🏷️ Type:', notification.type);
    console.log('📋 Meta data:', notification.meta_data);

    console.groupEnd();
}

/**
 * Debug function to compare notification states before and after mark as read
 */
export function debugNotificationStateChange(
    before: BackendNotification,
    after: BackendNotification
) {
    console.group(`🔄 Notification ${before.id} State Change Debug`);

    console.log('Before:', {
        status: before.status,
        read_at: before.read_at,
    });

    console.log('After:', {
        status: after.status,
        read_at: after.read_at,
    });

    if (before.status === after.status) {
        console.warn('⚠️ Status did not change!');
    } else {
        console.log('✅ Status changed successfully');
    }

    console.groupEnd();
}