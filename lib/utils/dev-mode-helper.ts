/**
 * Development Mode Helper
 * Utilities for handling development-specific scenarios
 */

export const isDevelopmentMode = () => {
    return process.env.NODE_ENV === 'development';
};

export const isBackendExpected = () => {
    // In development, backend might not always be running
    // In production, we expect it to be available
    return process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_EXPECT_BACKEND === 'true';
};

export const shouldLogApiErrors = () => {
    // Only log API errors if we expect the backend to be running
    return isBackendExpected();
};

export const getApiErrorMessage = (status: number, defaultMessage: string) => {
    if (!isBackendExpected() && (status === 404 || status === 0)) {
        return 'Backend API not available (this is normal in development mode)';
    }
    return defaultMessage;
};