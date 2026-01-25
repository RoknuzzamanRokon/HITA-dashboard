/**
 * Hotel Autocomplete Search Component
 * Provides autocomplete search functionality for hotels with location-based results
 */

"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { HotelService } from "@/lib/api/hotels";
import type { AutocompleteResult } from "@/lib/types/hotel";
import { Input } from "@/lib/components/ui/input";
import { Card } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";

export interface HotelAutocompleteSearchProps {
  className?: string;
}

export function HotelAutocompleteSearch({
  className,
}: HotelAutocompleteSearchProps) {
  const router = useRouter();

  // State management
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [autocompleteResults, setAutocompleteResults] = useState<
    AutocompleteResult[]
  >([]);
  const [isLoadingAutocomplete, setIsLoadingAutocomplete] =
    useState<boolean>(false);
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
        const response = await HotelService.autocompleteHotel(
          searchQuery.trim(),
        );

        if (response.success && response.data) {
          // Transform the API response to match AutocompleteResult interface
          const transformedResults = response.data.map((item) => ({
            name: item.name,
            country_code: item.country || "US",
            longitude: "0",
            latitude: "0",
            city: item.city || "",
            country: item.country || "United States",
          }));
          setAutocompleteResults(transformedResults);
          setShowDropdown(transformedResults.length > 0);
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
          prev < autocompleteResults.length - 1 ? prev + 1 : prev,
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
  const handleHotelSelect = (hotel: AutocompleteResult) => {
    // Close dropdown
    setShowDropdown(false);
    setError(null);

    // Extract location data
    const { country_code, latitude, longitude, name } = hotel;

    // Navigate to search results page with query parameters
    const params = new URLSearchParams({
      hotel: name,
      lat: latitude.toString(),
      lng: longitude.toString(),
      country: country_code,
    });

    router.push(`/dashboard/hotels/search-results?${params.toString()}`);
  };

  return (
    <div className={className}>
      <Card
        padding="lg"
        hover={false}
        className="overflow-visible !hover:scale-100 !hover:shadow-sm !transition-none"
      >
        <div className="space-y-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Search Hotels by Location
            </h2>
            <p className="text-sm text-gray-600">
              Search for a hotel to find nearby properties in the same area
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-0">
              <div className="flex items-start flex-1">
                <svg
                  className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-red-900">Error</h4>
                  <p className="text-sm text-red-800 mt-1">{error}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetry}
                  className="text-red-700 border-red-300 hover:bg-red-100 focus:ring-red-500 flex-1 sm:flex-none"
                >
                  Retry
                </Button>
                <button
                  onClick={() => setError(null)}
                  className="text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 rounded p-1 transition-colors"
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
                className="absolute z-[9999] w-full mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 sm:max-h-96 overflow-y-auto"
                role="listbox"
                style={{ zIndex: 9999 }}
              >
                {autocompleteResults.map((hotel, index) => (
                  <div
                    key={`autocomplete-${index}-${hotel.name}-${hotel.latitude}-${hotel.longitude}`}
                    className={`px-3 sm:px-4 py-3 cursor-pointer transition-all duration-150 ${
                      index === selectedIndex
                        ? "bg-blue-50 border-l-4 border-blue-600"
                        : "hover:bg-gray-50 focus:bg-gray-50 border-l-4 border-transparent"
                    }`}
                    onClick={() => handleHotelSelect(hotel)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    role="option"
                    aria-selected={index === selectedIndex}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleHotelSelect(hotel);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">
                          {hotel.name}
                        </p>
                        <p className="text-xs text-gray-600 mt-1 truncate">
                          {hotel.city && `${hotel.city}, `}
                          {hotel.country}
                        </p>
                      </div>
                      <svg
                        className="h-5 w-5 text-gray-400 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
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

          {/* Footer Section */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            {/* Search Tips */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Search Tips
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <svg
                    className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Type at least 2 characters to see suggestions</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Use arrow keys to navigate through suggestions</span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>
                    Press Enter to select a hotel and view nearby properties
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <svg
                    className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Search results show hotels within 10km radius</span>
                </li>
              </ul>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-900">1.5M+</p>
                    <p className="text-xs text-blue-700 font-medium">
                      Hotels Worldwide
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-900">20+</p>
                    <p className="text-xs text-green-700 font-medium">
                      Supplier Networks
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-900">200+</p>
                    <p className="text-xs text-purple-700 font-medium">
                      Countries Covered
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
