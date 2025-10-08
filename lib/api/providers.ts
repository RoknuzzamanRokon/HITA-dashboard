/**
 * Provider content management API functions
 */

import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '@/lib/types/api';
import type {
    Provider,
    ProviderStats,
    ProviderHotelListParams,
    ProviderHotelListResponse,
    ProviderHotel,
    ExportOptions,
    ExportProgress,
    ProviderPermission,
} from '@/lib/types/provider';

export class ProvidersApi {
    /**
     * Get list of available providers
     */
    static async getProviders(): Promise<ApiResponse<Provider[]>> {
        try {
            const response = await apiClient.get<Provider[]>('/content/providers');
            return response;
        } catch (error) {
            console.error('Failed to fetch providers:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to fetch providers',
                },
            };
        }
    }

    /**
     * Get provider statistics and sync status
     */
    static async getProviderStats(providerName?: string): Promise<ApiResponse<ProviderStats[]>> {
        try {
            const endpoint = providerName
                ? `/content/providers/stats?provider=${encodeURIComponent(providerName)}`
                : '/content/providers/stats';

            const response = await apiClient.get<ProviderStats[]>(endpoint);
            return response;
        } catch (error) {
            console.error('Failed to fetch provider stats:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to fetch provider statistics',
                },
            };
        }
    }

    /**
     * Get hotels for a specific provider with pagination
     */
    static async getProviderHotels(params: ProviderHotelListParams): Promise<ApiResponse<ProviderHotelListResponse>> {
        try {
            const searchParams = new URLSearchParams();

            searchParams.append('provider', params.provider);

            if (params.page) searchParams.append('page', params.page.toString());
            if (params.limit) searchParams.append('limit', params.limit.toString());
            if (params.resumeKey) searchParams.append('resume_key', params.resumeKey);
            if (params.search) searchParams.append('search', params.search);
            if (params.sortBy) searchParams.append('sort_by', params.sortBy);
            if (params.sortOrder) searchParams.append('sort_order', params.sortOrder);

            const endpoint = `/content/providers/hotels?${searchParams.toString()}`;
            const response = await apiClient.get<ProviderHotelListResponse>(endpoint);

            return response;
        } catch (error) {
            console.error('Failed to fetch provider hotels:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to fetch provider hotels',
                },
            };
        }
    }

    /**
     * Get hotel details for a specific provider mapping
     */
    static async getProviderHotelDetails(
        ittid: string,
        providerName: string
    ): Promise<ApiResponse<ProviderHotel>> {
        try {
            const endpoint = `/content/providers/hotels/${ittid}?provider=${encodeURIComponent(providerName)}`;
            const response = await apiClient.get<ProviderHotel>(endpoint);
            return response;
        } catch (error) {
            console.error('Failed to fetch provider hotel details:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to fetch hotel details',
                },
            };
        }
    }

    /**
     * Initiate content export
     */
    static async initiateExport(options: ExportOptions): Promise<ApiResponse<{ exportId: string }>> {
        try {
            const response = await apiClient.post<{ exportId: string }>('/content/export', options);
            return response;
        } catch (error) {
            console.error('Failed to initiate export:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to initiate export',
                },
            };
        }
    }

    /**
     * Get export progress and status
     */
    static async getExportProgress(exportId: string): Promise<ApiResponse<ExportProgress>> {
        try {
            const response = await apiClient.get<ExportProgress>(`/content/export/${exportId}/status`);
            return response;
        } catch (error) {
            console.error('Failed to fetch export progress:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to fetch export progress',
                },
            };
        }
    }

    /**
     * Download completed export
     */
    static async downloadExport(exportId: string): Promise<ApiResponse<Blob>> {
        try {
            const response = await apiClient.request<Blob>(`/content/export/${exportId}/download`, {
                method: 'GET',
                requiresAuth: true,
            });

            return response;
        } catch (error) {
            console.error('Failed to download export:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to download export',
                },
            };
        }
    }

    /**
     * Get user's provider permissions
     */
    static async getUserProviderPermissions(userId?: string): Promise<ApiResponse<ProviderPermission[]>> {
        try {
            const endpoint = userId
                ? `/permissions/providers?user_id=${userId}`
                : '/permissions/providers/me';

            const response = await apiClient.get<ProviderPermission[]>(endpoint);
            return response;
        } catch (error) {
            console.error('Failed to fetch provider permissions:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to fetch provider permissions',
                },
            };
        }
    }

    /**
     * Trigger provider content sync
     */
    static async triggerProviderSync(providerName: string): Promise<ApiResponse<{ syncId: string }>> {
        try {
            const response = await apiClient.post<{ syncId: string }>('/content/providers/sync', {
                provider: providerName,
            });
            return response;
        } catch (error) {
            console.error('Failed to trigger provider sync:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to trigger provider sync',
                },
            };
        }
    }

    /**
     * Update provider hotel mapping
     */
    static async updateProviderMapping(
        ittid: string,
        providerName: string,
        mappingData: Partial<ProviderHotel>
    ): Promise<ApiResponse<ProviderHotel>> {
        try {
            const response = await apiClient.put<ProviderHotel>(
                `/content/providers/hotels/${ittid}/mapping`,
                {
                    provider: providerName,
                    ...mappingData,
                }
            );
            return response;
        } catch (error) {
            console.error('Failed to update provider mapping:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to update provider mapping',
                },
            };
        }
    }
}