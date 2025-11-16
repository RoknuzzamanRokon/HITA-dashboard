/**
 * Hotel Autocomplete Search Component
 * Provides autocomplete search functionality for hotels with location-based results
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { HotelService } from "@/lib/api/hotels";
import type {
  AutocompleteResult,
  LocationSearchResult,
} from "@/lib/types/hotel";
import { Input } from "@/lib/components/ui/input";
import { Card } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Badge } from "@/lib/components/ui/badge";

export interface HotelAutocompleteSearchProps {
  className?: string;
}

export function HotelAutocompleteSearch({
  className,
}: HotelAutocompleteSearchProps) {
  // State management
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [autocompleteResults, setAutocompleteResults] = useState<
    AutocompleteResult[]
  >([]);
  const [locationResults, setLocationResults] =
    useState<LocationSearchResult | null>(null);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] =
    useState<boolean>(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);

  // Refs
  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Debounced search effect
  useEffect(() => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Clear results if search query is empty
    if (searchQuery.trim().length === 0) {
      setAutocompleteResults([]);
      setShowDropdown(false);
      setError(null);
      return;
    }

    // Only search if query is at least 2 characters
    if (searchQuery.trim().length < 2) {
      setAutocompleteResults([]);
      setShowDropdown(false);
      return;
    }

    // Set up debounce timer (300ms)
    debounceTimerRef.current = setTimeout(async () => {
      setIsLoadingAutocomplete(true);
      setError(null);

      try {
        const response = await HotelService.autocompleteAll(searchQuery.trim());

        if (response.success && response.data) {
          setAutocompleteResults(response.data);
          setShowDropdown(response.data.length > 0);
        } else {
          setError(response.error?.message || "Failed to fetch suggestions");
          setAutocompleteResults([]);
          setShowDropdown(false);
        }
      } catch (err) {
        setError("An error occurred while searching");
        setAutocompleteResults([]);
        setShowDropdown(false);
      } finally {
        setIsLoadingAutocomplete(false);
      }
    }, 300);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [searchQuery]);

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || autocompleteResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < autocompleteResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < autocompleteResults.length) {
          handleHotelSelect(autocompleteResults[selectedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setShowDropdown(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle retry
  const handleRetry = () => {
    setError(null);
    if (searchQuery.trim().length >= 2) {
      setSearchQuery(searchQuery + " "); // Trigger re-search
      setTimeout(() => setSearchQuery(searchQuery.trim()), 0);
    }
  };

  // Handle hotel selection from dropdown
  const handleHotelSelect = async (hotel: AutocompleteResult) => {
    // Close dropdown and update search query
    setShowDropdown(false);
    setSearchQuery(hotel.name);
    setError(null);

    // Extract location data
    const { country_code, latitude, longitude } = hotel;

    // Start location search
    setIsLoadingLocation(true);
    setLocationResults(null);

    try {
      const response = await HotelService.searchHotelsByLocation({
        latitude,
        longitude,
        countryCode: country_code,
        radius: "10",
        suppliers: [
          "goglobal",
          "hotelbeds",
          "paximumhotel",
          "itt",
          "ean",
          "juniperhotel",
          "hyperguestdirect",
          "letsflyhotel",
          "hotelston",
          "kiwihotel",
          "dotw",
          "agoda",
          "stuba",
          "mgholiday",
          "ratehawkhotel",
          "grnconnect",
          "innstanttravel",
          "restel",
          "illusionshotel",
          "roomerang",
          "tbohotel",
        ],
      });

      if (response.success && response.data) {
        setLocationResults(response.data);
      } else {
        setError(
          response.error?.message || "Failed to search hotels by location"
        );
      }
    } catch (err) {
      setError("An error occurred while searching for nearby hotels");
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <div className={className}>
      <Card padding="lg">
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Search Hotels by Location
            </h2>
            <p className="text-sm text-gray-600">
              Search for a hotel to find nearby properties in the same area
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start justify-between">
              <div className="flex items-start">
                <svg
                  className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div>
                  <h4 className="text-sm font-medium text-red-800">Error</h4>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="text-red-700 border-red-300 hover:bg-red-100"
                >
                  Retry
                </Button>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-600"
                  aria-label="Dismiss error"
                >
                  <svg
                    className="h-5 w-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          {/* Search input with icon */}
          <div className="relative">
            <Input
              ref={searchInputRef}
              type="text"
              placeholder="Search for hotels by name or location..."
              value={searchQuery}
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
              leftIcon={
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              }
              rightIcon={
                isLoadingAutocomplete ? (
                  <svg
                    className="animate-spin h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : null
              }
              aria-label="Search hotels"
              aria-autocomplete="list"
              aria-controls="autocomplete-dropdown"
              aria-expanded={showDropdown}
            />

            {/* Autocomplete dropdown */}
            {showDropdown && autocompleteResults.length > 0 && (
              <div
                ref={dropdownRef}
                id="autocomplete-dropdown"
                className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto"
                role="listbox"
              >
                {autocompleteResults.map((hotel, index) => (
                  <div
                    key={`${hotel.name}-${hotel.latitude}-${hotel.longitude}`}
                    className={`px-4 py-3 cursor-pointer transition-colors ${
                      index === selectedIndex
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : "hover:bg-gray-50 border-l-4 border-transparent"
                    }`}
                    onClick={() => handleHotelSelect(hotel)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    role="option"
                    aria-selected={index === selectedIndex}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {hotel.name}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {hotel.city && `${hotel.city}, `}
                          {hotel.country}
                        </p>
                      </div>
                      <svg
                        className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Loading overlay for location search */}
          {isLoadingLocation && (
            <div className="mt-8 flex flex-col items-center justify-center py-12">
              <svg
                className="animate-spin h-12 w-12 text-blue-600 mb-4"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <p className="text-gray-600 font-medium">
                Searching for nearby hotels...
              </p>
              <p className="text-sm text-gray-500 mt-1">
                This may take a few moments
              </p>
            </div>
          )}

          {/* Location results */}
          {!isLoadingLocation && locationResults && (
            <div className="mt-8">
              {/* Results header */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  Nearby Hotels
                </h3>
                <p
                  className="text-sm text-gray-600 mt-1"
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  Found {locationResults.totalHotels} hotels in this area
                </p>
              </div>

              {/* Hotel cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {locationResults.hotels.map((hotel, index) => (
                  <Card
                    key={`${hotel.name}-${hotel.latitude}-${hotel.longitude}-${index}`}
                    padding="none"
                    className="overflow-hidden hover:shadow-xl transition-shadow"
                  >
                    {/* Hotel photo */}
                    <div className="relative h-48 bg-gray-200">
                      {hotel.photo ? (
                        <img
                          src={hotel.photo}
                          alt={`${hotel.name} - ${hotel.starRating} star hotel in ${hotel.address}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gray-100">
                                  <svg class="h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                </div>
                              `;
                            }
                          }}
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center bg-gray-100"
                          role="img"
                          aria-label="No image available for this hotel"
                        >
                          <svg
                            className="h-16 w-16 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Hotel info */}
                    <div className="p-4">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2">
                        {hotel.name}
                      </h4>

                      {/* Address */}
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {hotel.address}
                      </p>

                      {/* Star rating */}
                      <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`h-4 w-4 ${
                              i < hotel.starRating
                                ? "text-yellow-400"
                                : "text-gray-300"
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                        <span className="ml-2 text-xs text-gray-600">
                          {hotel.starRating} Star
                        </span>
                      </div>

                      {/* Hotel type and supplier badges */}
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="secondary" size="sm">
                          {hotel.type}
                        </Badge>
                        {hotel.suppliers.length > 0 && (
                          <Badge variant="info" size="sm">
                            {hotel.suppliers.length} Supplier
                            {hotel.suppliers.length !== 1 ? "s" : ""}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
