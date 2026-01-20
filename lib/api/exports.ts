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
 * Requirement 6.1: Detect network errors and show user-friendly error messages
 * Requirement 6.4: Show "Permission denied" notification and suggest contacting administrator
 */
const getErrorMessage = (status: number, defaultMessage: string, context: string): string => {
    switch (status) {
        case 401:
            return 'Your session has expired. Please log in again.';
        case 403:
            // Permission error - suggest contacting administrator (Requirement 6.4)
            return "You don't have permission to perform this action. Please contact your administrator for access.";
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
            // Network error - user-friendly message (Requirement 6.1)
            return 'Unable to connect to server. Please check your internet connection and try again.';
        default:
            return defaultMessage;
    }
};

/**
 * Helper function to handle 401 errors by redirecting to login
 * Requirement 6.3: Detect 401 errors, clear auth token, redirect to login, show "Session expired" message
 */
const handleAuthError = () => {
    if (typeof window !== 'undefined') {
        logError('Authentication', 'Session expired, redirecting to login');
        // Clear auth token from localStorage (Requirement 6.3)
        localStorage.removeItem('admin_auth_token');

        // Store session expired message to show on login page (Requirement 6.3)
        sessionStorage.setItem('auth_error_message', 'Your session has expired. Please log in again.');

        // Redirect to login page (Requirement 6.3)
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
            console.log('🔍 Original hotel filters (nested):', JSON.stringify(filters, null, 2));

            // Clean the payload - convert empty date strings to null
            const cleanedFilters: HotelExportFilters = {
                filters: {
                    suppliers: filters.filters.suppliers,
                    country_codes: filters.filters.country_codes,
                    min_rating: filters.filters.min_rating,
                    max_rating: filters.filters.max_rating,
                    date_from: filters.filters.date_from && filters.filters.date_from.trim() !== '' ? filters.filters.date_from : null,
                    date_to: filters.filters.date_to && filters.filters.date_to.trim() !== '' ? filters.filters.date_to : null,
                    ittids: filters.filters.ittids,
                    property_types: filters.filters.property_types,
                },
                format: filters.format,
                include_locations: filters.include_locations,
                include_contacts: filters.include_contacts,
                include_mappings: filters.include_mappings,
            };

            console.log('🔍 Cleaned hotel payload:', JSON.stringify(cleanedFilters, null, 2));
            console.log('[ExportAPI] createHotelExport: Creating hotel export with payload:', JSON.stringify(cleanedFilters));

            const response = await apiClient.post<ExportJobResponse>(
                '/export/hotels',
                cleanedFilters,  // Send cleaned structure
                true, // requiresAuth
                3 // retryCount with exponential backoff
            );

            if (response.success) {
                console.log('[ExportAPI] createHotelExport: Hotel export created successfully:', response.data?.job_id);
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
            console.log('🔍 Original filters (nested):', JSON.stringify(filters, null, 2));

            // Backend expects nested structure: { filters: { ... }, format: "json" }
            // But dates must be valid or omitted (not empty strings)
            const cleanedFilters: any = {
                filters: {
                    suppliers: filters.filters.suppliers,
                    ittids: filters.filters.ittids,
                    max_records: filters.filters.max_records,
                },
                format: filters.format,
            };

            // Only include dates if they have valid values (not empty strings)
            if (filters.filters.date_from && filters.filters.date_from.trim() !== '') {
                cleanedFilters.filters.date_from = filters.filters.date_from;
            }
            if (filters.filters.date_to && filters.filters.date_to.trim() !== '') {
                cleanedFilters.filters.date_to = filters.filters.date_to;
            }

            console.log('🔍 Cleaned payload (dates omitted if empty):', JSON.stringify(cleanedFilters, null, 2));
            console.log('[ExportAPI] createMappingExport: Creating mapping export with payload:', JSON.stringify(cleanedFilters));

            const response = await apiClient.post<ExportJobResponse>(
                '/export/mappings',
                cleanedFilters,  // Send cleaned structure
                true, // requiresAuth
                3 // retryCount with exponential backoff
            );

            if (response.success) {
                console.log('[ExportAPI] createMappingExport: Mapping export created successfully:', response.data?.job_id);
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
            console.log('[ExportAPI] getExportStatus: Fetching status for job:', jobId);

            const response = await apiClient.get<ExportJobStatus>(
                `/export/status/${jobId}`,
                true, // requiresAuth
                3 // retryCount with exponential backoff
            );

            if (response.success) {
                console.log('[ExportAPI] getExportStatus: Job status retrieved:', response.data?.status);
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
            console.log(`📥 Downloading export file for job: ${jobId}`);

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

            // Get API key for general users
            const apiKey = typeof localStorage !== 'undefined'
                ? localStorage.getItem('user_api_key')
                : null;

            // Construct the download URL
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001';
            const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v1.0';
            const downloadUrl = `${baseUrl}/${apiVersion}/export/download/${jobId}`;

            console.log(`🌐 Fetching from: ${downloadUrl}`);

            // Prepare headers
            const headers: Record<string, string> = {
                'Authorization': `Bearer ${token}`,
            };

            // Add API key header if available (required for general users)
            if (apiKey) {
                headers['X-API-Key'] = apiKey;
                console.log('✅ API Key added to download request');
            } else {
                console.log('ℹ️ No API key found (admin/super admin user)');
            }

            // Make the download request
            const response = await fetch(downloadUrl, {
                method: 'GET',
                headers,
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

            // Check content type to handle both blob and JSON responses
            const contentType = response.headers.get('content-type') || '';

            let blob: Blob;

            if (contentType.includes('application/json')) {
                // Backend returned JSON data - convert to blob
                console.log('📄 Backend returned JSON data, converting to blob...');
                const jsonData = await response.json();
                const jsonString = JSON.stringify(jsonData, null, 2);
                blob = new Blob([jsonString], { type: 'application/json' });
            } else {
                // Backend returned blob directly
                blob = await response.blob();
            }

            console.log(`✅ Export file downloaded successfully (${blob.size} bytes)`);

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

    /**
     * Get all export jobs for the authenticated user
     * @param filters - Optional filters for jobs (status, export_type, etc.)
     * @returns Promise with list of export jobs
     */
    async getExportJobs(filters?: {
        status?: string;
        export_type?: string;
        limit?: number;
        offset?: number;
    }): Promise<ApiResponse<{ jobs: any[]; total: number }>> {
        try {
            // Build query string from filters
            const queryParams = new URLSearchParams();
            if (filters?.status) queryParams.append('status', filters.status);
            if (filters?.export_type) queryParams.append('export_type', filters.export_type);
            if (filters?.limit) queryParams.append('limit', filters.limit.toString());
            if (filters?.offset) queryParams.append('offset', filters.offset.toString());

            const queryString = queryParams.toString();
            const endpoint = `/export/jobs${queryString ? `?${queryString}` : ''}`;

            console.log('🔍 Fetching export jobs from:', endpoint);

            const response = await apiClient.get<{ jobs: any[]; total: number }>(
                endpoint,
                true, // requiresAuth
                3 // retryCount
            );

            if (response.success) {
                console.log(`✅ Fetched ${response.data?.jobs.length || 0} export jobs`);
                return response;
            }

            // Handle errors
            const status = response.error?.status || 0;
            const originalMessage = response.error?.message || 'Failed to fetch export jobs';

            if (status === 401) {
                handleAuthError();
            }

            return {
                success: false,
                error: {
                    status,
                    message: getErrorMessage(status, originalMessage, 'Export jobs'),
                    details: response.error?.details,
                },
            };
        } catch (error) {
            console.error('Error fetching export jobs:', error);
            return {
                success: false,
                error: {
                    status: 0,
                    message: error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred while fetching export jobs.',
                    details: error,
                },
            };
        }
    }

    /**
     * Delete a specific export job
     * @param jobId - The unique job identifier
     * @returns Promise with success confirmation
     */
    async deleteExportJob(jobId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
        try {
            console.log('🗑️ Deleting export job:', jobId);

            const response = await apiClient.delete<{ success: boolean; message: string }>(
                `/export/jobs/${jobId}`,
                true, // requiresAuth
                2 // retryCount
            );

            if (response.success) {
                console.log(`✅ Export job deleted: ${jobId}`);
                return response;
            }

            // Handle errors
            const status = response.error?.status || 0;
            const originalMessage = response.error?.message || 'Failed to delete export job';

            if (status === 401) {
                handleAuthError();
            }

            return {
                success: false,
                error: {
                    status,
                    message: getErrorMessage(status, originalMessage, 'Delete job'),
                    details: response.error?.details,
                },
            };
        } catch (error) {
            console.error('Error deleting export job:', error);
            return {
                success: false,
                error: {
                    status: 0,
                    message: error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred while deleting the export job.',
                    details: error,
                },
            };
        }
    }

    /**
     * Clear all completed export jobs
     * @returns Promise with number of jobs deleted
     */
    async clearCompletedJobs(): Promise<ApiResponse<{ success: boolean; deleted_count: number }>> {
        try {
            console.log('🗑️ Clearing completed export jobs');

            const response = await apiClient.delete<{ success: boolean; deleted_count: number }>(
                '/export/jobs/completed',
                true, // requiresAuth
                2 // retryCount
            );

            if (response.success) {
                console.log(`✅ Cleared ${response.data?.deleted_count || 0} completed jobs`);
                return response;
            }

            // Handle errors
            const status = response.error?.status || 0;
            const originalMessage = response.error?.message || 'Failed to clear completed jobs';

            if (status === 401) {
                handleAuthError();
            }

            return {
                success: false,
                error: {
                    status,
                    message: getErrorMessage(status, originalMessage, 'Clear completed jobs'),
                    details: response.error?.details,
                },
            };
        } catch (error) {
            console.error('Error clearing completed jobs:', error);
            return {
                success: false,
                error: {
                    status: 0,
                    message: error instanceof Error
                        ? error.message
                        : 'An unexpected error occurred while clearing completed jobs.',
                    details: error,
                },
            };
        }
    }
}

// Export singleton instance for use throughout the application
export const exportAPI = new ExportAPI();
export default exportAPI;
