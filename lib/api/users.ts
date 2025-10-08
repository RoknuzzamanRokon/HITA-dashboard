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

        const response = await apiClient.get<any>(apiEndpoints.users.getAllUsers);

        if (response.success && response.data) {
            // Transform the backend response to match frontend expectations
            const backendData = response.data;
            const allUsers: UserListItem[] = [];

            // New API format: { total_users: number, users: [...] }
            if (backendData.users && Array.isArray(backendData.users)) {
                backendData.users.forEach((user: any) => {
                    allUsers.push(this.transformBackendUser(user));
                });
            }

            console.log("✅ Transformed users:", allUsers.length, "out of", backendData.total_users || 0);

            return {
                success: true,
                data: allUsers
            };
        }

        return response;
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
     * Create new user (generic)
     */
    static async createUser(userData: UserFormData): Promise<ApiResponse<User>> {
        return apiClient.post<User>(apiEndpoints.users.create, userData);
    }

    /**
     * Create super user
     */
    static async createSuperUser(userData: {
        username: string;
        email: string;
        password: string;
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
        password: string;
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
        password: string;
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
        // Map backend user_status to UserRole enum
        let role: UserRole;
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

        return {
            id: backendUser.id,
            username: backendUser.username,
            email: backendUser.email,
            role: role,
            isActive: backendUser.is_active,
            pointBalance: backendUser.points?.current_points || 0,
            totalPoints: backendUser.points?.total_points || 0,
            paidStatus: backendUser.points?.paid_status || 'Unknown',
            totalRequests: backendUser.points?.total_rq || 0,
            usingRqStatus: backendUser.using_rq_status || 'Inactive',
            createdAt: backendUser.created_at,
            createdBy: backendUser.created_by || undefined,
            lastLogin: undefined, // Not provided in backend response
            activeSuppliers: [] // Not provided in backend response
        };
    }
}