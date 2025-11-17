/**
 * Export API client for hotel and mapping data exports
 */

import { apiClient } from './client';
import type { ApiResponse } from './client';
import type {
    ExportJobResponse,
    ExportJobStatus,
    HotelExportFilters,
    MappingExportFilters,
} from '@/lib/types/exports';

/**
 * Helper function to log errors in development mode
 */
const logError = (context: string, error: any) => {
    if (process.env.NODE_ENV === 'development') {
        console.error(`[ExportAPI] ${context}:`, error);
    }
};

/**
 * Helper function to create user-friendly error messages based on status codes
 */
const getErrorMessage = (status: number, defaultMessage: string, context: string): string => {
    switch (status) {
        case 401:
            return 'Your session has expired. Please log in again.';
        case 403:
            return "You don't have permission to perform this action.";
        case 404:
            return context === 'download'
                ? 'Export file not found or has expired.'
                : `${context} not found.`;
        case 500:
        case 502:
        case 503:
        case 504:
            return 'Server error occurred. Please try again later.';
        case 0:
            return 'Unable to connect to server. Please check your internet connection.';
        default:
            return defaultMessage;
    }
};

/**
 * Helper function to handle 401 errors by redirecting to login
 */
const handleAuthError = () => {
    if (typeof window !== 'undefined') {
        logError('Authentication', 'Session expired, redirecting to login');
        localStorage.removeItem('admin_auth_token');
        window.location.href = '/login';
    }
};

/**
 * Export API class for managing hotel and mapping data exports
 */
export class ExportAPI {
    /**
     * Create a hotel export job with specified filters
     * @param filters - Hotel export filter configuration
     * @returns Promise with export job response containing job_id
     */
    async createHotelExport(
        filters: HotelExportFilters
    ): Promise<ApiResponse<ExportJobResponse>> {
        try {
            logError('createHotelExport', `Creating hotel export with filters: ${JSON.stringify(filters)}`);

            const response = await apiClient.post<ExportJobResponse>(
                '/export/hotels',
                filters,
                true, // requiresAuth
                3 // retryCount with exponential backoff
            );

            if (response.success) {
                logError('createHotelExport', `Hotel export created successfully: ${response.data?.job_id}`);
                return response;
            }

            // Handle specific error cases
            const status = response.error?.status || 0;
            const originalMessage = response.error?.message || 'Failed to create hotel export';

            logError('createHotelExport', `Failed with status ${status}: ${originalMessage}`);

            // Handle 401 - redirect to login
            if (status === 401) {
                handleAuthError();
            }

            // Return user-friendly error message
            return {
                success: false,
                error: {
                    status,
                    message: getErrorMessage(status, originalMessage, 'Hotel export'),
                    details: response.error?.details,
                },
            };
        } catch (error) {
            logError('createHotelExport', error);

            // Handle unexpected errors
            return {
                success: false,
                error: {
                    status: 0,
                    message: error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred while creating the hotel export.',
                    details: error,
                },
            };
        }
    }

    /**
     * Create a mapping export job with specified filters
     * @param filters - Mapping export filter configuration
     * @returns Promise with export job response containing job_id
     */
    async createMappingExport(
        filters: MappingExportFilters
    ): Promise<ApiResponse<ExportJobResponse>> {
        try {
            logError('createMappingExport', `Creating mapping export with filters: ${JSON.stringify(filters)}`);

            const response = await apiClient.post<ExportJobResponse>(
                '/export/mappings',
                filters,
                true, // requiresAuth
                3 // retryCount with exponential backoff
            );

            if (response.success) {
                logError('createMappingExport', `Mapping export created successfully: ${response.data?.job_id}`);
                return response;
            }

            // Handle specific error cases
            const status = response.error?.status || 0;
            const originalMessage = response.error?.message || 'Failed to create mapping export';

            logError('createMappingExport', `Failed with status ${status}: ${originalMessage}`);

            // Handle 401 - redirect to login
            if (status === 401) {
                handleAuthError();
            }

            // Return user-friendly error message
            return {
                success: false,
                error: {
                    status,
                    message: getErrorMessage(status, originalMessage, 'Mapping export'),
                    details: response.error?.details,
                },
            };
        } catch (error) {
            logError('createMappingExport', error);

            // Handle unexpected errors
            return {
                success: false,
                error: {
                    status: 0,
                    message: error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred while creating the mapping export.',
                    details: error,
                },
            };
        }
    }

