/**
 * User Edit Management API service
 * Handles all user editing operations including point allocation, supplier management,
 * user activation, point reset, user deletion, and API key generation
 */

import { apiClient } from './client';
import type { ApiResponse } from '@/lib/types/api';
import { generateMockUserDetails, mockSuccessResponse } from './mock-data';

/**
 * Allocation types for point distribution
 */
export type AllocationType =
    | 'admin_user_package'
    | 'one_year_package'
    | 'one_month_package'
    | 'per_request_point'
    | 'guest_point';

/**
 * Detailed user information interface
 */
export interface DetailedUserInfo {
    id: string;
    username: string;
    email: string;
    role: string;
    api_key: string | null;
    points: {
        total_points: number;
        current_points: number;
        total_used_points: number;
        paid_status: string;
        total_rq: number;
    };
    active_suppliers: string[];
    total_suppliers: number;
    created_at: string;
    updated_at: string;
    user_status: string;
    is_active: boolean;
    using_rq_status: string;
    created_by: string;
    viewed_by: {
        user_id: string;
        username: string;
        email: string;
        role: string;
    };
}

/**
 * Point allocation request payload
 */
export interface PointAllocationRequest {
    receiver_email: string;
    receiver_id: string;
    allocation_type: AllocationType;
}

/**
 * Supplier management request payload
 */
export interface SupplierManagementRequest {
    provider_activision_list: string[];
}

/**
 * User Edit Service class
 * Provides methods for all user editing operations
 */
export class UserEditService {
    /**
     * Endpoint 1: Get detailed user information
     * GET /user/check-user-info/{user_id}
     */
    static async getUserDetails(userId: string): Promise<ApiResponse<DetailedUserInfo>> {
        console.log('📡 Fetching detailed user info for ID:', userId);

        const response = await apiClient.get<DetailedUserInfo>(
            `/user/check-user-info/${userId}`
        );

        if (response.success) {
            console.log('✅ User details retrieved successfully');
        } else {
            // Use mock data if backend is not available (status 0 = network error)
            if (response.error?.status === 0 && process.env.NODE_ENV === 'development') {
                console.log('🔧 Backend unavailable - using mock data for development');
                const mockData = generateMockUserDetails(userId);
                return mockSuccessResponse(mockData);
            }

            // Only log error if we're not using mock data
            console.error('❌ Failed to fetch user details:', response.error);
        }

        return response;
    }

    /**
     * Endpoint 2: Allocate points to user
     * POST /user/points/give/
     */
    static async allocatePoints(
        userId: string,
        email: string,
        allocationType: AllocationType
    ): Promise<ApiResponse<any>> {
        console.log('📡 Allocating points:', { userId, email, allocationType });

        const payload: PointAllocationRequest = {
            receiver_email: email,
            receiver_id: userId,
            allocation_type: allocationType,
        };

        const response = await apiClient.post<any>('/user/points/give/', payload);

        if (response.success) {
            console.log('✅ Points allocated successfully');
        } else {
            // Use mock success if backend is not available
            if (response.error?.status === 0 && process.env.NODE_ENV === 'development') {
                console.log('🔧 Backend unavailable - using mock response for development');
                return mockSuccessResponse({ message: 'Points allocated successfully (mock)' });
            }

            // Only log error if we're not using mock data
            console.error('❌ Failed to allocate points:', response.error);
        }

        return response;
    }

    /**
     * Endpoint 3: Activate suppliers for user
     * POST /permissions/admin/activate_supplier?user_id={user_id}
     */
    static async activateSuppliers(
        userId: string,
        suppliers: string[]
    ): Promise<ApiResponse<any>> {
        console.log('📡 Activating suppliers for user:', { userId, suppliers });

        const payload: SupplierManagementRequest = {
            provider_activision_list: suppliers,
        };

        const response = await apiClient.post<any>(
            `/permissions/admin/activate_supplier?user_id=${userId}`,
            payload
        );

        if (response.success) {
            console.log('✅ Suppliers activated successfully');
        } else {
            // Use mock success if backend is not available
            if (response.error?.status === 0 && process.env.NODE_ENV === 'development') {
                console.log('🔧 Backend unavailable - using mock response for development');
                return mockSuccessResponse({ message: 'Suppliers activated successfully (mock)' });
            }

            // Only log error if we're not using mock data
            console.error('❌ Failed to activate suppliers:', response.error);
        }

        return response;
    }

