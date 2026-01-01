/**
 * User management API service
 */

import { apiClient } from './client';
import { apiEndpoints } from '@/lib/config';
import type { ApiResponse, PaginatedResponse } from '@/lib/types/api';
import type { User } from '@/lib/types/auth';
import { UserRole } from '@/lib/types/auth';
import type { UserListItem, UserFormData, UserSearchParams, UserStats } from '@/lib/types/user';

export class UserService {
    /**
     * Get all users (admin endpoint)
     */
    static async getAllUsers(): Promise<ApiResponse<UserListItem[]>> {
        console.log("📡 Fetching all users from:", apiEndpoints.users.getAllUsers);

        try {
            // Use the paginated endpoint with maximum allowed limit (100)
            let allUsers: UserListItem[] = [];
            let page = 1;
            let hasMore = true;
            const limit = 100; // Maximum allowed by API

            while (hasMore) {
                const response = await apiClient.get<any>(`${apiEndpoints.users.getAllUsers}?limit=${limit}&page=${page}`);

                if (response.success && response.data) {
                    // Handle the new paginated response format: { users: [...], pagination: {...}, statistics: {...} }
                    const backendData = response.data;

                    if (backendData.users && Array.isArray(backendData.users)) {
                        backendData.users.forEach((user: any) => {
                            allUsers.push(this.transformBackendUser(user));
                        });
                    }

                    // Check if there are more pages
                    const pagination = backendData.pagination;
                    if (pagination && pagination.page && pagination.total_pages) {
                        hasMore = pagination.page < pagination.total_pages;
                        page++;
                    } else {
                        // If no pagination info, assume we got all users if we got less than the limit
                        hasMore = backendData.users && backendData.users.length === limit;
                        page++;
                    }

                    console.log(`✅ Fetched page ${page - 1}: ${backendData.users?.length || 0} users`);
                } else {
                    // If any page fails, break the loop and return what we have
                    console.error("❌ Failed to fetch page", page, ":", response.error);
                    break;
                }
            }

            console.log("✅ Total users fetched:", allUsers.length);

            return {
                success: true,
                data: allUsers
            };
        } catch (error) {
            console.error("❌ Error in getAllUsers:", error);

            // Fallback to the original endpoint if the new one fails
            console.log("🔄 Trying fallback endpoint: /user/check/all/fast/");
            try {
                const fallbackResponse = await apiClient.get<any>('/user/check/all/fast/');

                if (fallbackResponse.success && fallbackResponse.data) {
                    // Handle the old format: { super_users: [], admin_users: [], general_users: [], root_user: {} }
                    const backendData = fallbackResponse.data;
                    const allUsers: UserListItem[] = [];

                    if (backendData.super_users && Array.isArray(backendData.super_users)) {
                        backendData.super_users.forEach((user: any) => {
                            allUsers.push(this.transformBackendUser(user));
                        });
                    }

                    if (backendData.admin_users && Array.isArray(backendData.admin_users)) {
                        backendData.admin_users.forEach((user: any) => {
                            allUsers.push(this.transformBackendUser(user));
                        });
                    }

                    if (backendData.general_users && Array.isArray(backendData.general_users)) {
                        backendData.general_users.forEach((user: any) => {
                            allUsers.push(this.transformBackendUser(user));
                        });
                    }

                    // Also include the root user (current user) if it exists
                    if (backendData.root_user && backendData.root_user.id) {
                        allUsers.push(this.transformBackendUser(backendData.root_user));
                    }

                    console.log("✅ Fallback successful - Fetched users:", allUsers.length);

                    return {
                        success: true,
                        data: allUsers
                    };
                }

                return fallbackResponse;
            } catch (fallbackError) {
                console.error("❌ Fallback also failed:", fallbackError);
                return {
                    success: false,
                    error: {
                        status: 500,
                        message: "Failed to fetch users from both endpoints"
                    }
                };
            }
        }
    }

    /**
     * Get paginated list of users with search and filtering
     */
    static async getUsers(params: UserSearchParams = {}): Promise<ApiResponse<PaginatedResponse<UserListItem>>> {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.search) searchParams.append('search', params.search);
        if (params.role) searchParams.append('role', params.role);
        if (params.isActive !== undefined) searchParams.append('is_active', params.isActive.toString());
        if (params.sortBy) searchParams.append('sort_by', params.sortBy.toString());
        if (params.sortOrder) searchParams.append('sort_order', params.sortOrder);

