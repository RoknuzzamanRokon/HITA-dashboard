/**
 * Provider Updates API functions
 * Handles hotel mapping and provider update operations
 */

import { apiClient } from './client';
import type { ApiResponse } from '@/lib/types/api';

export interface HotelMapping {
    ittid: string;
    hotelName: string;
    countryCode: string;
    supplier: string;
    lastUpdated: string;
    status: 'active' | 'inactive' | 'pending';
    address?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    // Additional fields from country mapping API
    propertyType?: string;
    photo?: string;
    starRating?: number;
    vervotech?: string;
    giata?: string;
}

export interface UpdatedProvider {
    ittid: string;
    providerName: string;
    providerId: string;
    updateDate: string;
    details?: any;
}

export interface AllIttidResponse {
    total_supplier: number;
    total_ittid: number;
    ittid_list: string[];
}

export interface DemoIttidResponse {
    status: string;
    count: number;
    hotel_ids: string[];
}

export interface CountryMappingResponse {
    success: boolean;
    supplier: string;
    country_iso: string;
    total_hotel: number;
    data: Array<{
        [supplierName: string]: string[] | string | number;
        name: string;
        addr: string;
        ptype: string;
        photo: string;
        star: number;
        lon: number;
        lat: number;
        vervotech: string;
        giata: string;
    }>;
}

export interface UpdatedProviderResponse {
    resume_key?: string;
    total_hotel?: number;
    show_hotels_this_page?: number;
    total_page?: number;
    current_page?: number;
    provider_mappings?: Array<{
        ittid: string;
        provider_name: string;
        provider_id: string;
    }>;
    // Allow for flexible response structure
    [key: string]: any;
}

export interface CountryMappingRequest {
    supplier: string;
    country_iso: string;
}

export interface HotelSearchRequest {
    ittid: string;
}

export interface HotelSearchResponse {
    hotel: HotelMapping;
    mappingDetails?: any;
}

export interface ProviderMappingResponse {
    total_supplier: number;
    provider_list: string[];
    hotel: {
        name: string;
        primary_photo: string;
        latitude: string;
        created_at: string;
        longitude: string;
        updated_at: string;
        address_line1: string;
        map_status: string;
        address_line2: string;
        content_update_status: string;
        postal_code: string;
        ittid: string;
        rating: string;
        id: number;
        property_type: string;
    };
    provider_mappings: Array<{
        id: number;
        ittid: string;
        provider_name: string;
        provider_id: string;
        full_details: any;
    }>;
}

export interface ProviderIdentityRequest {
    provider_hotel_identity: Array<{
        provider_name: string;
        provider_id: string;
    }>;
}

export interface ProviderIdentityResponse {
    provider_mappings: Array<{
        ittid: string;
        provider_mapping_id: number;
        provider_id: string;
        provider_name: string;
        created_at: string;
    }>;
}

export interface ProviderAllIdsResponse {
    provider_name: string;
    total_hotel_ids: number;
    current_page: number;
    total_pages: number;
    hotel_ids_this_page: number;
    resume_key?: string;
    hotel_ids: string[];
}

