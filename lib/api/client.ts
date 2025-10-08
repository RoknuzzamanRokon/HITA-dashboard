/**
 * Centralized API client with authentication handling
 */

import { config } from '@/lib/config';
import { TokenStorage } from '@/lib/auth/token-storage';
import type { ApiResponse, ApiError, RequestConfig } from '@/lib/types/api';

export class ApiClient {
    private static instance: ApiClient;
    private baseUrl: string;
    private isRefreshing = false;
    private refreshPromise: Promise<string | null> | null = null;

    private constructor() {
        this.baseUrl = config.api.url;
    }

    /**
     * Get singleton instance
     */
    static getInstance(): ApiClient {
        if (!ApiClient.instance) {
            ApiClient.instance = new ApiClient();
        }
        return ApiClient.instance;
    }

    /**
     * Make HTTP request with automatic token handling
     */
    async request<T = any>(
        endpoint: string,
        options: RequestConfig = {}
    ): Promise<ApiResponse<T>> {
        const {
            method = 'GET',
            headers = {},
            body,
            requiresAuth = true,
        } = options;

        try {
            // Prepare request headers
            const requestHeaders: Record<string, string> = {
                'Content-Type': 'application/json',
                ...headers,
            };

            // Add authentication header if required
            if (requiresAuth) {
                const token = await this.getValidToken();
                if (token) {
                    requestHeaders.Authorization = `Bearer ${token}`;
                }
            }

            // Prepare request configuration
            const requestConfig: RequestInit = {
                method,
                headers: requestHeaders,
                mode: 'cors',
                credentials: 'omit',
            };

            // Add body for non-GET requests
            if (body && method !== 'GET') {
                if (body instanceof FormData) {
                    // Remove Content-Type for FormData (browser will set it with boundary)
                    delete requestHeaders['Content-Type'];
                    requestConfig.body = body;
                } else if (typeof body === 'string' && requestHeaders['Content-Type'] === 'application/x-www-form-urlencoded') {
                    // Handle URL-encoded form data
                    requestConfig.body = body;
                } else {
                    requestConfig.body = JSON.stringify(body);
                }
            }

            // Make the request
            const response = await fetch(`${this.baseUrl}${endpoint}`, requestConfig);

            // Handle response
            return await this.handleResponse<T>(response);
        } catch (error) {
            console.error('API request failed:', error);

            // Check if it's a network error (likely CORS)
            if (error instanceof TypeError && error.message.includes('fetch')) {
                return {
                    success: false,
                    error: {
                        status: 0,
                        message: 'Unable to connect to the API server. This might be a CORS issue. Please ensure your backend allows requests from localhost:3002',
                    },
                };
            }

            return {
                success: false,
                error: {
                    status: 0,
                    message: error instanceof Error ? error.message : 'Network error',
                },
            };
        }
    }

    /**
     * Handle API response and errors
     */
    private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
        try {
            // Check if response is ok
            if (!response.ok) {
                const errorData = await this.parseErrorResponse(response);
                return {
                    success: false,
                    error: {
                        status: response.status,
                        message: errorData.message || response.statusText,
                        details: errorData.details,
                    },
                };
            }

            // Parse successful response
            const data = await response.json();
            return {
                success: true,
                data,
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    status: response.status,
                    message: 'Failed to parse response',
                    details: error,
                },
            };
        }
    }

    /**
     * Parse error response
     */
    private async parseErrorResponse(response: Response): Promise<{
        message: string;
        details?: any;
    }> {
        try {
            const errorData = await response.json();
            return {
                message: errorData.detail || errorData.message || 'An error occurred',
                details: errorData,
            };
        } catch {
            return {
                message: response.statusText || 'An error occurred',
            };
        }
    }

    /**
     * Get valid token with automatic refresh
     */
    private async getValidToken(): Promise<string | null> {
        const token = TokenStorage.getToken();

        if (!token) {
            return null;
        }

        // Check if token is expired (basic check)
        if (this.isTokenExpired(token)) {
            return await this.refreshToken();
        }

        return token;
    }

    /**
     * Check if token is expired (basic implementation)
     */
    private isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Math.floor(Date.now() / 1000);
            const isExpired = payload.exp < currentTime;

            if (isExpired) {
                console.warn("🕐 Token is expired, exp:", payload.exp, "current:", currentTime);
            }

            return isExpired;
        } catch (error) {
            console.warn("❌ Failed to parse token, considering it expired:", error);
            // If we can't parse the token, consider it expired
            return true;
        }
    }

    /**
     * Refresh authentication token
     */
    private async refreshToken(): Promise<string | null> {
        // Prevent multiple simultaneous refresh attempts
        if (this.isRefreshing && this.refreshPromise) {
            return await this.refreshPromise;
        }

        this.isRefreshing = true;
        this.refreshPromise = this.performTokenRefresh();

        try {
            const newToken = await this.refreshPromise;
            return newToken;
        } finally {
            this.isRefreshing = false;
            this.refreshPromise = null;
        }
    }

    /**
     * Perform actual token refresh
     */
    private async performTokenRefresh(): Promise<string | null> {
        const refreshToken = TokenStorage.getRefreshToken();

        if (!refreshToken) {
            this.handleAuthenticationFailure();
            return null;
        }

        try {
            const response = await fetch(`${this.baseUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Token refresh failed');
            }

            const data = await response.json();
            const newToken = data.access_token;

            if (newToken) {
                TokenStorage.setToken(newToken);
                if (data.refresh_token) {
                    TokenStorage.setRefreshToken(data.refresh_token);
                }
                return newToken;
            }

            throw new Error('No token in refresh response');
        } catch (error) {
            console.error('Token refresh failed:', error);
            this.handleAuthenticationFailure();
            return null;
        }
    }

    /**
     * Handle authentication failure
     */
    private handleAuthenticationFailure(): void {
        console.warn("🚨 Authentication failure detected, clearing tokens and redirecting");
        TokenStorage.clearTokens();

        // Redirect to login page if we're on the client
        if (typeof window !== 'undefined') {
            // Add a small delay to ensure token clearing is complete
            setTimeout(() => {
                window.location.href = '/login';
            }, 100);
        }
    }

    /**
     * Convenience methods for different HTTP methods
     */
    async get<T = any>(endpoint: string, requiresAuth = true): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET', requiresAuth });
    }

    async post<T = any>(
        endpoint: string,
        body?: any,
        requiresAuth = true
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'POST', body, requiresAuth });
    }

    async put<T = any>(
        endpoint: string,
        body?: any,
        requiresAuth = true
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth });
    }

    async patch<T = any>(
        endpoint: string,
        body?: any,
        requiresAuth = true
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'PATCH', body, requiresAuth });
    }

    async delete<T = any>(
        endpoint: string,
        requiresAuth = true
    ): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
    }

    /**
     * Health check endpoint
     */
    async healthCheck(): Promise<ApiResponse<{ status: string }>> {
        try {
            return await this.request<{ status: string }>('/health', {
                method: 'GET',
                requiresAuth: false
            });
        } catch (error) {
            // Fall back to mock health check
            const { MockAuthService } = await import('./mock-auth');
            return MockAuthService.healthCheck();
        }
    }
}

// Export singleton instance
export const apiClient = ApiClient.getInstance();