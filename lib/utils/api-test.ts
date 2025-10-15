/**
 * API Testing Utilities
 * Helper functions to test API connectivity
 */

import { config } from "@/lib/config";
import { TokenStorage } from "@/lib/auth/token-storage";

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
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ API Response:', data);
        return data;
    } catch (error) {
        console.error('❌ API Test failed:', error);
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
        return true;
    } catch (error) {
        return false;
    }
};