export class ProviderUpdatesApi {
    /**
     * Get all ITTID records
     */
    static async getAllIttids(params?: {
        page?: number;
        resumeKey?: string;
    }): Promise<ApiResponse<AllIttidResponse>> {
        try {
            const searchParams = new URLSearchParams();

            if (params?.page) searchParams.append('page', params.page.toString());
            if (params?.resumeKey) searchParams.append('resume_key', params.resumeKey);

            const endpoint = `/content/get-all-ittid${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
            const response = await apiClient.get<AllIttidResponse>(endpoint);

            return response;
        } catch (error) {
            console.error('Failed to fetch all ITTIDs:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to fetch ITTID data',
                },
            };
        }
    }

    /**
     * Get all demo ITTIDs (for users with no points)
     */
    static async getAllDemoIds(): Promise<ApiResponse<DemoIttidResponse>> {
        try {
            const endpoint = `/demo/hotel/get-all-demo-id`;
            // Use auth=true to send token and prevent 401 redirects
            const response = await apiClient.get<DemoIttidResponse>(endpoint, true);

            return response;
        } catch (error) {
            console.error('Failed to fetch all Demo ITTIDs:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to fetch Demo ITTID data',
                },
            };
        }
    }

    /**
     * Get updated provider information within date range
     */
    static async getUpdatedProviderInfo(params: {
        fromDate: string;
        toDate: string;
        resumeKey?: string;
        limitPerPage?: number;
        page?: number;
    }): Promise<ApiResponse<UpdatedProviderResponse>> {
        try {
            const searchParams = new URLSearchParams();

            searchParams.append('from_date', params.fromDate);
            searchParams.append('to_date', params.toDate);

            if (params.resumeKey) searchParams.append('resume_key', params.resumeKey);
            if (params.limitPerPage) searchParams.append('limit_per_page', params.limitPerPage.toString());
            if (params.page) searchParams.append('page', params.page.toString());

            const endpoint = `/content/get-update-provider-info?${searchParams.toString()}`;
            console.log('📡 Making request to:', endpoint);
            const response = await apiClient.get<UpdatedProviderResponse>(endpoint);
            console.log('📡 Provider updates API response:', response);

            return response;
        } catch (error) {
            console.error('Failed to fetch updated provider info:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to fetch provider updates',
                },
            };
        }
    }

    /**
     * Get basic hotel info by country code
     */
    static async getBasicInfoByCountry(
        request: CountryMappingRequest
    ): Promise<ApiResponse<CountryMappingResponse>> {
        try {
            console.log('📡 Making request to country mapping API:', request);
            const response = await apiClient.post<CountryMappingResponse>(
                '/content/get-basic-info-follow-countryCode',
                request
            );
            console.log('📡 Country mapping API response:', response);

            return response;
        } catch (error) {
            console.error('Failed to fetch mapping by country:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to fetch country mapping data',
                },
            };
        }
    }

    /**
     * Get provider mapping info using ITTID (comprehensive mapping data)
     */
    static async getProviderMappingByIttid(
        request: HotelSearchRequest
    ): Promise<ApiResponse<ProviderMappingResponse>> {
        try {
            console.log('📡 Making request to provider mapping API with ITTID:', request.ittid);
            const response = await apiClient.get<ProviderMappingResponse>(
                `/content/get-hotel-with-ittid/${request.ittid}`
            );
            console.log('📡 Provider mapping API response:', response);

            return response;
        } catch (error) {
            console.error('Failed to fetch provider mapping by ITTID:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to fetch provider mapping data',
                },
            };
        }
    }

    /**
     * Get demo provider mapping info using ITTID
     */
    static async getDemoProviderMapping(
        request: HotelSearchRequest
    ): Promise<ApiResponse<ProviderMappingResponse>> {
        try {
            console.log('📡 Making request to demo provider mapping API with ITTID:', request.ittid);
            const endpoint = `/demo/hotel/${request.ittid}`;
            // Use auth=true to send token and prevent 401 redirects
            const response = await apiClient.get<ProviderMappingResponse>(endpoint, true);
            console.log('📡 Demo provider mapping API response:', response);

            return response;
        } catch (error) {
            console.error('Failed to fetch demo provider mapping by ITTID:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to fetch demo provider mapping data',
                },
            };
        }
    }

    /**
     * Get hotel mapping info using provider name and ID
     */
    static async getHotelMappingByProviderIdentity(
        request: ProviderIdentityRequest
    ): Promise<ApiResponse<any>> {
        try {
            console.log('📡 Making request to provider identity API:', request);
            const response = await apiClient.post<any>(
                '/content/get-hotel-mapping-info-using-provider-name-and-id',
                request
            );
            console.log('📡 Provider identity API response:', response);
            console.log('📡 Response success:', response.success);
            console.log('📡 Response data:', response.data);
            console.log('📡 Response error:', response.error);

            return response;
        } catch (error) {
            console.error('Failed to fetch hotel mapping by provider identity:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to fetch provider identity mapping data',
                },
            };
        }
    }

    /**
     * Get demo hotel mapping info using provider name and ID (for users with no points)
     */
    static async getDemoHotelMappingByProviderIdentity(
        request: ProviderIdentityRequest
    ): Promise<ApiResponse<any>> {
        try {
            console.log('📡 Making request to demo provider identity API:', request);
            const response = await apiClient.post<any>(
                '/demo/content/get-hotel-mapping-info-using-provider-name-and-id',
                request,
                true // requiresAuth
            );
            console.log('📡 Demo provider identity API response:', response);

            return response;
        } catch (error) {
            console.error('Failed to fetch demo hotel mapping by provider identity:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to fetch demo provider identity mapping data',
                },
            };
        }
    }

    /**
     * Get all hotel IDs for a specific provider (e.g., Kiwihotel)
     */
    static async getProviderAllIds(params?: {
        provider?: string;
        limitPerPage?: number;
        resumeKey?: string;
    }): Promise<ApiResponse<ProviderAllIdsResponse>> {
        try {
            const provider = params?.provider || 'kiwihotel';
            const searchParams = new URLSearchParams();

            if (params?.limitPerPage) {
                searchParams.append('limit_per_page', params.limitPerPage.toString());
            } else {
                searchParams.append('limit_per_page', '1000');
            }

            if (params?.resumeKey) {
                searchParams.append('resume_key', params.resumeKey);
            }

            const endpoint = `/content/get-all-hotel-id/${provider}?${searchParams.toString()}`;
            console.log('📡 Making request to provider all IDs API:', endpoint);
            const response = await apiClient.get<ProviderAllIdsResponse>(endpoint);
            console.log('📡 Provider all IDs API response:', response);

            return response;
        } catch (error) {
            console.error('Failed to fetch provider all IDs:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to fetch provider all IDs',
                },
            };
        }
    }
}