        const queryString = searchParams.toString();
        const endpoint = queryString ? `${apiEndpoints.users.list}?${queryString}` : apiEndpoints.users.list;

        return apiClient.get<PaginatedResponse<UserListItem>>(endpoint);
    }

    /**
     * Get user by ID
     */
    static async getUserById(id: string): Promise<ApiResponse<UserListItem>> {
        return apiClient.get<UserListItem>(`${apiEndpoints.users.list}/${id}`);
    }

    /**
     * Get detailed user information by ID
     */
    static async getUserInfo(id: string): Promise<ApiResponse<UserListItem>> {
        console.log("📡 Fetching user info for ID:", id);

        const response = await apiClient.get<any>(apiEndpoints.users.getUserInfo(id));

        if (response.success && response.data) {
            // Transform the backend response to match frontend expectations
            const transformedUser = this.transformBackendUser(response.data);

            console.log("✅ User info retrieved and transformed:", transformedUser);

            return {
                success: true,
                data: transformedUser
            };
        }

        return response;
    }

    /**
     * Get detailed user information with full API response (for user details modal)
     */
    static async getDetailedUserInfo(id: string): Promise<ApiResponse<any>> {
        console.log("📡 Fetching detailed user info for ID:", id);

        const response = await apiClient.get<any>(apiEndpoints.users.getUserInfo(id));

        if (response.success && response.data) {
            console.log("✅ Detailed user info retrieved:", response.data);
        }

        return response;
    }

    /**
     * Check user info using the new API endpoint
     */
    static async checkUserInfo(id: string): Promise<ApiResponse<any>> {
        console.log("📡 Checking user info for ID:", id);
        console.log("📡 Making request to endpoint: /user/check-user-info/" + id);

        try {
            const response = await apiClient.get<any>(`/user/check-user-info/${id}`);

            console.log("📡 Raw API response:", response);

            if (response.success && response.data) {
                console.log("✅ User info checked successfully:", response.data);
            } else {
                console.error("❌ API returned error:", response.error);
            }

            return response;
        } catch (error) {
            console.error("❌ Exception in checkUserInfo:", error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: error instanceof Error ? error.message : "Unknown error occurred",
                    details: error
                }
            };
        }
    }

    /**
     * Get user activity log
     */
    static async getUserActivity(id: string): Promise<ApiResponse<any>> {
        console.log("📡 Fetching user activity for ID:", id);
        console.log("📡 Making request to endpoint: /user/" + id + "/activity");

        try {
            const response = await apiClient.get<any>(`/user/${id}/activity`);

            console.log("📡 Raw activity API response:", response);

            if (response.success && response.data) {
                console.log("✅ User activity fetched successfully:", response.data);
            } else {
                console.error("❌ API returned error:", response.error);
            }

            return response;
        } catch (error) {
            console.error("❌ Exception in getUserActivity:", error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: error instanceof Error ? error.message : "Unknown error occurred",
                    details: error
                }
            };
        }
    }

    /**
     * Create new user (generic) - routes to appropriate specific endpoint
     */
    static async createUser(userData: UserFormData): Promise<ApiResponse<User>> {
        // Route to the appropriate specific endpoint based on role
        // Only include password if it's provided (not empty/undefined)
        const baseData = {
            username: userData.username,
            email: userData.email,
            ...(userData.password && userData.password.trim() ? { password: userData.password } : {}),
        };

        switch (userData.role) {
            case UserRole.SUPER_USER:
                return this.createSuperUser(baseData);
            case UserRole.ADMIN_USER:
                return this.createAdminUser({
                    ...baseData,
                    business_id: '', // You might need to add this to UserFormData if needed
                });
            case UserRole.GENERAL_USER:
            default:
                return this.createGeneralUser(baseData);
        }
    }

    /**
     * Create super user
     */
    static async createSuperUser(userData: {
        username: string;
        email: string;
        password?: string;
    }): Promise<ApiResponse<User>> {
        console.log("📡 Creating super user:", { username: userData.username, email: userData.email });
        return apiClient.post<User>(apiEndpoints.users.createSuperUser, userData);
    }

    /**
     * Create admin user
     */
    static async createAdminUser(userData: {
        username: string;
        email: string;
        business_id: string;
        password?: string;
    }): Promise<ApiResponse<User>> {
        console.log("📡 Creating admin user:", { username: userData.username, email: userData.email, business_id: userData.business_id });
        return apiClient.post<User>(apiEndpoints.users.createAdminUser, userData);
    }

    /**
     * Create general user
     */
    static async createGeneralUser(userData: {
        username: string;
        email: string;
        password?: string;
    }): Promise<ApiResponse<User>> {
        console.log("📡 Creating general user:", { username: userData.username, email: userData.email });
        return apiClient.post<User>(apiEndpoints.users.createGeneralUser, userData);
    }

    /**
     * Update existing user
     */
    static async updateUser(id: string, userData: Partial<UserFormData>): Promise<ApiResponse<User>> {
        return apiClient.put<User>(apiEndpoints.users.update(id), userData);
    }

    /**
     * Delete user (generic)
     */
    static async deleteUser(id: string): Promise<ApiResponse<void>> {
        console.log("📡 Deleting user:", id);
        return apiClient.delete<void>(apiEndpoints.users.deleteUser(id));
    }

    /**
     * Delete super user
     */
    static async deleteSuperUser(id: string): Promise<ApiResponse<void>> {
        console.log("📡 Deleting super user:", id);
        return apiClient.delete<void>(apiEndpoints.users.deleteSuperUser(id));
    }

    /**
     * Get user statistics
     */
    static async getUserStats(): Promise<ApiResponse<UserStats>> {
        return apiClient.get<UserStats>(`${apiEndpoints.users.list}/stats`);
    }

    /**
     * Search users by username or email
     */
    static async searchUsers(query: string, limit = 10): Promise<ApiResponse<UserListItem[]>> {
        const searchParams = new URLSearchParams({
            search: query,
            limit: limit.toString(),
        });

        return apiClient.get<UserListItem[]>(`${apiEndpoints.users.list}/search?${searchParams}`);
    }

    /**
     * Toggle user active status
     */
    static async toggleUserStatus(id: string, isActive: boolean): Promise<ApiResponse<User>> {
        return apiClient.patch<User>(apiEndpoints.users.update(id), { isActive });
    }

    /**
     * Update user points
     */
    static async updateUserPoints(id: string, points: number): Promise<ApiResponse<User>> {
        return apiClient.patch<User>(`${apiEndpoints.users.list}/${id}/points`, { points });
    }

    /**
     * Transform backend user data to frontend UserListItem format
     */
    private static transformBackendUser(backendUser: any): UserListItem {
        // Handle both old and new response formats
        let role: UserRole;

        // New format uses 'role' field directly
        if (backendUser.role) {
            role = backendUser.role;
        } else {
            // Old format uses 'user_status'
            switch (backendUser.user_status) {
                case 'super_user':
                    role = UserRole.SUPER_USER;
                    break;
                case 'admin_user':
                    role = UserRole.ADMIN_USER;
                    break;
                case 'general_user':
                default:
                    role = UserRole.GENERAL_USER;
                    break;
            }
        }

        return {
            id: backendUser.id,
            username: backendUser.username,
            email: backendUser.email,
            role: role,
            isActive: backendUser.is_active,
            // New format has direct fields
            pointBalance: backendUser.point_balance || backendUser.points?.current_points || 0,
            totalPoints: backendUser.total_points || backendUser.points?.total_points || 0,
            paidStatus: backendUser.paid_status || backendUser.points?.paid_status || 'Unknown',
            totalRequests: backendUser.total_requests || backendUser.points?.total_rq || 0,
            usingRqStatus: backendUser.activity_status || backendUser.using_rq_status || 'Inactive',
            createdAt: backendUser.created_at,
            createdBy: backendUser.created_by || undefined,
            lastLogin: backendUser.last_login || undefined,
            activeSuppliers: backendUser.active_suppliers || []
        };
    }
}