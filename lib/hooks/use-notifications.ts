/**
 * Custom hook for managing notifications
 */

import { useState, useEffect, useCallback } from 'react';
import { NotificationService, BackendNotification } from '@/lib/api/notifications';

interface UseNotificationsOptions {
    autoRefresh?: boolean;
    refreshInterval?: number;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
    const { autoRefresh = true, refreshInterval = 30000 } = options; // 30 seconds default

    const [notifications, setNotifications] = useState<BackendNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Fetch notifications
    const fetchNotifications = useCallback(async (pageNum: number = 1, append: boolean = false) => {
        try {
            setLoading(true);
            setError(null);

            const response = await NotificationService.getNotifications(pageNum, 20);

            if (append) {
                setNotifications(prev => [...prev, ...response.notifications]);
            } else {
                setNotifications(response.notifications);
            }

            setHasMore(response.has_next);
            setPage(pageNum);
        } catch (err) {
            console.error('Error fetching notifications:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch notifications');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch unread count
    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await NotificationService.getUnreadCount();
            setUnreadCount(count);
        } catch (err) {
            console.error('Error fetching unread count:', err);
        }
    }, []);

    // Mark notification as read
    const markAsRead = useCallback(async (notificationId: number) => {
        // Store previous state for potential rollback
        let previousNotifications: BackendNotification[] = [];
        let previousUnreadCount = 0;

        // Update local state immediately (optimistic update)
        setNotifications(prev => {
            previousNotifications = [...prev];
            const updated = prev.map(notification =>
                notification.id === notificationId
                    ? { ...notification, status: 'read' as const, read_at: new Date().toISOString() }
                    : notification
            );
            return updated;
        });

        // Update unread count immediately
        setUnreadCount(prev => {
            previousUnreadCount = prev;
            return Math.max(0, prev - 1);
        });

        try {
            console.log(`🔄 Hook: Marking notification ${notificationId} as read...`);
            await NotificationService.markAsRead(notificationId);
            console.log(`✅ Hook: Successfully marked notification ${notificationId} as read`);

            // Wait a bit longer before triggering global refresh to let optimistic update settle
            setTimeout(() => {
                console.log('🔄 Triggering global notification refresh after mark as read');
                window.dispatchEvent(new CustomEvent('refreshNotifications', {
                    detail: { notificationId, action: 'markAsRead' }
                }));
            }, 500); // Increased delay to let optimistic update be visible
        } catch (err) {
            console.error(`❌ Hook: Error marking notification ${notificationId} as read:`, err);
            // Revert optimistic update on error
            setNotifications(previousNotifications);
            setUnreadCount(previousUnreadCount);
            throw err;
        }
    }, []);

    // Mark all as read
    const markAllAsRead = useCallback(async () => {
        try {
            await NotificationService.markAllAsRead();

            // Update local state
            setNotifications(prev =>
                prev.map(notification => ({
                    ...notification,
                    status: 'read' as const,
                    read_at: new Date().toISOString()
                }))
            );

            setUnreadCount(0);
        } catch (err) {
            console.error('Error marking all notifications as read:', err);
            throw err;
        }
    }, []);

