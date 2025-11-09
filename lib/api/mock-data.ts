/**
 * Mock data for development when backend is not available
 */

import type { DetailedUserInfo } from './user-edit';

/**
 * Generate mock user details
 */
export function generateMockUserDetails(userId: string): DetailedUserInfo {
    return {
        id: userId,
        username: `user_${userId.slice(0, 8)}`,
        email: `user${userId.slice(0, 4)}@example.com`,
        role: 'admin_user',
        api_key: `mock_api_key_${userId.slice(0, 16)}`,
        points: {
            total_points: 1000,
            current_points: 750,
            total_used_points: 250,
            paid_status: 'Paid',
            total_rq: 42,
        },
        active_suppliers: ['Expedia', 'Booking.com', 'Agoda'],
        total_suppliers: 8,
        created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        user_status: 'active',
        is_active: true,
        using_rq_status: 'Active',
        created_by: 'admin',
        viewed_by: {
            user_id: 'admin-001',
            username: 'admin',
            email: 'admin@example.com',
            role: 'super_user',
        },
    };
}

/**
 * Mock successful response
 */
export function mockSuccessResponse<T>(data: T) {
    return {
        success: true as const,
        data,
    };
}

/**
 * Mock error response
 */
export function mockErrorResponse(status: number, message: string) {
    return {
        success: false as const,
        error: {
            status,
            message,
        },
    };
}
