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
            console.log('🚀 Creating hotel export with filters:', filters);

            const response = await apiClient.post<ExportJobResponse>(
                '/export/hotels',
                filters,
                true, // requiresAuth
                3 // retryCount
            );

            if (response.success) {
                console.log('✅ Hotel export created successfully:', response.data);
            } else {
                console.error('❌ Failed to create hotel export:', response.error);
            }

            return response;
        } catch (error) {
            console.error('❌ Hotel export creation error:', error);
            return {
                success: false,
                error: {
                    status: 0,
                    message: error instanceof Error ? error.message : 'Failed to create hotel export',
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
            console.log('🚀 Creating mapping export with filters:', filters);

            const response = await apiClient.post<ExportJobResponse>(
                '/export/mappings',
                filters,
                true, // requiresAuth
                3 // retryCount
            );

            if (response.success) {
                console.log('✅ Mapping export created successfully:', response.data);
            } else {
                console.error('❌ Failed to create mapping export:', response.error);
            }

            return response;
        } catch (error) {
            console.error('❌ Mapping export creation error:', error);
            return {
                success: false,
                error: {
                    status: 0,
                    message: error instanceof Error ? error.message : 'Failed to create mapping export',
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
            console.log(`📊 Fetching status for job: ${jobId}`);

            const response = await apiClient.get<ExportJobStatus>(
                `/export/status/${jobId}`,
                true, // requiresAuth
                2 // retryCount
            );

            if (response.success) {
                console.log(`✅ Job status retrieved:`, response.data);
            } else {
                console.error(`❌ Failed to get job status:`, response.error);
            }

            return response;
        } catch (error) {
            console.error(`❌ Job status fetch error:`, error);
            return {
                success: false,
                error: {
                    status: 0,
                    message: error instanceof Error ? error.message : 'Failed to fetch export status',
                    details: error,
                },
            };
        }
    }

    /**
     * Download a completed export file
     * @param jobId - The unique job identifier for the completed export
     * @returns Promise with file Blob for download
     */
    async downloadExport(jobId: string): Promise<Blob> {
        try {
            console.log(`⬇️ Downloading export file for job: ${jobId}`);

            // Get authentication token
            const token = typeof localStorage !== 'undefined'
                ? localStorage.getItem('admin_auth_token')
                : null;

            if (!token) {
                throw new Error('Authentication token not found. Please log in again.');
            }

            // Construct the download URL
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://127.0.0.1:8001';
            const apiVersion = process.env.NEXT_PUBLIC_API_VERSION || 'v1.0';
            const downloadUrl = `${baseUrl}/${apiVersion}/export/download/${jobId}`;

            console.log(`📥 Fetching from: ${downloadUrl}`);

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

                console.error(`❌ Download failed:`, errorMessage);

                // Handle specific error cases
                if (response.status === 401) {
                    throw new Error('Session expired. Please log in again.');
                } else if (response.status === 403) {
                    throw new Error("You don't have permission to download this export.");
                } else if (response.status === 404) {
                    throw new Error('Export file not found or has expired.');
                } else if (response.status >= 500) {
                    throw new Error('Server error occurred while downloading. Please try again.');
                }

                throw new Error(errorMessage);
            }

            // Get the blob from response
            const blob = await response.blob();
            console.log(`✅ Export file downloaded successfully (${blob.size} bytes)`);

            return blob;
        } catch (error) {
            console.error(`❌ Download error:`, error);

            // Re-throw the error with a user-friendly message
            if (error instanceof Error) {
                throw error;
            }

            throw new Error('Failed to download export file. Please try again.');
        }
    }
}

// Export singleton instance for use throughout the application
export const exportAPI = new ExportAPI();
export default exportAPI;
