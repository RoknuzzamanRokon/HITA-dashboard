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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const searchHotels = async (query: string = searchQuery) => {
    if (!query.trim()) {
      setHotels([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchParams: HotelSearchParams = {
        search: query.trim(),
        page: 1,
        limit: maxResults,
        sortBy: "name",
        sortOrder: "asc",
      };

      const response = await HotelService.searchHotels(searchParams);

      if (response.success && response.data) {
        setHotels(response.data.hotels);
      } else {
        setError(response.error?.message || "Failed to search hotels");
        setHotels([]);
      }
    } catch (error) {
      setError("An unexpected error occurred");
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const timeoutId = setTimeout(() => {
      searchHotels(query);
    }, 300);

    return () => clearTimeout(timeoutId);
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
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="Search hotels by name, ITTID, or location..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
            >
              <div className="w-10 h-10 bg-gray-200 rounded"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
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
      {!loading && searchQuery && hotels.length === 0 && !error && (
        <div className="text-center py-8 text-gray-500">
          <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No hotels found matching "{searchQuery}"</p>
          <p className="text-sm mt-1">Try adjusting your search terms</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && !searchQuery && hotels.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>Start typing to search hotels</p>
          <p className="text-sm mt-1">Search by name, ITTID, or location</p>
        </div>
      )}
    </div>
  );
}
