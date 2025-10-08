/**
 * Hotel management API functions
 */

import { apiClient } from './client';
import type { ApiResponse, PaginatedResponse } from '@/lib/types/api';
import type {
    Hotel,
    HotelDetails,
    HotelSearchParams,
    HotelSearchResult,
    HotelStats
} from '@/lib/types/hotel';

export class HotelService {
    /**
     * Search hotels by name or other criteria
     */
    static async searchHotels(params: HotelSearchParams = {}): Promise<ApiResponse<HotelSearchResult>> {
        const searchParams = new URLSearchParams();

        if (params.page) searchParams.append('page', params.page.toString());
        if (params.limit) searchParams.append('limit', params.limit.toString());
        if (params.resumeKey) searchParams.append('resume_key', params.resumeKey);
        if (params.search) searchParams.append('search', params.search);
        if (params.sortBy) searchParams.append('sort_by', params.sortBy);
        if (params.sortOrder) searchParams.append('sort_order', params.sortOrder);
        if (params.propertyType) searchParams.append('property_type', params.propertyType);
        if (params.rating) searchParams.append('rating', params.rating);
        if (params.mapStatus) searchParams.append('map_status', params.mapStatus);

        const queryString = searchParams.toString();
        const endpoint = `/content/get_all_hotel_info${queryString ? `?${queryString}` : '?page=1'}`;

        try {
            const response = await apiClient.get<{
                resume_key: string;
                page: number;
                limit: number;
                total_hotel: number;
                hotels: Array<{
                    ittid: string;
                    name: string;
                    property_type: string;
                    rating: string;
                    address_line1: string;
                    address_line2: string;
                    postal_code: string;
                    map_status: string;
                    geocode: {
                        latitude: string;
                        longitude: string;
                    };
                    updated_at: string;
                    created_at: string;
                }>;
            }>(endpoint);

            if (response.success && response.data) {
                // Transform the API response to match our Hotel interface
                const transformedHotels: Hotel[] = response.data.hotels.map((hotel, index) => ({
                    ittid: hotel.ittid,
                    id: index + 1, // Generate ID since it's not in the API response
                    name: hotel.name,
                    latitude: hotel.geocode?.latitude,
                    longitude: hotel.geocode?.longitude,
                    addressLine1: hotel.address_line1,
                    addressLine2: hotel.address_line2,
                    postalCode: hotel.postal_code,
                    rating: hotel.rating,
                    propertyType: hotel.property_type,
                    mapStatus: hotel.map_status,
                    createdAt: hotel.created_at,
                    updatedAt: hotel.updated_at,
                }));

                return {
                    success: true,
                    data: {
                        hotels: transformedHotels,
                        total: response.data.total_hotel,
                        page: response.data.page,
                        limit: response.data.limit,
                        totalPages: Math.ceil(response.data.total_hotel / response.data.limit),
                        resumeKey: response.data.resume_key,
                    }
                };
            }

            // If response is not successful, return a properly formatted error response
            return {
                success: false,
                error: response.error || {
                    status: 500,
                    message: 'Unknown error occurred',
                },
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    status: 0,
                    message: 'Failed to search hotels',
                    details: error,
                },
            };
        }
    }

    /**
     * Get hotel details by ITTID
     */
    static async getHotelDetails(ittid: string): Promise<ApiResponse<HotelDetails>> {
        try {
            const response = await apiClient.get<{
                hotel: {
                    id: number;
                    property_type: string;
                    name: string;
                    primary_photo: string;
                    latitude: string;
                    longitude: string;
                    created_at: string;
                    updated_at: string;
                    address_line1: string;
                    address_line2: string;
                    map_status: string;
                    content_update_status: string;
                    postal_code: string;
                    ittid: string;
                    rating: string;
                };
                provider_mappings: Array<{
                    provider_name: string;
                    ittid: string;
                    system_type: string;
                    giata_code: string;
                    updated_at: string;
                    id: number;
                    provider_id: string;
                    vervotech_id: string;
                    created_at: string;
                }>;
                locations: Array<{
                    ittid: string;
                    city_name: string;
                    state_code: string;
                    country_code: string;
                    city_code: string;
                    created_at: string;
                    state_name: string;
                    id: number;
                    country_name: string;
                    master_city_name: string;
                    city_location_id: string;
                    updated_at: string;
                }>;
                chains: Array<{
                    chain_name: string;
                    id: number;
                    brand_name: string;
                    ittid: string;
                    chain_code: string;
                }>;
                contacts: Array<{
                    id: number;
                    value: string;
                    ittid: string;
                    contact_type: string;
                }>;
            }>(`/content/get_hotel_with_ittid/${ittid}`);

            if (response.success && response.data) {
                // Transform the API response to match our HotelDetails interface
                const hotel = response.data.hotel;
                const transformedHotel: HotelDetails = {
                    ittid: hotel.ittid,
                    id: hotel.id,
                    name: hotel.name,
                    latitude: hotel.latitude,
                    longitude: hotel.longitude,
                    addressLine1: hotel.address_line1,
                    addressLine2: hotel.address_line2,
                    postalCode: hotel.postal_code,
                    rating: hotel.rating,
                    propertyType: hotel.property_type,
                    primaryPhoto: hotel.primary_photo,
                    mapStatus: hotel.map_status,
                    contentUpdateStatus: hotel.content_update_status,
                    createdAt: hotel.created_at,
                    updatedAt: hotel.updated_at,
                    providerMappings: response.data.provider_mappings.map(pm => ({
                        id: pm.id,
                        ittid: pm.ittid,
                        providerName: pm.provider_name,
                        providerId: pm.provider_id,
                        systemType: pm.system_type,
                        vervotechId: pm.vervotech_id,
                        giataCode: pm.giata_code,
                        createdAt: pm.created_at,
                        updatedAt: pm.updated_at,
                    })),
                    locations: response.data.locations.map(loc => ({
                        id: loc.id,
                        ittid: loc.ittid,
                        cityName: loc.city_name,
                        stateName: loc.state_name,
                        stateCode: loc.state_code,
                        countryName: loc.country_name,
                        countryCode: loc.country_code,
                        masterCityName: loc.master_city_name,
                        cityCode: loc.city_code,
                        cityLocationId: loc.city_location_id,
                    })),
                    contacts: response.data.contacts.map(contact => ({
                        id: contact.id,
                        ittid: contact.ittid,
                        contactType: contact.contact_type as "phone" | "email" | "fax" | "website",
                        value: contact.value,
                    })),
                    chains: response.data.chains.map(chain => ({
                        id: chain.id,
                        ittid: chain.ittid,
                        chainName: chain.chain_name,
                        brandName: chain.brand_name,
                        chainCode: chain.chain_code,
                    })),
                };

                return {
                    success: true,
                    data: transformedHotel,
                };
            }

            return {
                success: false,
                error: response.error || {
                    status: 500,
                    message: 'Unknown error occurred',
                },
            };
        } catch (error) {
            return {
                success: false,
                error: {
                    status: 0,
                    message: 'Failed to fetch hotel details',
                    details: error,
                },
            };
        }
    }

    /**
     * Get hotel statistics
     */
    static async getHotelStats(): Promise<ApiResponse<HotelStats>> {
        try {
            return await apiClient.get<HotelStats>('/content/hotels/stats');
        } catch (error) {
            return {
                success: false,
                error: {
                    status: 0,
                    message: 'Failed to fetch hotel statistics',
                    details: error,
                },
            };
        }
    }

    /**
     * Get available property types for filtering
     */
    static async getPropertyTypes(): Promise<ApiResponse<string[]>> {
        try {
            return await apiClient.get<string[]>('/content/hotels/property-types');
        } catch (error) {
            return {
                success: false,
                error: {
                    status: 0,
                    message: 'Failed to fetch property types',
                    details: error,
                },
            };
        }
    }

    /**
     * Get available ratings for filtering
     */
    static async getRatings(): Promise<ApiResponse<string[]>> {
        try {
            return await apiClient.get<string[]>('/content/hotels/ratings');
        } catch (error) {
            return {
                success: false,
                error: {
                    status: 0,
                    message: 'Failed to fetch ratings',
                    details: error,
                },
            };
        }
    }
}