    /**
     * Endpoint 4: Deactivate suppliers for user
     * POST /permissions/admin/deactivate_supplier?user_id={user_id}
     */
    static async deactivateSuppliers(
        userId: string,
        suppliers: string[]
    ): Promise<ApiResponse<any>> {
        console.log('📡 Deactivating suppliers for user:', { userId, suppliers });

        const payload: SupplierManagementRequest = {
            provider_activision_list: suppliers,
        };

        const response = await apiClient.post<any>(
            `/permissions/admin/deactivate_supplier?user_id=${userId}`,
            payload
        );

        if (response.success) {
            console.log('✅ Suppliers deactivated successfully');
        } else {
            // Use mock success if backend is not available
            if (response.error?.status === 0 && process.env.NODE_ENV === 'development') {
                console.log('🔧 Backend unavailable - using mock response for development');
                return mockSuccessResponse({ message: 'Suppliers deactivated successfully (mock)' });
            }

            // Only log error if we're not using mock data
            console.error('❌ Failed to deactivate suppliers:', response.error);
        }

        return response;
    }

    /**
     * Endpoint 5: Activate user account
     * POST /auth/admin/users/{user_id}/activate
     */
    static async activateUser(userId: string): Promise<ApiResponse<any>> {
        console.log('📡 Activating user:', userId);

        const response = await apiClient.post<any>(
            `/auth/admin/users/${userId}/activate`,
            {}
        );

        if (response.success) {
            console.log('✅ User activated successfully');
        } else {
            // Use mock success if backend is not available
            if (response.error?.status === 0 && process.env.NODE_ENV === 'development') {
                console.log('🔧 Backend unavailable - using mock response for development');
                return mockSuccessResponse({ message: 'User status toggled successfully (mock)' });
            }

            // Only log error if we're not using mock data
            console.error('❌ Failed to activate user:', response.error);
        }

        return response;
    }

    /**
     * Endpoint 6: Reset user points to zero
     * POST /user/reset_point/{user_id}/
     */
    static async resetUserPoints(userId: string): Promise<ApiResponse<any>> {
        console.log('📡 Resetting points for user:', userId);

        const response = await apiClient.post<any>(
            `/user/reset_point/${userId}/`,
            {}
        );

        if (response.success) {
            console.log('✅ User points reset successfully');
        } else {
            // Use mock success if backend is not available
            if (response.error?.status === 0 && process.env.NODE_ENV === 'development') {
                console.log('🔧 Backend unavailable - using mock response for development');
                return mockSuccessResponse({ message: 'User points reset successfully (mock)' });
            }

            // Only log error if we're not using mock data
            console.error('❌ Failed to reset user points:', response.error);
        }

        return response;
    }

    /**
     * Endpoint 7: Delete user account
     * DELETE /delete/delete_user/{user_id}
     */
    static async deleteUser(userId: string): Promise<ApiResponse<any>> {
        console.log('📡 Deleting user:', userId);

        const response = await apiClient.delete<any>(
            `/delete/delete_user/${userId}`
        );

        if (response.success) {
            console.log('✅ User deleted successfully');
        } else {
            // Use mock success if backend is not available
            if (response.error?.status === 0 && process.env.NODE_ENV === 'development') {
                console.log('🔧 Backend unavailable - using mock response for development');
                return mockSuccessResponse({ message: 'User deleted successfully (mock)' });
            }

            // Only log error if we're not using mock data
            console.error('❌ Failed to delete user:', response.error);
        }

        return response;
    }

    /**
     * Endpoint 8: Generate API key for user
     * POST /auth/generate_api_key/{user_id}
     */
    static async generateApiKey(userId: string): Promise<ApiResponse<{ api_key: string }>> {
        console.log('📡 Generating API key for user:', userId);

        const response = await apiClient.post<{ api_key: string }>(
            `/auth/generate_api_key/${userId}`,
            {}
        );

        if (response.success) {
            console.log('✅ API key generated successfully');
        } else {
            // Use mock success if backend is not available
            if (response.error?.status === 0 && process.env.NODE_ENV === 'development') {
                console.log('🔧 Backend unavailable - using mock response for development');
                const mockApiKey = `mock_api_key_${Date.now()}_${userId.slice(0, 8)}`;
                return mockSuccessResponse({ api_key: mockApiKey });
            }

            // Only log error if we're not using mock data
            console.error('❌ Failed to generate API key:', response.error);
        }

        return response;
    }
}
