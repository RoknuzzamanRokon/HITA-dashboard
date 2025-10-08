/**
 * Mock Authentication Service
 * Provides mock authentication for development/demo purposes
 */

import type { LoginCredentials, AuthResponse, User } from '@/lib/types/auth';
import type { ApiResponse } from '@/lib/types/api';
import { UserRole } from '@/lib/types/auth';

// Mock users database
const MOCK_USERS: User[] = [
    {
        id: '1',
        username: 'admin',
        email: 'admin@example.com',
        role: UserRole.SUPER_USER,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        pointBalance: 1000,
    },
    {
        id: '2',
        username: 'manager',
        email: 'manager@example.com',
        role: UserRole.ADMIN_USER,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        pointBalance: 500,
    },
    {
        id: '3',
        username: 'user',
        email: 'user@example.com',
        role: UserRole.GENERAL_USER,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        pointBalance: 100,
    },
    {
        id: '4',
        username: 'demo',
        email: 'demo@example.com',
        role: UserRole.ADMIN_USER,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        pointBalance: 750,
    },
    {
        id: '5',
        username: 'ursamroko',
        email: 'ursamroko@example.com',
        role: UserRole.SUPER_USER,
        isActive: true,
        createdAt: '2024-01-01T00:00:00Z',
        pointBalance: 2000,
    }
];

// Mock delay to simulate network request
const mockDelay = (ms: number = 1000) => new Promise(resolve => setTimeout(resolve, ms));

export class MockAuthService {
    private static currentUser: User | null = null;
    private static token: string | null = null;

    /**
     * Mock login - accepts any valid username/password combination
     */
    static async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
        await mockDelay(1500); // Simulate network delay

        // Find user by username
        const user = MOCK_USERS.find(u => u.username === credentials.username);

        if (!user) {
            return {
                success: false,
                error: {
                    status: 401,
                    message: 'Invalid username or password',
                },
            };
        }

        // For demo purposes, accept any password that's at least 3 characters
        if (credentials.password.length < 3) {
            return {
                success: false,
                error: {
                    status: 401,
                    message: 'Invalid username or password',
                },
            };
        }

        // Generate mock token
        const token = `mock_token_${user.id}_${Date.now()}`;
        this.token = token;
        this.currentUser = user;

        return {
            success: true,
            data: {
                access_token: token,
                token_type: 'Bearer',
                expires_in: 3600,
            },
        };
    }

    /**
     * Mock get current user
     */
    static async getCurrentUser(): Promise<ApiResponse<User>> {
        await mockDelay(500);

        if (!this.token || !this.currentUser) {
            return {
                success: false,
                error: {
                    status: 401,
                    message: 'Not authenticated',
                },
            };
        }

        return {
            success: true,
            data: this.currentUser,
        };
    }

    /**
     * Mock logout
     */
    static async logout(): Promise<void> {
        await mockDelay(300);
        this.token = null;
        this.currentUser = null;
    }

    /**
     * Check if authenticated
     */
    static isAuthenticated(): boolean {
        return !!this.token;
    }

    /**
     * Get token
     */
    static getToken(): string | null {
        return this.token;
    }

    /**
     * Mock health check
     */
    static async healthCheck(): Promise<ApiResponse<{ status: string }>> {
        await mockDelay(200);
        return {
            success: true,
            data: {
                status: 'Mock API is running',
            },
        };
    }
}