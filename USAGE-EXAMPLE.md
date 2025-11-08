# Hotel Search Component Usage Examples

## Basic Usage

### In Dashboard Page

```tsx
import { HotelSearchCompact } from "@/lib/components/hotels/hotel-search-compact";

export default function HotelsPage() {
  const handleHotelSelect = (hotel: Hotel) => {
    // Navigate to hotel details page
    window.location.href = `/dashboard/hotels/${hotel.ittid}`;

    // Or handle in-page
    console.log("Selected hotel:", hotel);
  };

  return (
    <Card>
      <CardHeader>
        <h2>Hotel Search</h2>
        <p>Search and filter hotels by various criteria</p>
      </CardHeader>
      <CardContent>
        <HotelSearchCompact onHotelSelect={handleHotelSelect} maxResults={8} />
      </CardContent>
    </Card>
  );
}
```

## Advanced Usage

### With Custom Handlers

```tsx
import { HotelSearchCompact } from "@/lib/components/hotels/hotel-search-compact";
import { useState } from "react";

export default function HotelManagement() {
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const handleHotelSelect = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    setShowDetails(true);

    // Track analytics
    trackEvent("hotel_selected", {
      ittid: hotel.ittid,
      name: hotel.name,
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Search Section */}
      <Card>
        <CardHeader>
          <h2>Search Hotels</h2>
        </CardHeader>
        <CardContent>
          <HotelSearchCompact
            onHotelSelect={handleHotelSelect}
            maxResults={10}
          />
        </CardContent>
      </Card>

      {/* Details Section */}
      {showDetails && selectedHotel && (
        <Card>
          <CardHeader>
            <h2>Hotel Details</h2>
          </CardHeader>
          <CardContent>
            <HotelDetailsView hotel={selectedHotel} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

### With State Management

```tsx
import { HotelSearchCompact } from "@/lib/components/hotels/hotel-search-compact";
import { useHotelStore } from "@/lib/stores/hotel-store";

export default function HotelDashboard() {
  const { setCurrentHotel, addToRecent } = useHotelStore();

  const handleHotelSelect = (hotel: Hotel) => {
    // Update global state
    setCurrentHotel(hotel);
    addToRecent(hotel);

    // Navigate to details
    router.push(`/hotels/${hotel.ittid}`);
  };

  return (
    <HotelSearchCompact onHotelSelect={handleHotelSelect} maxResults={15} />
  );
}
```

## API Integration Examples

### Direct API Calls

#### Autocomplete

```typescript
import { HotelService } from "@/lib/api/hotels";

async function searchHotels(query: string) {
  const response = await HotelService.autocompleteHotel(query);

  if (response.success && response.data) {
    console.log("Suggestions:", response.data);
    // response.data is an array of suggestions
    response.data.forEach((suggestion) => {
      console.log(
        `${suggestion.name} - ${suggestion.city}, ${suggestion.country}`
      );
    });
  } else {
    console.error("Search failed:", response.error);
  }
}

// Usage
searchHotels("brazil");
```

#### Get Hotel Details

```typescript
import { HotelService } from "@/lib/api/hotels";

async function getHotelInfo(hotelName: string) {
  const response = await HotelService.searchHotelByName(hotelName);

  if (response.success && response.data) {
    const hotel = response.data;
    console.log("Hotel Details:");
    console.log(`Name: ${hotel.name}`);
    console.log(`ITTID: ${hotel.ittid}`);
    console.log(`Address: ${hotel.addressline1}, ${hotel.city}`);
    console.log(`Location: ${hotel.latitude}, ${hotel.longitude}`);
    console.log(`Type: ${hotel.propertytype}`);

    return hotel;
  } else {
    console.error("Failed to get hotel:", response.error);
    return null;
  }
}

// Usage
getHotelInfo("Savoy Park Hotel Apartments");
```

## Component Props

### HotelSearchCompact Props

```typescript
interface HotelSearchCompactProps {
  // Callback when a hotel is selected
  onHotelSelect?: (hotel: Hotel) => void;

  // Maximum number of results to display
  maxResults?: number; // Default: 10

  // Show advanced filters (future feature)
  showFilters?: boolean; // Default: false
}
```

### Hotel Type

```typescript
interface Hotel {
  ittid: string; // Unique hotel ID
  id: number; // Numeric ID
  name: string; // Hotel name
  latitude: string; // Latitude coordinate
  longitude: string; // Longitude coordinate
  addressLine1: string; // Primary address
  addressLine2?: string; // Secondary address (optional)
  postalCode: string; // Postal/ZIP code
  rating?: string; // Star rating (optional)
  propertyType: string; // Hotel, Resort, Apartment, etc.
  mapStatus: string; // mapped, unmapped, pending
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
```

## Testing

### Manual Testing Steps

1. Open the hotels dashboard
2. Type "brazil" in the search box
3. Wait for suggestions to appear
4. Click on a suggestion
5. Verify hotel details are displayed
6. Click the hotel card to navigate

### Automated Testing (Jest)

```typescript
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { HotelSearchCompact } from "./hotel-search-compact";
import { HotelService } from "@/lib/api/hotels";

jest.mock("@/lib/api/hotels");

describe("HotelSearchCompact", () => {
  it("shows suggestions when typing", async () => {
    const mockSuggestions = [
      { name: "Brazil Hotel", type: "hotel", city: "Rio", country: "Brazil" },
    ];

    (HotelService.autocompleteHotel as jest.Mock).mockResolvedValue({
      success: true,
      data: mockSuggestions,
    });

    render(<HotelSearchCompact />);

    const input = screen.getByPlaceholderText(/Type to search/i);
    fireEvent.change(input, { target: { value: "brazil" } });

    await waitFor(() => {
      expect(screen.getByText("Brazil Hotel")).toBeInTheDocument();
    });
  });

  it("fetches hotel details when suggestion is clicked", async () => {
    const mockHotel = {
      ittid: "ITT123",
      name: "Brazil Hotel",
      // ... other fields
    };

    (HotelService.searchHotelByName as jest.Mock).mockResolvedValue({
      success: true,
      data: mockHotel,
    });

    const onSelect = jest.fn();
    render(<HotelSearchCompact onHotelSelect={onSelect} />);

    // ... trigger suggestion click

    await waitFor(() => {
      expect(onSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          ittid: "ITT123",
        })
      );
    });
  });
});
```

## Troubleshooting

### No Suggestions Appearing

1. Check API is running: `http://127.0.0.1:8002`
2. Verify token is valid in localStorage
3. Check browser console for errors
4. Ensure query is at least 2 characters

### CORS Errors

1. Backend must allow `http://localhost:3000`
2. Check backend CORS configuration
3. Verify API URL in `.env.local`

### Slow Performance

1. Debounce is set to 300ms (adjustable)
2. Limit maxResults to reduce data transfer
3. Check network tab for slow API responses

### Hotel Details Not Loading

1. Verify exact hotel name from suggestion
2. Check API endpoint is correct
3. Ensure POST request has proper headers
4. Validate token authorization
