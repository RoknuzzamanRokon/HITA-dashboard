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
        // Limit to first 6 results
        const limitedSuggestions = response.data.slice(0, 6);
        setSuggestions(limitedSuggestions);
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
          city: response.data.city,
          country: response.data.country,
          countryCode: response.data.countrycode,
          latitude: response.data.latitude,
          longitude: response.data.longitude,
          addressLine1: response.data.addressline1,
          addressLine2: response.data.addressline2,
          postalCode: response.data.postalcode,
          chainName: response.data.chainname,
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
      {/* Search Input with Autocomplete (Enhanced) */}
      <div className="relative flex-grow">
        {/* The Search Input Field */}
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Type to search hotels (e.g., 'brazil', 'savoy')..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          // Open suggestions on focus, but ensure we have results to show
          onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
          // Delay hiding the dropdown to allow onMouseDown on suggestions to register
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          className="pl-10 h-10" // Ensure consistent height
        />

        {/* Autocomplete Suggestions Dropdown - No Animation, Scrollable */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-30 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-xl overflow-hidden">
            <div
              className="max-h-80 overflow-y-auto"
              style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#9CA3AF #F3F4F6",
              }}
            >
              {suggestions.map((suggestion, index) => (
                <div
                  key={index}
                  onMouseDown={() => handleSuggestionClick(suggestion.name)}
                  className="flex items-center px-3 py-2.5 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  {/* Icon */}
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mr-3">
                    <Building className="h-4 w-4 text-blue-600" />
                  </div>

                  {/* Hotel Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.name}
                    </p>
                    {(suggestion.city || suggestion.country) && (
                      <div className="flex items-center text-xs text-gray-500 mt-0.5">
                        <MapPin className="h-3 w-3 mr-1" />
                        <span className="truncate">
                          {[suggestion.city, suggestion.country]
                            .filter(Boolean)
                            .join(", ")}
                        </span>
                      </div>
                    )}
                  </div>


                </div>
              ))}
            </div>
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

      {/* Results - Hotel Details Card - HIGHLY VISIBLE */}
      {!loading && !loadingDetails && hotels.length > 0 && (
        <div className="mt-6 space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <h3 className="text-base font-bold text-gray-900">
                Hotel Found!
              </h3>
            </div>
            <Badge className="bg-green-100 text-green-800 border-green-300">
              {hotels.length} result{hotels.length !== 1 ? "s" : ""}
            </Badge>
          </div>

          {/* Hotel Cards - Scrollable if multiple results */}
          <div
            className="space-y-4 max-h-[600px] overflow-y-auto pr-2"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "#3B82F6 #E5E7EB",
            }}
          >
            {hotels.map((hotel) => (
              <div
                key={hotel.ittid}
                className="bg-gradient-to-br from-white to-blue-50 border-2 border-blue-300 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                {/* Hotel Header - PROMINENT */}
                <div className="flex items-start space-x-4 mb-6 pb-4 border-b-2 border-blue-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Building className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {hotel.name}
                    </h4>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="text-xs bg-blue-600 text-white px-3 py-1">
                        ID: {hotel.ittid}
                      </Badge>
                      {hotel.rating && (
                        <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-full">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-bold text-yellow-700">
                            {hotel.rating}
                          </span>
                        </div>
                      )}
                      {hotel.mapStatus && (
                        <Badge
                          className={`text-xs px-3 py-1 ${getStatusColor(
                            hotel.mapStatus
                          )}`}
                        >
                          {hotel.mapStatus.toUpperCase()}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Hotel Details Grid - CLEAR & VISIBLE */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Address */}
                  {hotel.addressLine1 && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                            Address
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {hotel.addressLine1}
                          </p>
                          {hotel.addressLine2 && (
                            <p className="text-sm text-gray-700">
                              {hotel.addressLine2}
                            </p>
                          )}
                          <p className="text-sm text-gray-700">
                            {[hotel.city, hotel.postalCode]
                              .filter(Boolean)
                              .join(", ")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Country */}
                  {hotel.country && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                            Country
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {hotel.country}
                            {hotel.countryCode && (
                              <span className="text-gray-500 ml-1">
                                ({hotel.countryCode})
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Coordinates */}
                  {hotel.latitude && hotel.longitude && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-4 w-4 text-purple-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                            Coordinates
                          </p>
                          <p className="text-sm font-mono font-medium text-gray-900">
                            {hotel.latitude}, {hotel.longitude}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Property Type */}
                  {hotel.propertyType && (
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building className="h-4 w-4 text-orange-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                            Property Type
                          </p>
                          <p className="text-sm font-medium text-gray-900">
                            {hotel.propertyType}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="flex flex-wrap items-center gap-3 pt-4 border-t-2 border-gray-200">
                  {hotel.chainName && (
                    <Badge className="bg-indigo-100 text-indigo-800 border border-indigo-300 px-3 py-1">
                      Chain: {hotel.chainName}
                    </Badge>
                  )}
                  {onHotelSelect && (
                    <button
                      onClick={() => onHotelSelect(hotel)}
                      className="ml-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 transition-colors shadow-md"
                    >
                      <span>View Full Details</span>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  )}
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

      {/* Footer Section */}
      <div className="mt-8 pt-6 border-t-2 border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-xl p-6 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Search Tips */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Search className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-bold text-gray-900">Search Tips</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-10">
                <li>• Type at least 2 characters</li>
                <li>• Use hotel name or location</li>
                <li>• Select from suggestions</li>
              </ul>
            </div>

            {/* Features */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <Building className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-bold text-gray-900">Features</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-10">
                <li>• Real-time autocomplete</li>
                <li>• Detailed hotel information</li>
                <li>• Location coordinates</li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-white" />
                </div>
                <h4 className="font-bold text-gray-900">Data Includes</h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1 ml-10">
                <li>• Full address details</li>
                <li>• Property type & chain</li>
                <li>• Geographic coordinates</li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="mt-6 pt-4 border-t border-gray-300 text-center">
            <p className="text-xs text-gray-500">
              Powered by Hotel Content API • Real-time data • Updated
              continuously
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
