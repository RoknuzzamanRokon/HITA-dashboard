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
        try {
            console.log(`🔄 Hook: Marking notification ${notificationId} as read...`);

            await NotificationService.markAsRead(notificationId);

            console.log(`🔄 Hook: API call successful, updating local state...`);

            // Update local state
            setNotifications(prev => {
                const updated = prev.map(notification =>
                    notification.id === notificationId
                        ? { ...notification, status: 'read' as const, read_at: new Date().toISOString() }
                        : notification
                );

                console.log(`🔄 Hook: Updated notifications state`, {
                    before: prev.find(n => n.id === notificationId)?.status,
                    after: updated.find(n => n.id === notificationId)?.status
                });

                return updated;
            });

            // Update unread count
            setUnreadCount(prev => {
                const newCount = Math.max(0, prev - 1);
                console.log(`🔄 Hook: Updated unread count: ${prev} → ${newCount}`);
                return newCount;
            });

            console.log(`✅ Hook: Successfully marked notification ${notificationId} as read`);

            // Force refresh after a short delay to ensure backend persistence
            setTimeout(async () => {
                console.log(`🔄 Hook: Force refreshing notifications to verify persistence...`);
                try {
                    const response = await NotificationService.getNotifications(1, 20);
                    const updatedNotification = response.notifications.find(n => n.id === notificationId);

                    if (updatedNotification && updatedNotification.status === 'unread') {
                        console.log(`⚠️ Hook: Backend didn't persist the read status, forcing local update again...`);
                        // If backend didn't persist, we need to refresh the entire list
                        setNotifications(response.notifications);
                        setUnreadCount(response.notifications.filter(n => n.status === 'unread').length);
                    } else {
                        console.log(`✅ Hook: Backend persistence verified`);
                    }
                } catch (refreshErr) {
                    console.error(`❌ Hook: Failed to verify persistence:`, refreshErr);
                }
            }, 2000);

        } catch (err) {
            console.error(`❌ Hook: Error marking notification ${notificationId} as read:`, err);
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
            await NotificationService.deleteNotification(notificationId);

            // Update local state
            const notification = notifications.find(n => n.id === notificationId);
            setNotifications(prev => prev.filter(n => n.id !== notificationId));

            // Update unread count if it was unread
            if (notification?.status === 'unread') {
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (err) {
            console.error('Error deleting notification:', err);
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

        // Listen for global refresh events (e.g., from supplier changes)
        const handleGlobalRefresh = () => {
            console.log('🔄 Global notification refresh triggered');
            refresh();
        };

        window.addEventListener('refreshNotifications', handleGlobalRefresh);

        return () => {
            clearInterval(interval);
            window.removeEventListener('refreshNotifications', handleGlobalRefresh);
        };
    }, [autoRefresh, refreshInterval, fetchUnreadCount, refresh]);

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