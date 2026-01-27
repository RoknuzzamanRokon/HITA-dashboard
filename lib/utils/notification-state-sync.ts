/**
 * Notification state synchronization utilities
 * Ensures all notification components stay in sync when notifications are marked as read
 */

import React from 'react';

export interface NotificationStateEvent {
    type: 'MARK_AS_READ' | 'MARK_ALL_AS_READ' | 'DELETE' | 'REFRESH';
    notificationId?: number;
    userId?: string;
}

class NotificationStateSyncManager {
    private listeners: Set<(event: NotificationStateEvent) => void> = new Set();

    /**
     * Subscribe to notification state changes
     */
    subscribe(callback: (event: NotificationStateEvent) => void) {
        this.listeners.add(callback);

        return () => {
            this.listeners.delete(callback);
        };
    }

    /**
     * Broadcast a notification state change to all subscribers
     */
    broadcast(event: NotificationStateEvent) {
        console.log('🔄 NotificationStateSync: Broadcasting event', event);
        this.listeners.forEach(callback => {
            try {
                callback(event);
            } catch (error) {
                console.error('Error in notification state sync callback:', error);
            }
        });
    }

    /**
     * Mark a notification as read and sync across all components
     */
    markAsRead(notificationId: number) {
        this.broadcast({
            type: 'MARK_AS_READ',
            notificationId
        });
    }

    /**
     * Mark all notifications as read and sync across all components
     */
    markAllAsRead() {
        this.broadcast({
            type: 'MARK_ALL_AS_READ'
        });
    }

    /**
     * Delete a notification and sync across all components
     */
    deleteNotification(notificationId: number) {
        this.broadcast({
            type: 'DELETE',
            notificationId
        });
    }

    /**
     * Trigger a refresh across all components
     */
    refresh() {
        this.broadcast({
            type: 'REFRESH'
        });
    }
}

// Global singleton instance
export const notificationStateSync = new NotificationStateSyncManager();

/**
 * Hook to use notification state synchronization
 */
export function useNotificationStateSync(
    onMarkAsRead?: (notificationId: number) => void,
    onMarkAllAsRead?: () => void,
    onDelete?: (notificationId: number) => void,
    onRefresh?: () => void
) {
    const handleEvent = (event: NotificationStateEvent) => {
        switch (event.type) {
            case 'MARK_AS_READ':
                if (event.notificationId && onMarkAsRead) {
                    onMarkAsRead(event.notificationId);
                }
                break;
            case 'MARK_ALL_AS_READ':
                if (onMarkAllAsRead) {
                    onMarkAllAsRead();
                }
                break;
            case 'DELETE':
                if (event.notificationId && onDelete) {
                    onDelete(event.notificationId);
                }
                break;
            case 'REFRESH':
                if (onRefresh) {
                    onRefresh();
                }
                break;
        }
    };

    // Subscribe on mount, unsubscribe on unmount
    React.useEffect(() => {
        return notificationStateSync.subscribe(handleEvent);
    }, [onMarkAsRead, onMarkAllAsRead, onDelete, onRefresh]);

    return notificationStateSync;
}

// For non-React usage
export { notificationStateSync as default };