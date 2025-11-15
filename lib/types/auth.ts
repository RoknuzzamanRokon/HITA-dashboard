/**
 * Authentication related types
 */

export interface LoginCredentials {
    username: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
    expires_in?: number;
    refresh_token?: string;
}

export interface User {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt?: string;
    pointBalance?: number;
    activeSuppliers?: string[];
}

export enum UserRole {
    SUPER_USER = "super_user",
    ADMIN_USER = "admin_user",
    USER = "user",
    GENERAL_USER = "general_user",
}

export interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}