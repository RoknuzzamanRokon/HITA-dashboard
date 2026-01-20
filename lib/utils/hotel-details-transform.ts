/**
 * Data transformation utilities for Full Hotel Details API
 */

import type {
    FullHotelDetailsResponse,
    FullHotelDetails,
    ProviderMappingDetail,
} from '@/lib/types/full-hotel-details';

/**
 * Transform Full Hotel Details API response to UI-friendly format
 * Finds the primary provider with full details and structures data for optimal UI consumption
 * 
 * @param response - Raw API response from Full Hotel Details endpoint
 * @returns Transformed hotel details with primary provider identified
 */
export function transformFullHotelDetails(
    response: FullHotelDetailsResponse
): FullHotelDetails {
    // Validate response
    if (!response) {
        throw new Error('Invalid response: response is null or undefined');
    }

    if (!response.hotel) {
        throw new Error('Invalid response: hotel data is missing');
    }

    // Find primary provider with full details
    // Priority: hotelbeds > first provider with full_details > null
    const primaryProvider = findPrimaryProvider(response.provider_mappings || []);

    // Transform and return structured data
    return {
        basic: response.hotel,
        providers: response.provider_mappings || [],
        locations: response.locations || [],
        contacts: response.contacts || [],
        totalSuppliers: response.total_supplier || 0,
        availableProviders: extractProviderNames(response.have_provider_list || []),
        primaryProvider,
    };
}

/**
 * Extract provider names from have_provider_list structure
 * Converts Array<Record<string, string[]>> to string[]
 * 
 * @param providerList - Array of provider records
 * @returns Array of provider names
 */
export function extractProviderNames(
    providerList: Array<Record<string, string[]>>
): string[] {
    if (!providerList || !Array.isArray(providerList) || providerList.length === 0) {
        return [];
    }

    // Extract all keys from all records and flatten into a single array
    const providerNames = providerList.flatMap((record) => {
        if (!record || typeof record !== 'object') {
            return [];
        }
        return Object.keys(record);
    });

    // Remove duplicates and return
    return Array.from(new Set(providerNames));
}

/**
 * Find the primary provider with full details
 * Prefers hotelbeds provider, then falls back to first provider with full details
 * 
 * @param providers - Array of provider mappings
 * @returns Primary provider or null if none found
 */
export function findPrimaryProvider(
    providers: ProviderMappingDetail[]
): ProviderMappingDetail | null {
    // Handle null/undefined/empty array
    if (!providers || !Array.isArray(providers) || providers.length === 0) {
        return null;
    }

    // First, try to find hotelbeds provider with full details
    const hotelbedsProvider = providers.find(
        (p) =>
            p &&
            p.provider_name &&
            p.provider_name.toLowerCase() === 'hotelbeds' &&
            p.full_details !== null &&
            p.full_details !== undefined
    );

    if (hotelbedsProvider) {
        return hotelbedsProvider;
    }

    // Fall back to first provider with full details
    const firstProviderWithDetails = providers.find(
        (p) =>
            p &&
            p.full_details !== null &&
            p.full_details !== undefined
    );

    return firstProviderWithDetails || null;
}

/**
 * Check if a provider has full details available
 * 
 * @param provider - Provider mapping detail
 * @returns True if provider has full details
 */
export function hasFullDetails(provider: ProviderMappingDetail | null | undefined): boolean {
    return !!(
        provider &&
        provider.full_details !== null &&
        provider.full_details !== undefined
    );
}

/**
 * Safely get a nested property value with null/undefined checks
 * 
 * @param obj - Object to get property from
 * @param path - Dot-separated path to property (e.g., 'full_details.address.city')
 * @param defaultValue - Default value if property is not found
 * @returns Property value or default value
 */
export function safeGet<T>(
    obj: any,
    path: string,
    defaultValue: T
): T {
    if (!obj || typeof obj !== 'object') {
        return defaultValue;
    }

    const keys = path.split('.');
    let current = obj;

    for (const key of keys) {
        if (current === null || current === undefined || typeof current !== 'object') {
            return defaultValue;
        }
        current = current[key];
    }

    return current !== null && current !== undefined ? current : defaultValue;
}

/**
 * Format phone number for display
 * Handles various phone number formats and returns a clean display string
 * 
 * @param phoneNumber - Raw phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phoneNumber: string | null | undefined): string {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
        return '';
    }

    // Remove any whitespace
    const cleaned = phoneNumber.trim();

    // Return as-is if already formatted or if it's an international number
    return cleaned;
}

/**
 * Format email address for display
 * Validates and returns clean email string
 * 
 * @param email - Raw email string
 * @returns Formatted email or empty string if invalid
 */
export function formatEmail(email: string | null | undefined): string {
    if (!email || typeof email !== 'string') {
        return '';
    }

    const cleaned = email.trim().toLowerCase();

    // Basic email validation
    if (cleaned.includes('@') && cleaned.includes('.')) {
        return cleaned;
    }

    return '';
}

/**
 * Get contact information by type
 * Filters contacts array by contact type and returns values
 * 
 * @param contacts - Array of contact details
 * @param type - Contact type to filter by
 * @returns Array of contact values
 */
export function getContactsByType(
    contacts: Array<{ contact_type: string; value: string }> | null | undefined,
    type: string
): string[] {
    if (!contacts || !Array.isArray(contacts)) {
        return [];
    }

    return contacts
        .filter((c) => c && c.contact_type === type && c.value)
        .map((c) => c.value)
        .filter((v) => v && v.trim().length > 0);
}

/**
 * Truncate text to specified length with ellipsis
 * 
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(
    text: string | null | undefined,
    maxLength: number
): string {
    if (!text || typeof text !== 'string') {
        return '';
    }

    if (text.length <= maxLength) {
        return text;
    }

    return text.substring(0, maxLength).trim() + '...';
}

/**
 * Check if data is missing or malformed
 * 
 * @param data - Data to check
 * @returns True if data is valid
 */
export function isValidData(data: any): boolean {
    return data !== null && data !== undefined;
}