    /**
     * Get the current status of an export job
     * @param jobId - The unique job identifier (format: exp_XXXXXXXXXXXX)
     * @returns Promise with current job status including progress and records
     */
    async getExportStatus(jobId: string): Promise<ApiResponse<ExportJobStatus>> {
        try {
            logError('getExportStatus', `Fetching status for job: ${jobId}`);

            const response = await apiClient.get<ExportJobStatus>(
                `/export/status/${jobId}`,
                true, // requiresAuth
                3 // retryCount with exponential backoff
            );

            if (response.success) {
                logError('getExportStatus', `Job status retrieved: ${response.data?.status}`);
                return response;
            }

            // Handle specific error cases
            const status = response.error?.status || 0;
            const originalMessage = response.error?.message || 'Failed to fetch export status';

            logError('getExportStatus', `Failed with status ${status}: ${originalMessage}`);

            // Handle 401 - redirect to login
            if (status === 401) {
                handleAuthError();
            }

            // Handle 404 - invalid job ID
            if (status === 404) {
                return {
                    success: false,
                    error: {
                        status,
                        message: `Export job '${jobId}' not found. It may have expired or been deleted.`,
                        details: response.error?.details,
                    },
                };
            }

            // Return user-friendly error message
            return {
                success: false,
                error: {
                    status,
                    message: getErrorMessage(status, originalMessage, 'Export status'),
                    details: response.error?.details,
                },
            };
        } catch (error) {
            logError('getExportStatus', error);

            // Handle unexpected errors
            return {
                success: false,
                error: {
                    status: 0,
                    message: error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred while fetching export status.',
                    details: error,
                },
            };
        }
    }

    /**
     * Download a completed export file with retry logic
     * @param jobId - The unique job identifier for the completed export
     * @returns Promise with file Blob for download
     * @throws Error with user-friendly message on failure
     */
    async downloadExport(jobId: string): Promise<Blob> {
        return this.downloadExportWithRetry(jobId, 3);
    }

    /**
     * Internal method to download export with retry logic and exponential backoff
     * @param jobId - The unique job identifier for the completed export
     * @param retriesLeft - Number of retry attempts remaining
     * @param retryDelay - Delay in milliseconds before retry (default: 1000ms)
     * @returns Promise with file Blob for download
     * @throws Error with user-friendly message on failure
     */
    private async downloadExportWithRetry(
        jobId: string,
        retriesLeft: number,
        retryDelay: number = 1000
    ): Promise<Blob> {
        try {
            logError('downloadExport', `Downloading export file for job: ${jobId} (retries left: ${retriesLeft})`);

            // Get authentication token
            const token = typeof localStorage !== 'undefined'
                ? localStorage.getItem('admin_auth_token')
                : null;

            if (!token) {
                const error = new Error('Your session has expired. Please log in again.');
                logError('downloadExport', 'Authentication token not found');

                // Redirect to login on auth error
                handleAuthError();
                throw error;
            }

            // Construct the download URL
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001';
            const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v1.0';
            const downloadUrl = `${baseUrl}/${apiVersion}/export/download/${jobId}`;

            logError('downloadExport', `Fetching from: ${downloadUrl}`);

            // Make the download request
            const response = await fetch(downloadUrl, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
                mode: 'cors',
                credentials: 'omit',
            });

            if (!response.ok) {
                // Try to parse error message from response
                let errorMessage = `Download failed with status ${response.status}`;

                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || errorData.error || errorMessage;
                } catch {
                    errorMessage = response.statusText || errorMessage;
                }

                logError('downloadExport', `Download failed with status ${response.status}: ${errorMessage}`);

                // Handle specific error cases
                if (response.status === 401) {
                    handleAuthError();
                    throw new Error('Your session has expired. Please log in again.');
                }

                if (response.status === 403) {
                    throw new Error("You don't have permission to download this export.");
                }

                if (response.status === 404) {
                    throw new Error(`Export file for job '${jobId}' not found or has expired.`);
                }

                // Retry on server errors (5xx) if retries are available
                if (response.status >= 500 && retriesLeft > 0) {
                    logError('downloadExport', `Server error, retrying in ${retryDelay}ms...`);
                    await this.delay(retryDelay);
                    return this.downloadExportWithRetry(jobId, retriesLeft - 1, retryDelay * 1.5);
                }

                if (response.status >= 500) {
                    throw new Error('Server error occurred while downloading. Please try again later.');
                }

                throw new Error(getErrorMessage(response.status, errorMessage, 'download'));
            }

            // Get the blob from response
            const blob = await response.blob();
            logError('downloadExport', `Export file downloaded successfully (${blob.size} bytes)`);

            return blob;
        } catch (error) {
            logError('downloadExport', error);

            // Check if this is a network error and retry if possible
            if (error instanceof TypeError && error.message.includes('fetch') && retriesLeft > 0) {
                logError('downloadExport', `Network error, retrying in ${retryDelay}ms...`);
                await this.delay(retryDelay);
                return this.downloadExportWithRetry(jobId, retriesLeft - 1, retryDelay * 1.5);
            }

            // Re-throw the error if it's already a user-friendly Error
            if (error instanceof Error) {
                throw error;
            }

            // Fallback for unexpected errors
            throw new Error('An unexpected error occurred while downloading the export file. Please try again.');
        }
    }

    /**
     * Delay helper for retry logic with exponential backoff
     * @param ms - Milliseconds to delay
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance for use throughout the application
export const exportAPI = new ExportAPI();
export default exportAPI;
