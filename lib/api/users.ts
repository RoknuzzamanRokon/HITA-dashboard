/**
 * User management API service
 */

import { apiClient } from './client';
import { apiEndpoints } from '@/lib/config';
import type { ApiResponse, PaginatedResponse } from '@/lib/types/api';
import type { User } from '@/lib/types/auth';
import type { UserListItem, UserFormData, UserSearchParams, UserStats } from '@/lib/types/user';

export class UserService {
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
     * Create new user
     */
    static async createUser(userData: UserFormData): Promise<ApiResponse<User>> {
        return apiClient.post<User>(apiEndpoints.users.create, userData);
    }

    /**
     * Update existing user
     */
    static async updateUser(id: string, userData: Partial<UserFormData>): Promise<ApiResponse<User>> {
        return apiClient.put<User>(apiEndpoints.users.update(id), userData);
    }

    /**
     * Delete user
     */
    static async deleteUser(id: string): Promise<ApiResponse<void>> {
        return apiClient.delete<void>(apiEndpoints.users.delete(id));
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
}