"use client";

/**
 * Provider Details Page
 * Displays full hotel information using ITT mapping ID
 * Reuses the exact same component and API as hotel details page
 * Route: /dashboard/provider/details/[id]
 * API: /content/get-full-hotel-with-itt-mapping-id/${id}
 */

import HotelDetailsPage from "../../../hotels/details/[id]/page";

export default function ProviderDetailsPage() {
  // Simply reuse the HotelDetailsPage component
  // It will automatically use the [id] parameter from the URL
  // and call the same API endpoint
  return <HotelDetailsPage />;
}
