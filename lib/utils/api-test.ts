/**
 * API Testing Utilities
 * Helper functions to test API connectivity
 */

import { config } from "../config";
import { TokenStorage } from "../auth/token-storage";
import { shouldLogApiErrors, getApiErrorMessage } from "./dev-mode-helper";

export const testDashboardStatsAPI = async () => {
    const url = `${config.api.url}/users/dashboard/statistics`;
    console.log('🧪 Testing API endpoint:', url);

    // Get authentication token
    const token = TokenStorage.getToken();
    console.log('🔐 Using token:', token ? `${token.substring(0, 20)}...` : 'None');

    try {
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        // Add authentication header if token exists
        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers,
            mode: 'cors',
        });

        console.log('📡 Response status:', response.status);
        console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            // Provide more specific error messages based on status code
            let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

            switch (response.status) {
                case 404:
                    errorMessage = getApiErrorMessage(404, `API endpoint not found (404). The backend server may not be running or the endpoint doesn't exist.`);
                    break;
                case 401:
                    errorMessage = `Authentication required (401). Please log in again.`;
                    break;
                case 403:
                    errorMessage = `Access forbidden (403). You don't have permission to access this resource.`;
                    break;
                case 500:
                    errorMessage = `Server error (500). The backend server encountered an internal error.`;
                    break;
                case 0:
                    errorMessage = getApiErrorMessage(0, `Network error. Cannot connect to the backend server. Please check if the server is running.`);
                    break;
            }

            // Only log as error if we expect the backend to be running
            if (shouldLogApiErrors()) {
                console.error('❌ API Error:', errorMessage);
            } else {
                console.log('ℹ️ API Info:', errorMessage);
            }

            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('✅ API Response:', data);
        return data;
    } catch (error) {
        // Only log as error if we expect the backend to be running
        if (shouldLogApiErrors()) {
            console.error('❌ API Test failed:', error);
        } else {
            console.log('ℹ️ API Test info:', error instanceof Error ? error.message : error);
        }

        // Handle network errors more gracefully
        if (error instanceof TypeError && error.message.includes('fetch')) {
            throw new Error(getApiErrorMessage(0, 'Network error: Cannot connect to the backend server. Please ensure the server is running and accessible.'));
        }

        throw error;
    }
};

export const testAPIConnectivity = async () => {
    console.log('🔍 Testing API connectivity...');
    console.log('🌐 Base URL:', config.api.baseUrl);
    console.log('📝 Version:', config.api.version);
    console.log('🔗 Full URL:', config.api.url);

    try {
        await testDashboardStatsAPI();
        console.log('✅ API connectivity test passed');
        return true;
    } catch (error) {
        console.log('ℹ️ API connectivity test failed - this is normal if backend is not running');
        console.log('💡 To test API connectivity manually, use the "Test API" button in the dashboard');
        return false;
    }
};