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
     * Get hotel mapping info using ITTID
     */
    static async getHotelMappingByIttid(
        request: HotelSearchRequest
    ): Promise<ApiResponse<HotelSearchResponse>> {
        try {
            const response = await apiClient.post<HotelSearchResponse>(
                '/mapping/get-mapping-hotel-with-ittid',
                request
            );

            return response;
        } catch (error) {
            console.error('Failed to fetch hotel mapping by ITTID:', error);
            return {
                success: false,
                error: {
                    status: 500,
                    message: 'Failed to fetch hotel mapping data',
                },
            };
        }
    }
}