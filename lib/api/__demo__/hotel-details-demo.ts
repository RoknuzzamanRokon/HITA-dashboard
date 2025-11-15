/**
 * Demo script to verify Full Hotel Details API integration
 * This demonstrates the usage of the new getFullHotelDetails method
 * 
 * Usage example:
 * ```typescript
 * import { HotelService } from '@/lib/api';
 * import { transformFullHotelDetails } from '@/lib/utils';
 * 
 * // Fetch full hotel details
 * const response = await HotelService.getFullHotelDetails('11115304');
 * 
 * if (response.success && response.data) {
 *   // Transform to UI-friendly format
 *   const hotelDetails = transformFullHotelDetails(response.data);
 *   
 *   console.log('Hotel Name:', hotelDetails.basic.name);
 *   console.log('Total Suppliers:', hotelDetails.totalSuppliers);
 *   console.log('Primary Provider:', hotelDetails.primaryProvider?.provider_name);
 *   
 *   if (hotelDetails.primaryProvider?.full_details) {
 *     const details = hotelDetails.primaryProvider.full_details;
 *     console.log('Rooms:', details.room_type.length);
 *     console.log('Photos:', details.hotel_photo.length);
 *     console.log('Facilities:', details.facilities.length);
 *   }
 * } else {
 *   console.error('Error:', response.error?.message);
 * }
 * ```
 */

import { HotelService } from '../hotels';
import { transformFullHotelDetails } from '@/lib/utils/hotel-details-transform';

/**
 * Example function demonstrating the API usage
 */
export async function demoGetFullHotelDetails(ittid: string) {
    console.log(`\n🏨 Fetching full hotel details for ittid: ${ittid}\n`);

    // Fetch full hotel details with retry logic
    const response = await HotelService.getFullHotelDetails(ittid);

    if (response.success && response.data) {
        // Transform to UI-friendly format
        const hotelDetails = transformFullHotelDetails(response.data);

        console.log('✅ Successfully fetched and transformed hotel details:\n');
        console.log('Basic Info:');
        console.log(`  - Name: ${hotelDetails.basic.name}`);
        console.log(`  - Rating: ${hotelDetails.basic.rating} stars`);
        console.log(`  - Property Type: ${hotelDetails.basic.property_type}`);
        console.log(`  - Address: ${hotelDetails.basic.address_line1}`);
        console.log(`  - Location: ${hotelDetails.basic.latitude}, ${hotelDetails.basic.longitude}`);

        console.log('\nProvider Information:');
        console.log(`  - Total Suppliers: ${hotelDetails.totalSuppliers}`);
        console.log(`  - Available Providers: ${hotelDetails.availableProviders.join(', ')}`);
        console.log(`  - Primary Provider: ${hotelDetails.primaryProvider?.provider_name || 'None'}`);

        if (hotelDetails.primaryProvider?.full_details) {
            const details = hotelDetails.primaryProvider.full_details;
            console.log('\nDetailed Content:');
            console.log(`  - Room Types: ${details.room_type.length}`);
            console.log(`  - Photos: ${details.hotel_photo.length}`);
            console.log(`  - Facilities: ${details.facilities.length}`);
            console.log(`  - Descriptions: ${details.descriptions.length}`);
            console.log(`  - Check-in: ${details.policies.checkin.begin_time}`);
            console.log(`  - Check-out: ${details.policies.checkout.time}`);
        }

        console.log('\nContacts:');
        hotelDetails.contacts.forEach(contact => {
            console.log(`  - ${contact.contact_type}: ${contact.value}`);
        });

        return hotelDetails;
    } else {
        console.error('❌ Error fetching hotel details:');
        console.error(`  - Status: ${response.error?.status}`);
        console.error(`  - Message: ${response.error?.message}`);
        return null;
    }
}

/**
 * Example with custom retry configuration
 * Note: Retry logic is handled internally by the HotelService
 */
export async function demoWithCustomRetry(ittid: string) {
    console.log(`\n🔄 Fetching hotel details (retry handled internally)...\n`);

    const response = await HotelService.getFullHotelDetails(ittid);

    if (response.success && response.data) {
        console.log('✅ Successfully fetched hotel details');
        return transformFullHotelDetails(response.data);
    } else {
        console.error('❌ Failed after custom retries');
        return null;
    }
}
