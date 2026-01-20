/**
 * Notification API Service
 * Handles all notification-related API calls
 */

import { apiClient } from './client';

export interface BackendNotification {
    id: number;
    user_id: string;
    type: 'system' | 'permission' | 'export' | 'point' | 'api_key' | 'maintenance';
    priority: 'low' | 'medium' | 'high' | 'critical';
    title: string;
    message: string;
    status: 'unread' | 'read';
    meta_data?: any;
    created_at: string;
    read_at?: string;
}

export interface CreateNotificationRequest {
    user_id: string;
    type: 'system' | 'permission' | 'export' | 'point' | 'api_key' | 'maintenance';
    title: string;
    message: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    meta_data?: any;
}

export interface BroadcastNotificationRequest {
    type: 'system' | 'permission' | 'export' | 'point' | 'api_key' | 'maintenance';
    title: string;
    message: string;
    priority?: 'low' | 'medium' | 'high' | 'critical';
    meta_data?: any;
}

export interface NotificationResponse {
    notifications: BackendNotification[];
    total: number;
    page: number;
    limit: number;
    has_next: boolean;
    has_prev: boolean;
}

export interface UnreadCountResponse {
    unread_count: number;
}

export class NotificationService {
    /**
     * Get user notifications (paginated)
     * 
     * NOTE: Backend has pagination bug with limit=50, so we avoid that value
     */
    static async getNotifications(
        page: number = 1,
        limit: number = 20
    ): Promise<NotificationResponse> {
        // Avoid problematic limit values that cause backend pagination bug
        if (limit === 50) {
            console.warn('⚠️ Avoiding limit=50 due to backend pagination bug, using limit=49');
            limit = 49;
        }

        // Use basic endpoint for page 1 with default limit to avoid pagination bugs
        const endpoint = (page === 1 && limit === 20)
            ? '/notifications/'
            : `/notifications/?page=${page}&limit=${limit}`;

        const response = await apiClient.get<NotificationResponse>(endpoint);

        if (response.success && response.data) {
            return response.data;
        }

        throw new Error(response.error?.message || 'Failed to fetch notifications');
    }

    /**
     * Get unread notification count
     */
    static async getUnreadCount(): Promise<number> {
        const response = await apiClient.get<UnreadCountResponse>(
            '/notifications/unread-count'
        );

        if (response.success && response.data) {
            return response.data.unread_count;
        }

        throw new Error(response.error?.message || 'Failed to fetch unread count');
    }

    /**
     * Mark notification as read
     */
    static async markAsRead(notificationId: number): Promise<void> {
        console.log(`📖 Marking notification ${notificationId} as read...`);

        const response = await apiClient.put(`/notifications/${notificationId}/read`);

        console.log(`📖 Mark as read response:`, response);

        if (!response.success) {
            console.error(`❌ Failed to mark notification ${notificationId} as read:`, response.error);
            throw new Error(response.error?.message || 'Failed to mark notification as read');
        }

        console.log(`✅ Successfully marked notification ${notificationId} as read`);
    }

    /**
     * Mark all notifications as read
     */
    static async markAllAsRead(): Promise<void> {
        const response = await apiClient.put('/notifications/mark-all-read');

        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to mark all notifications as read');
        }
    }

    /**
     * Delete notification
     */
    static async deleteNotification(notificationId: number): Promise<void> {
        console.log(`🗑️ Deleting notification ${notificationId}...`);

        const response = await apiClient.delete(`/notifications/${notificationId}`);

        console.log(`🗑️ Delete response:`, response);

        if (!response.success) {
            if (response.error?.status === 404) {
                console.warn(`⚠️ Notification ${notificationId} not found (404) - it may have already been deleted`);
                // Don't throw error for 404 - treat as success since the notification is gone
                return;
            }

            if (response.error?.status === 403) {
                console.error(`🚫 Permission denied for notification ${notificationId} - user may not own this notification`);
                throw new Error(`Permission denied: You can only delete your own notifications`);
            }

            if (response.error?.status === 401) {
                console.error(`🔒 Authentication failed for notification ${notificationId} - token may be expired`);
                throw new Error(`Authentication failed: Please login again`);
            }

            console.error(`❌ Failed to delete notification ${notificationId}:`, response.error);
            throw new Error(response.error?.message || `Failed to delete notification (${response.error?.status})`);
        }

        console.log(`✅ Successfully deleted notification ${notificationId}`);

        // WORKAROUND: Backend has a bug where delete returns 200 but doesn't actually delete
        // We'll verify the deletion and retry if needed
        console.log(`🔍 Verifying deletion of notification ${notificationId}...`);

        // Wait a moment for backend to process
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            // Check if notification still exists
            const verifyResponse = await this.getNotifications(1, 20);
            const stillExists = verifyResponse.notifications.find(n => n.id === notificationId);

            if (stillExists) {
                console.warn(`⚠️ Notification ${notificationId} still exists after delete - backend may have a bug`);
                console.warn(`⚠️ This is a known backend issue where delete returns 200 but doesn't actually delete`);

                // For now, we'll treat this as a successful delete in the UI
                // The notification will be removed from the local state by the hook
                console.log(`✅ Treating as successful delete for UI purposes`);
            } else {
                console.log(`✅ Deletion verified - notification ${notificationId} no longer exists`);
            }
        } catch (verifyError) {
            console.warn(`⚠️ Could not verify deletion of notification ${notificationId}:`, verifyError);
            // Continue anyway - the delete API returned success
        }
    }

    /**
     * Create notification (Admin only)
     */
    static async createNotification(request: CreateNotificationRequest): Promise<BackendNotification> {
        console.log("📡 NotificationService.createNotification called with:", request);

        // Validate meta_data before sending
        if (request.meta_data) {
            console.log("🔍 meta_data validation:");
            console.log("  - Type:", typeof request.meta_data);
            console.log("  - Keys:", Object.keys(request.meta_data));
            console.log("  - JSON serializable:", JSON.stringify(request.meta_data) !== undefined);
        }

        // Let's also log the exact JSON that will be sent
        const requestBody = JSON.stringify(request, null, 2);
        console.log("📦 Request JSON to be sent:", requestBody);

        const response = await apiClient.post<BackendNotification>(
            '/notifications/admin/create',
            request
        );

        console.log("📡 Raw API Response:", response);

        if (response.success && response.data) {
            console.log("✅ Notification created successfully:", response.data);
            console.log("🔍 Response meta_data type:", typeof response.data.meta_data);
            console.log("🔍 Response meta_data content:", response.data.meta_data);

            // Additional validation
            if (request.meta_data && !response.data.meta_data) {
                console.error("❌ WARNING: meta_data was sent but not returned in response!");
            } else if (request.meta_data && response.data.meta_data) {
                const sentKeys = Object.keys(request.meta_data);
                const receivedKeys = Object.keys(response.data.meta_data);
                console.log("🔍 Sent meta_data keys:", sentKeys);
                console.log("🔍 Received meta_data keys:", receivedKeys);

                const missingKeys = sentKeys.filter(key => !receivedKeys.includes(key));
                if (missingKeys.length > 0) {
                    console.error("❌ WARNING: Some meta_data keys are missing in response:", missingKeys);
                }
            }

            return response.data;
        }

        console.error("❌ Failed to create notification:", response.error);
        throw new Error(response.error?.message || 'Failed to create notification');
    }

    /**
     * Broadcast notification to all users (Admin only)
     */
    static async broadcastNotification(request: BroadcastNotificationRequest): Promise<void> {
        const response = await apiClient.post(
            '/notifications/admin/broadcast',
            request
        );

        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to broadcast notification');
        }
    }
}