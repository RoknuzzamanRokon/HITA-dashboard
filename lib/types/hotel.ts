/**
 * Hotel management related types
 */

export interface Hotel {
    ittid: string;
    id: number;
    name: string;
    city?: string;
    country?: string;
    countryCode?: string;
    latitude?: string;
    longitude?: string;
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    rating?: string;
    propertyType?: string;
    chainName?: string;
    primaryPhoto?: string;
    mapStatus?: string;
    contentUpdateStatus?: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProviderMapping {
    id: number;
    ittid: string;
    providerName: string;
    providerId: string;
    systemType: string;
    vervotechId?: string;
    giataCode?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Location {
    id: number;
    ittid: string;
    cityName?: string;
    stateName?: string;
    stateCode?: string;
    countryName?: string;
    countryCode?: string;
    masterCityName?: string;
    cityCode?: string;
    cityLocationId?: string;
}

export interface Contact {
    id: number;
    ittid: string;
    contactType: "phone" | "email" | "fax" | "website";
    value: string;
}

export interface Chain {
    id: number;
    ittid: string;
    chainName: string;
    brandName: string;
    chainCode: string;
}

export interface HotelDetails extends Hotel {
    providerMappings: ProviderMapping[];
    locations: Location[];
    contacts: Contact[];
    chains: Chain[];
    primaryPhoto?: string;
    contentUpdateStatus?: string;
}

export interface HotelSearchParams {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: keyof Hotel;
    sortOrder?: 'asc' | 'desc';
    propertyType?: string;
    rating?: string;
    mapStatus?: string;
    resumeKey?: string;
}

export interface HotelFilters {
    propertyType?: string;
    rating?: string;
    mapStatus?: string;
    search?: string;
}

export interface HotelStats {
    totalHotels: number;
    mappedHotels: number;
    unmappedHotels: number;
    hotelsByPropertyType: Record<string, number>;
    hotelsByRating: Record<string, number>;
}

export interface HotelSearchResult {
    hotels: Hotel[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    resumeKey?: string;
}
expor
t interface AutocompleteResult {
    name: string;
    country_code: string;
    longitude: string;
    latitude: string;
    city: string;
    country: string;
}

export interface LocationSearchParams {
    latitude: string;
    longitude: string;
    countryCode: string;
    radius?: string;
    suppliers?: string[];
}

export interface LocationSearchResult {
    totalHotels: number;
    hotels: LocationHotel[];
}

export interface LocationHotel {
    latitude: number;
    longitude: number;
    name: string;
    address: string;
    type: string;
    photo: string;
    starRating: number;
    vervotech: string;
    giata: string;
    suppliers: string[];
}
