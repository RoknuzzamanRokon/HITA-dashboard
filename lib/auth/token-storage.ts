/**
 * Token storage utilities for secure token management
 */

import { config } from '@/lib/config';

export class TokenStorage {
    private static isClient = typeof window !== 'undefined';

    /**
     * Store authentication token
     * @param token - The authentication token to store
     * @param rememberMe - If true, store in localStorage (persistent). If false, store in sessionStorage (session-only)
     */
    static setToken(token: string, rememberMe: boolean = true): void {
        if (!this.isClient) return;

        try {
            if (rememberMe) {
                // Store in localStorage for persistent sessions
                localStorage.setItem(config.auth.tokenKey, token);
                // Also store in sessionStorage as backup
                sessionStorage.setItem(config.auth.tokenKey, token);
            } else {
                // Store only in sessionStorage for session-only sessions
                sessionStorage.setItem(config.auth.tokenKey, token);
                // Remove from localStorage if it exists
                localStorage.removeItem(config.auth.tokenKey);
            }
        } catch (error) {
            console.error('Failed to store token:', error);
        }
    }

    /**
     * Retrieve authentication token
     */
    static getToken(): string | null {
        if (!this.isClient) return null;

        try {
            // Try localStorage first, then sessionStorage as fallback
            let token = localStorage.getItem(config.auth.tokenKey);
            if (!token) {
                token = sessionStorage.getItem(config.auth.tokenKey);
                // If found in sessionStorage, restore to localStorage
                if (token) {
                    localStorage.setItem(config.auth.tokenKey, token);
                }
            }
            return token;
        } catch (error) {
            console.error('Failed to retrieve token:', error);
            return null;
        }
    }

    /**
     * Store refresh token
     * @param refreshToken - The refresh token to store
     * @param rememberMe - If true, store in localStorage (persistent). If false, store in sessionStorage (session-only)
     */
    static setRefreshToken(refreshToken: string, rememberMe: boolean = true): void {
        if (!this.isClient) return;

        try {
            if (rememberMe) {
                // Store in localStorage for persistent sessions
                localStorage.setItem(config.auth.refreshTokenKey, refreshToken);
                // Also store in sessionStorage as backup
                sessionStorage.setItem(config.auth.refreshTokenKey, refreshToken);
            } else {
                // Store only in sessionStorage for session-only sessions
                sessionStorage.setItem(config.auth.refreshTokenKey, refreshToken);
                // Remove from localStorage if it exists
                localStorage.removeItem(config.auth.refreshTokenKey);
            }
        } catch (error) {
            console.error('Failed to store refresh token:', error);
        }
    }

    /**
     * Retrieve refresh token
     */
    static getRefreshToken(): string | null {
        if (!this.isClient) return null;

        try {
            // Try localStorage first, then sessionStorage as fallback
            let refreshToken = localStorage.getItem(config.auth.refreshTokenKey);
            if (!refreshToken) {
                refreshToken = sessionStorage.getItem(config.auth.refreshTokenKey);
                // If found in sessionStorage, restore to localStorage
                if (refreshToken) {
                    localStorage.setItem(config.auth.refreshTokenKey, refreshToken);
                }
            }
            return refreshToken;
        } catch (error) {
            console.error('Failed to retrieve refresh token:', error);
            return null;
        }
    }

    /**
     * Remove all stored tokens
     */
    static clearTokens(): void {
        if (!this.isClient) return;

        try {
            localStorage.removeItem(config.auth.tokenKey);
            localStorage.removeItem(config.auth.refreshTokenKey);
            sessionStorage.removeItem(config.auth.tokenKey);
            sessionStorage.removeItem(config.auth.refreshTokenKey);
        } catch (error) {
            console.error('Failed to clear tokens:', error);
        }
    }

    /**
     * Check if token exists
     */
    static hasToken(): boolean {
        return !!this.getToken();
    }
}