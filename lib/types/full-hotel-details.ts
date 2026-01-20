/**
 * Full Hotel Details API types
 */

// Full hotel details response from API
export interface FullHotelDetailsResponse {
    total_supplier: number;
    have_provider_list: Array<Record<string, string[]>>;
    give_data_supplier?: number;
    give_data_supplier_list?: string[];
    hotel: HotelBasicInfo;
    provider_mappings: ProviderMappingDetail[];
    locations: LocationDetail[];
    contacts: ContactDetail[];
}

export interface HotelBasicInfo {
    id: number;
    property_type: string;
    name: string;
    primary_photo: string;
    latitude: string;
    longitude: string;
    created_at: string;
    updated_at: string;
    address_line1: string;
    map_status: string;
    address_line2: string;
    content_update_status: string;
    postal_code: string;
    ittid: string;
    rating: string;
}

export interface ProviderMappingDetail {
    id: number;
    ittid: string;
    provider_name: string;
    provider_id: string;
    updated_at: string;
    full_details: ProviderFullDetails | null;
}

export interface ProviderFullDetails {
    created: string;
    timestamp: number;
    hotel_id: number;
    name: string;
    name_local: string;
    hotel_formerly_name: string;
    destination_code: string;
    country_code: string;
    brand_text: string | null;
    property_type: string;
    star_rating: string;
    chain: string | null;
    brand: string | null;
    logo: string | null;
    primary_photo: string;
    review_rating: ReviewRating;
    policies: HotelPolicies;
    address: AddressDetails;
    contacts: ContactsDetails;
    descriptions: Description[];
    room_type: RoomType[];
    spoken_languages: Facility[];
    amenities: any | null;
    facilities: Facility[];
    hotel_photo: HotelPhoto[];
    point_of_interests: any[];
    nearest_airports: any[];
    train_stations: any | null;
    connected_locations: any | null;
    stadiums: any | null;
}

export interface ReviewRating {
    source: string | null;
    number_of_reviews: number | null;
    rating_average: number | null;
    popularity_score: number | null;
}

export interface HotelPolicies {
    checkin: CheckInPolicy;
    checkout: CheckOutPolicy;
    fees: { optional: any | null };
    know_before_you_go: any | null;
    pets: any | null;
    remark: any | null;
    child_and_extra_bed_policy: ChildPolicy;
    nationality_restrictions: any | null;
}

export interface CheckInPolicy {
    begin_time: string;
    end_time: string;
    instructions: string | null;
    min_age: number | null;
}

export interface CheckOutPolicy {
    time: string;
}

export interface ChildPolicy {
    infant_age: number | null;
    children_age_from: number | null;
    children_age_to: number | null;
    children_stay_free: string | null;
    min_guest_age: number | null;
}

export interface AddressDetails {
    latitude: number;
    longitude: number;
    address_line_1: string;
    address_line_2: string | null;
    city: string;
    state: string;
    country: string;
    country_code: string;
    postal_code: string;
    full_address: string;
    google_map_site_link: string;
    local_lang: LocalLangAddress;
    mapping: LocationMapping;
}

export interface LocalLangAddress {
    latitude: number;
    longitude: number;
    address_line_1: string;
    address_line_2: string | null;
    city: string;
    state: string;
    country: string;
    country_code: string;
    postal_code: string;
    full_address: string;
    google_map_site_link: string;
}

export interface LocationMapping {
    continent_id: number | null;
    country_id: number | null;
    province_id: number | null;
    state_id: number | null;
    city_id: number | null;
    area_id: number | null;
}

export interface ContactsDetails {
    phone_numbers: string[];
    fax: string | null;
    email_address: string[];
    website: string[];
}

export interface Description {
    title: string | null;
    text: string;
}

export interface RoomType {
    room_id: string;
    title: string;
    title_lang: string | null;
    room_pic: string;
    description: string;
    max_allowed: MaxAllowed;
    no_of_room: number | null;
    room_size: string;
    bed_type: BedType[];
    shared_bathroom: boolean | null;
    amenities: string[];
}

export interface MaxAllowed {
    total: number;
    adults: number;
    children: number;
    infant: number | null;
}

export interface BedType {
    description: string;
    configuration: any[];
    max_extrabeds: number | null;
}

export interface Facility {
    type: string;
    title: string;
    icon: string;
}

export interface HotelPhoto {
    picture_id: number;
    title: string;
    url: string;
}

export interface LocationDetail {
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
}

export interface ContactDetail {
    contact_type: string;
    ittid: string;
    value: string;
    id: number;
}

// Transformed data for UI consumption
export interface FullHotelDetails {
    basic: HotelBasicInfo;
    providers: ProviderMappingDetail[];
    locations: LocationDetail[];
    contacts: ContactDetail[];
    totalSuppliers: number;
    availableProviders: string[];
    primaryProvider: ProviderMappingDetail | null;
}
