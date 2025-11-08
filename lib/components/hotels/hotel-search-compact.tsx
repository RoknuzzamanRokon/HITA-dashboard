/**
 * Compact Hotel Search Component
 * Streamlined search interface for dashboard integration
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Building,
  Eye,
  ChevronRight,
} from "lucide-react";
import { Input } from "@/lib/components/ui/input";
import { Button } from "@/lib/components/ui/button";
import { Badge } from "@/lib/components/ui/badge";
import { HotelService } from "@/lib/api/hotels";
import type { Hotel, HotelSearchParams } from "@/lib/types/hotel";

interface HotelSearchCompactProps {
  onHotelSelect?: (hotel: Hotel) => void;
  maxResults?: number;
  showFilters?: boolean;
}

export function HotelSearchCompact({
  onHotelSelect,
  maxResults = 10,
  showFilters = false,
}: HotelSearchCompactProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [suggestions, setSuggestions] = useState<
    Array<{
      name: string;
      type: string;
      country?: string;
      city?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Fetching autocomplete suggestions for:", query);
      const response = await HotelService.autocompleteHotel(query);

      if (response.success && response.data) {
        console.log("✅ Got suggestions:", response.data.length);
        setSuggestions(response.data);
        setShowSuggestions(true);
      } else {
        console.error("❌ Failed to fetch suggestions:", response.error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  // Fetch hotel details by name
  const fetchHotelByName = async (hotelName: string) => {
    setLoadingDetails(true);
    setError(null);
    setShowSuggestions(false);

    try {
      console.log("🏨 Fetching hotel details for:", hotelName);
      const response = await HotelService.searchHotelByName(hotelName);

      if (response.success && response.data) {
        console.log("✅ Got hotel details:", response.data);

        // Transform the API response to match Hotel type
        const hotel: Hotel = {
          ittid: response.data.ittid,
          id: parseInt(response.data.ittid.replace(/\D/g, "")) || 0,
          name: response.data.name,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          addressLine1: response.data.addressline1,
          addressLine2: response.data.addressline2,
          postalCode: response.data.postalcode,
          propertyType: response.data.propertytype,
          mapStatus: "mapped",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setHotels([hotel]);

        // Optionally trigger the select callback immediately
        if (onHotelSelect) {
          onHotelSelect(hotel);
        }
      } else {
        console.error("❌ Failed to fetch hotel details:", response.error);
        setError(response.error?.message || "Failed to fetch hotel details");
        setHotels([]);
      }
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      setError("An unexpected error occurred");
      setHotels([]);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Handle search input change with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
        setHotels([]);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleSuggestionClick = (suggestionName: string) => {
    setSearchQuery(suggestionName);
    fetchHotelByName(suggestionName);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "mapped":
        return "bg-green-100 text-green-800";
      case "unmapped":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {/* Search Input with Autocomplete */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Type to search hotels (e.g., 'brazil', 'savoy')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          className="pl-10"
        />

        {/* Autocomplete Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {suggestions.map((suggestion, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => handleSuggestionClick(suggestion.name)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <Building className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.name}
                    </p>
                    {(suggestion.city || suggestion.country) && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate">
                          {[suggestion.city, suggestion.country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs ml-2 flex-shrink-0"
                >
                  {suggestion.type}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {(loading || loadingDetails) && (
        <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-600 text-xs flex items-center">
            <span className="animate-spin mr-2">⟳</span>
            {loading ? "Searching..." : "Loading hotel details..."}
          </p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Results */}
      {!loading && hotels.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Found {hotels.length} hotel{hotels.length !== 1 ? "s" : ""}
            </p>
            {hotels.length === maxResults && (
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  (window.location.href = "/dashboard/hotels/manage")
                }
              >
                View All Results
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {hotels.map((hotel) => (
              <div
                key={hotel.ittid}
                className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200 transition-colors"
                onClick={() => onHotelSelect?.(hotel)}
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building className="h-5 w-5 text-blue-600" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {hotel.name}
                    </h3>
                    {hotel.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-3 w-3 text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-600">
                          {hotel.rating}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span className="font-mono">ID: {hotel.ittid}</span>
                    {hotel.addressLine1 && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span className="truncate max-w-32">
                          {hotel.addressLine1}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 mt-2">
                    {hotel.mapStatus && (
                      <Badge
                        className={`text-xs ${getStatusColor(hotel.mapStatus)}`}
                      >
                        {hotel.mapStatus}
                      </Badge>
                    )}
                    {hotel.propertyType && (
                      <Badge variant="secondary" className="text-xs">
                        {hotel.propertyType}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex-shrink-0">
                  <Eye className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {!loading &&
        !loadingDetails &&
        searchQuery &&
        hotels.length === 0 &&
        suggestions.length === 0 &&
        !error && (
          <div className="text-center py-8 text-gray-500">
            <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No hotels found matching "{searchQuery}"</p>
            <p className="text-sm mt-1">Try adjusting your search terms</p>
          </div>
        )}

      {/* Empty State */}
      {!loading &&
        !loadingDetails &&
        !searchQuery &&
        hotels.length === 0 &&
        !error && (
          <div className="text-center py-8 text-gray-500">
            <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p className="font-medium">Start typing to search hotels</p>
            <p className="text-sm mt-1">
              Enter a hotel name, city, or country to see suggestions
            </p>
          </div>
        )}
    </div>
  );
}
