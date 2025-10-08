/**
 * Authentication API service
 */

import { apiClient } from './client';
import { apiEndpoints, config } from '@/lib/config';
import { TokenStorage } from '@/lib/auth/token-storage';
import { MockAuthService } from './mock-auth';
import type { LoginCredentials, AuthResponse, User } from '@/lib/types/auth';
import { UserRole } from '@/lib/types/auth';
import type { ApiResponse } from '@/lib/types/api';

export class AuthService {
    /**
     * Check if we should use mock authentication
     */
    private static shouldUseMock(): boolean {
        return config.useMockAuth;
    }

    /**
     * Login user with credentials
     */
    static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
        console.log("🔐 AuthService.login called with:", { username: credentials.username });
        console.log("🔧 shouldUseMock():", this.shouldUseMock());

        // Try real API first, fall back to mock if it fails
        if (!this.shouldUseMock()) {
            console.log("🌐 Using real API for login...");
            try {
                // Prepare URL-encoded form data for OAuth2 token endpoint
                const formBody = new URLSearchParams();
                formBody.append('username', credentials.username);
                formBody.append('password', credentials.password);
                formBody.append('grant_type', 'password');

                console.log("📡 Making API request to:", apiEndpoints.auth.login);
                const response = await apiClient.request<AuthResponse>(
                    apiEndpoints.auth.login,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                        body: formBody.toString(),
                        requiresAuth: false,
                    }
                );

                console.log("📡 API response:", response);

                // Store tokens if login successful
                if (response.success && response.data) {
                    console.log("💾 Storing tokens...");
                    TokenStorage.setToken(response.data.access_token);
                    if (response.data.refresh_token) {
                        TokenStorage.setRefreshToken(response.data.refresh_token);
                    }
                    console.log("✅ Tokens stored successfully");
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
        console.log("👤 AuthService.getCurrentUser called");
        console.log("🔧 shouldUseMock():", this.shouldUseMock());

        // Try real API first, fall back to mock if it fails
        if (!this.shouldUseMock()) {
            console.log("🌐 Fetching user profile from real API...");
            try {
                console.log("📡 Making request to:", apiEndpoints.users.profile);
                const response = await apiClient.get<any>(apiEndpoints.users.profile);
                console.log("📡 User profile response:", response);

                if (response.success && response.data) {
                    // Map backend user data to frontend User type
                    const backendUser = response.data;
                    console.log("🔄 Mapping backend user:", backendUser);
                    const mappedUser: User = this.mapBackendUserToFrontend(backendUser);
                    console.log("✅ Mapped user:", mappedUser);

                    return {
                        success: true,
                        data: mappedUser
                    };
                } else {
                    console.warn("❌ User profile request failed:", response.error);
                    return response;
                }
            } catch (error) {
                console.warn('❌ Real API failed, falling back to mock authentication:', error);
                return {
                    success: false,
                    error: {
                        status: 0,
                        message: error instanceof Error ? error.message : 'Failed to fetch user profile',
                    },
                };
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
        const token = TokenStorage.getToken();
        if (!token) {
            console.log("❌ No token found");
            return false;
        }

        // Check if token is expired
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            const isExpired = payload.exp < currentTime;

            if (isExpired) {
                console.warn("🕐 Token is expired, clearing tokens");
                TokenStorage.clearTokens();
                return false;
            }

            console.log("✅ Token is valid");
            return true;
        } catch (error) {
            console.warn("❌ Invalid token format, clearing tokens:", error);
            TokenStorage.clearTokens();
            return false;
        }
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

    /**
     * Map backend user data to frontend User type
     */
    static mapBackendUserToFrontend(backendUser: any): User {
        // Map user_status to UserRole
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
            isActive: true, // Assuming user is active if they can login
            createdAt: backendUser.created_at,
            updatedAt: backendUser.updated_at,
            pointBalance: backendUser.available_points,
            activeSuppliers: backendUser.active_supplier || [],
        };
    }

    /**
     * Create a fallback user object when user profile fetch fails
     */
    static createFallbackUser(username: string, token: string): User {
        // Try to decode JWT token to get user info
        let userId = username;
        let role = 'general_user' as UserRole;

        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            if (payload.sub) {
                userId = payload.sub;
            }
            // You can add more logic here to determine role from token if needed
            role = 'admin_user' as UserRole; // Default to admin for backend users
        } catch (error) {
            console.warn('Failed to decode JWT token:', error);
        }

        return {
            id: userId,
            username: username,
            email: `${username}@example.com`,
            role: role,
            isActive: true,
            createdAt: new Date().toISOString(),
            pointBalance: 1000,
        };
    }
}