    // Delete notification
    const deleteNotification = useCallback(async (notificationId: number) => {
        try {
            console.log(`🗑️ Hook: Deleting notification ${notificationId}...`);

            const notification = notifications.find(n => n.id === notificationId);
            console.log(`🗑️ Hook: Found notification to delete:`, notification ? `${notification.title} (${notification.status})` : 'Not found in local state');

            await NotificationService.deleteNotification(notificationId);

            console.log(`🗑️ Hook: API call successful, updating local state...`);

            // Always update local state immediately (optimistic update)
            setNotifications(prev => {
                const filtered = prev.filter(n => n.id !== notificationId);
                console.log(`🗑️ Hook: Removed notification from local state. Count: ${prev.length} → ${filtered.length}`);
                return filtered;
            });

            // Update unread count if it was unread
            if (notification?.status === 'unread') {
                setUnreadCount(prev => {
                    const newCount = Math.max(0, prev - 1);
                    console.log(`🗑️ Hook: Updated unread count: ${prev} → ${newCount}`);
                    return newCount;
                });
            }

            // Force refresh after a delay to sync with backend state
            // This handles the backend bug where delete returns 200 but doesn't actually delete
            setTimeout(async () => {
                console.log(`🔄 Hook: Force refreshing notifications after delete...`);
                try {
                    const response = await NotificationService.getNotifications(1, 20);
                    const stillExists = response.notifications.find(n => n.id === notificationId);

                    if (stillExists) {
                        console.warn(`⚠️ Hook: Backend bug detected - notification ${notificationId} still exists after delete`);
                        console.warn(`⚠️ Hook: Keeping local state updated (notification removed from UI)`);
                        // Don't add it back to local state - keep the UI consistent
                        // Just update the unread count to match backend
                        const actualUnreadCount = response.notifications.filter(n => n.status === 'unread').length;
                        setUnreadCount(actualUnreadCount);
                    } else {
                        console.log(`✅ Hook: Backend deletion confirmed`);
                        // Refresh the full list to ensure consistency
                        setNotifications(response.notifications);
                        setUnreadCount(response.notifications.filter(n => n.status === 'unread').length);
                    }
                } catch (refreshErr) {
                    console.error(`❌ Hook: Failed to refresh after delete:`, refreshErr);
                }
            }, 2000);

            console.log(`✅ Hook: Successfully deleted notification ${notificationId}`);
        } catch (err) {
            console.error(`❌ Hook: Error deleting notification ${notificationId}:`, err);

            // On error, force refresh to sync with backend state
            setTimeout(async () => {
                console.log(`🔄 Hook: Force refreshing notifications after delete error...`);
                try {
                    const response = await NotificationService.getNotifications(1, 20);
                    setNotifications(response.notifications);
                    setUnreadCount(response.notifications.filter(n => n.status === 'unread').length);
                    console.log(`✅ Hook: Refreshed notifications after delete error`);
                } catch (refreshErr) {
                    console.error(`❌ Hook: Failed to refresh after delete error:`, refreshErr);
                }
            }, 1000);

            throw err;
        }
    }, [notifications]);

    // Load more notifications
    const loadMore = useCallback(() => {
        if (!loading && hasMore) {
            fetchNotifications(page + 1, true);
        }
    }, [loading, hasMore, page, fetchNotifications]);

    // Refresh notifications
    const refresh = useCallback(async () => {
        console.log('🔄 Refreshing notifications and unread count...');
        await Promise.all([
            fetchNotifications(1, false),
            fetchUnreadCount()
        ]);
    }, [fetchNotifications, fetchUnreadCount]);

    // Initial load
    useEffect(() => {
        refresh();
    }, [refresh]);

    // Debug logging to help identify count mismatch issues
    useEffect(() => {
        const unreadNotifications = notifications.filter(n => n.status === 'unread');
        console.log('🔍 Notification Debug Info:');
        console.log('  - Total notifications:', notifications.length);
        console.log('  - Unread in list:', unreadNotifications.length);
        console.log('  - Unread count from API:', unreadCount);
        console.log('  - Notifications:', notifications.map(n => ({
            id: n.id,
            title: n.title,
            status: n.status,
            created_at: n.created_at
        })));

        if (unreadNotifications.length !== unreadCount) {
            console.warn('⚠️ Unread count mismatch detected!');
            console.warn('  - Expected (from API):', unreadCount);
            console.warn('  - Actual (in list):', unreadNotifications.length);
        }
    }, [notifications, unreadCount]);

    // Auto refresh
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, refreshInterval);

        // Listen for global refresh events (e.g., from supplier changes or marking as read)
        const handleGlobalRefresh = (event?: CustomEvent) => {
            console.log('🔄 Global notification refresh triggered', event?.detail);

            // If this is a mark-as-read event, be more conservative about refreshing
            if (event?.detail?.action === 'markAsRead') {
                console.log('🔄 Mark-as-read refresh - checking if refresh is needed');
                // Only refresh if the notification isn't already marked as read in local state
                const notificationId = event.detail.notificationId;
                const notification = notifications.find(n => n.id === notificationId);
                if (notification && notification.status === 'unread') {
                    console.log('🔄 Notification still shows as unread, refreshing...');
                    refresh();
                    fetchUnreadCount();
                } else {
                    console.log('🔄 Notification already marked as read locally, skipping refresh');
                }
            } else {
                // For other events, refresh immediately
                refresh();
                fetchUnreadCount();
            }
        };

        window.addEventListener('refreshNotifications', handleGlobalRefresh);

        return () => {
            clearInterval(interval);
            window.removeEventListener('refreshNotifications', handleGlobalRefresh);
        };
    }, [autoRefresh, refreshInterval, fetchUnreadCount, refresh, notifications]);

    return {
        notifications,
        unreadCount,
        loading,
        error,
        hasMore,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        loadMore,
        refresh,
        syncUnreadCount: () => {
            const actualUnreadCount = notifications.filter(n => n.status === 'unread').length;
            if (actualUnreadCount !== unreadCount) {
                console.log('🔄 Syncing unread count:', unreadCount, '→', actualUnreadCount);
                setUnreadCount(actualUnreadCount);
            }
        }
    };
}