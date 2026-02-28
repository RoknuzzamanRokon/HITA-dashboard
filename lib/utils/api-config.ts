/**
 * API Configuration Utility
 * Centralized API URL configuration for consistent backend API calls
 */

export const API_CONFIG = {
    /**
     * Get the backend API base URL from environment variables
     * Falls back to localhost for development
     */
    getBaseUrl: (): string => {
        return process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001";
    },

    /**
     * Get the API version from environment variables
     * Falls back to v1.0
     */
    getVersion: (): string => {
        return process.env.NEXT_PUBLIC_API_VERSION || "v1.0";
    },

    /**
     * Get the full API URL (base + version)
     */
    getFullUrl: (): string => {
        return `${API_CONFIG.getBaseUrl()}/${API_CONFIG.getVersion()}`;
    },

    /**
     * Build a complete API endpoint URL
     * @param endpoint - The API endpoint path (e.g., "/user/check-me")
     * @returns Complete URL with base, version, and endpoint
     */
    buildUrl: (endpoint: string): string => {
        // Remove leading slash if present
        const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
        return `${API_CONFIG.getFullUrl()}/${cleanEndpoint}`;
    },
};
