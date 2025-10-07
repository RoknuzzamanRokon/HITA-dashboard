/**
 * Token storage utilities for secure token management
 */

import { config } from '@/lib/config';

export class TokenStorage {
    private static isClient = typeof window !== 'undefined';

    /**
     * Store authentication token
     */
    static setToken(token: string): void {
        if (!this.isClient) return;

        try {
            localStorage.setItem(config.auth.tokenKey, token);
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
            return localStorage.getItem(config.auth.tokenKey);
        } catch (error) {
            console.error('Failed to retrieve token:', error);
            return null;
        }
    }

    /**
     * Store refresh token
     */
    static setRefreshToken(refreshToken: string): void {
        if (!this.isClient) return;

        try {
            localStorage.setItem(config.auth.refreshTokenKey, refreshToken);
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
            return localStorage.getItem(config.auth.refreshTokenKey);
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