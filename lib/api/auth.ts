/**
 * Authentication API service
 */

import { apiClient } from './client';
import { apiEndpoints, config } from '@/lib/config';
import { TokenStorage } from '@/lib/auth/token-storage';
import { MockAuthService } from './mock-auth';
import type { LoginCredentials, AuthResponse, User } from '@/lib/types/auth';
import type { ApiResponse } from '@/lib/types/api';

export class AuthService {
    /**
     * Check if we should use mock authentication
     */
    private static shouldUseMock(): boolean {
        return config.useMockAuth || config.isDevelopment;
    }

    /**
     * Login user with credentials
     */
    static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
        // Try real API first, fall back to mock if it fails
        if (!this.shouldUseMock()) {
            try {
                // Prepare form data for OAuth2 token endpoint
                const formData = new FormData();
                formData.append('username', credentials.username);
                formData.append('password', credentials.password);
                formData.append('grant_type', 'password');

                const response = await apiClient.request<AuthResponse>(
                    apiEndpoints.auth.login,
                    {
                        method: 'POST',
                        headers: {
                            // Don't set Content-Type for FormData
                        },
                        body: formData,
                        requiresAuth: false,
                    }
                );

                // Store tokens if login successful
                if (response.success && response.data) {
                    TokenStorage.setToken(response.data.access_token);
                    if (response.data.refresh_token) {
                        TokenStorage.setRefreshToken(response.data.refresh_token);
                    }
                }

                return response;
            } catch (error) {
                console.warn('Real API failed, falling back to mock authentication');
                // Fall through to mock authentication
            }
        }

        // Use mock authentication
        try {
            const response = await MockAuthService.login(credentials);

            // Store mock token if login successful
            if (response.success && response.data) {
                TokenStorage.setToken(response.data.access_token);
                if (response.data.refresh_token) {
                    TokenStorage.setRefreshToken(response.data.refresh_token);
                }
            }

            return response;
        } catch (error) {
            return {
                success: false,
                error: {
                    status: 0,
                    message: error instanceof Error ? error.message : 'Login failed',
                },
            };
        }
    }

    /**
     * Logout user
     */
    static async logout(): Promise<void> {
        try {
            // Clear tokens from storage
            TokenStorage.clearTokens();

            // Call logout on mock service if using mock
            if (this.shouldUseMock()) {
                await MockAuthService.logout();
            } else {
                // Optional: Call logout endpoint if it exists
                // await apiClient.post('/auth/logout');
            }
        } catch (error) {
            console.error('Logout error:', error);
            // Still clear tokens even if API call fails
            TokenStorage.clearTokens();
        }
    }

    /**
     * Get current user profile
     */
    static async getCurrentUser(): Promise<ApiResponse<User>> {
        // Try real API first, fall back to mock if it fails
        if (!this.shouldUseMock()) {
            try {
                const response = await apiClient.get<User>(apiEndpoints.users.profile);
                if (response.success) {
                    return response;
                }
            } catch (error) {
                console.warn('Real API failed, falling back to mock authentication');
                // Fall through to mock authentication
            }
        }

        // Use mock authentication
        return MockAuthService.getCurrentUser();
    }

    /**
     * Register new user (if endpoint exists)
     */
    static async register(userData: {
        username: string;
        email: string;
        password: string;
        role?: string;
    }): Promise<ApiResponse<User>> {
        return apiClient.post<User>(apiEndpoints.auth.register, userData, false);
    }

    /**
     * Check if user is authenticated
     */
    static isAuthenticated(): boolean {
        return TokenStorage.hasToken();
    }

    /**
     * Get stored token
     */
    static getToken(): string | null {
        return TokenStorage.getToken();
    }

    /**
     * Refresh authentication token
     */
    static async refreshToken(): Promise<ApiResponse<AuthResponse>> {
        const refreshToken = TokenStorage.getRefreshToken();

        if (!refreshToken) {
            return {
                success: false,
                error: {
                    status: 401,
                    message: 'No refresh token available',
                },
            };
        }

        const response = await apiClient.post<AuthResponse>(
            apiEndpoints.auth.refresh,
            { refresh_token: refreshToken },
            false
        );

        // Update stored tokens if refresh successful
        if (response.success && response.data) {
            TokenStorage.setToken(response.data.access_token);
            if (response.data.refresh_token) {
                TokenStorage.setRefreshToken(response.data.refresh_token);
            }
        }

        return response;
    }
}