/**
 * Environment configuration for the Admin Management Panel
 */

export const config = {
    // API Configuration
    api: {
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8002',
        version: process.env.NEXT_PUBLIC_API_VERSION || 'v1.0',
        get url() {
            return `${this.baseUrl}/${this.version}`;
        },
    },

    // Authentication Configuration
    auth: {
        tokenKey: process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || 'admin_auth_token',
        refreshTokenKey: process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || 'admin_refresh_token',
        enableRegistration: process.env.NEXT_PUBLIC_ENABLE_REGISTRATION === 'true' || false,
    },

    // Application Configuration
    app: {
        name: process.env.NEXT_PUBLIC_APP_NAME || 'Management Panel',
        version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    },

    // Environment
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',

    // Mock mode for development when backend is not available
    useMockAuth: process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true' || false,
} as const;

// API Endpoints
export const apiEndpoints = {
    // Authentication
    auth: {
        login: '/auth/token',
        register: '/auth/register',
        refresh: '/auth/refresh',
    },

    // User Management
    users: {
        list: '/user',
        create: '/user',
        update: (id: string) => `/user/${id}`,
        delete: (id: string) => `/user/${id}`,
        profile: '/user/me/',
        points: '/user/points',
        pointsHistory: '/user/points/check/me/',
        // Dashboard statistics
        dashboardStats: '/dashboard/stats',
        // Specific user creation endpoints
        createSuperUser: '/user/create_super_user/',
        createAdminUser: '/user/create_admin_user/',
        createGeneralUser: '/user/create_general_user/',
        // Admin endpoints
        getAllUsers: '/user/list',
        getUserInfo: (id: string) => `/user/check/user_info/${id}/`,
        // Delete endpoints
        deleteSuperUser: (id: string) => `/delete/delete_super_user/${id}/`,
        deleteUser: (id: string) => `/delete/delete_user/${id}/`,
    },

    // Hotel Content
    content: {
        hotels: '/content/hotels',
        search: '/content/search',
        providers: '/content/providers',
        export: '/content/export',
    },

    // Permissions
    permissions: {
        list: '/permissions',
        assign: '/permissions/assign',
        revoke: '/permissions/revoke',
    },

    // Additional endpoints
    mapping: '/mapping',
    delete: '/delete',
} as const;