/**
 * Environment configuration for the Admin Management Panel
 */

export const config = {
    // API Configuration
    api: {
        baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001',
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
    useMockAuth: process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true',
} as const;

// API Endpoints
export const apiEndpoints = {
    // Authentication
    auth: {
        login: '/auth/token',
        register: '/auth/register',
        refresh: '/auth/refresh-token',
    },

    // User Management
    users: {
        list: '/user',
        create: '/user',
        update: (id: string) => `/user/${id}`,
        delete: (id: string) => `/user/${id}`,
        profile: '/user/check-me',
        points: '/user/points-check',
        pointsHistory: '/user/points-check',
        checkActiveSupplier: '/user/check-active-my-supplier',
        // Dashboard statistics
        dashboardStats: '/dashboard/stats',
        supplierFreshness: '/dashboard/supplier-freshness',
        // Specific user creation endpoints
        createSuperUser: '/user/create_super_user/',
        createAdminUser: '/user/create_admin_user/',
        createGeneralUser: '/user/create_general_user/',
        // Admin endpoints
        getAllUsers: '/user/list',
        getUserInfo: (id: string) => `/user/check-user-info/${id}/`,
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

    // User Edit Management
    userEdit: {
        getUserDetails: (userId: string) => `/user/check-user-info/${userId}`,
        allocatePoints: '/user/points/give/',
        activateSuppliers: (userId: string) => `/permissions/admin/activate_supplier?user_id=${userId}`,
        deactivateSuppliers: (userId: string) => `/permissions/admin/deactivate_supplier?user_id=${userId}`,
        activateUser: (userId: string) => `/auth/admin/users/${userId}/activate`,
        resetPoints: (userId: string) => `/user/reset_point/${userId}/`,
        deleteUser: (userId: string) => `/delete/delete_user/${userId}`,
        generateApiKey: (userId: string) => `/auth/generate_api_key/${userId}`,
    },

    // Export Management
    exports: {
        hotels: '/export/hotels',
        mappings: '/export/mappings',
        status: (jobId: string) => `/export/status/${jobId}`,
        download: (jobId: string) => `/export/download/${jobId}`,
    },

    // Additional endpoints
    mapping: '/mapping',
    delete: '/delete',
} as const;