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
     */
    static async getNotifications(
        page: number = 1,
        limit: number = 20
    ): Promise<NotificationResponse> {
        const response = await apiClient.get<NotificationResponse>(
            `/notifications/?page=${page}&limit=${limit}`
        );

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
        const response = await apiClient.delete(`/notifications/${notificationId}`);

        if (!response.success) {
            throw new Error(response.error?.message || 'Failed to delete notification');
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