/**
 * Hotel Details Page
 * Displays full hotel information using ITT mapping ID
 */

"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { HotelService } from "@/lib/api/hotels";
import type { FullHotelDetailsResponse } from "@/lib/types/full-hotel-details";
import { Card } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Badge } from "@/lib/components/ui/badge";
import { Copy, Check, ChevronDown, ChevronUp } from "lucide-react";

export default function HotelDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const ittid = params.id as string;

  const [hotelDetails, setHotelDetails] =
    useState<FullHotelDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<number>(0);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAllFacilities, setShowAllFacilities] = useState<boolean>(false);

  useEffect(() => {
    const fetchHotelDetails = async () => {
      if (!ittid) {
        setError("No hotel ID provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await HotelService.getFullHotelDetails(ittid);

        if (response.success && response.data) {
          setHotelDetails(response.data);
        } else {
          setError(response.error?.message || "Failed to load hotel details");
        }
      } catch (err) {
        setError("An error occurred while loading hotel details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotelDetails();
  }, [ittid]);

  const handleCopyProviderId = async (providerId: string) => {
    try {
      await navigator.clipboard.writeText(providerId);
      setCopiedId(providerId);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Failed to copy provider ID:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center py-20">
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
            <p className="text-gray-900 font-semibold text-lg">
              Loading hotel details...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    // Determine if this is a permission error
    const isPermissionError = error.includes("permission") || error.includes("403");
    const isAuthError = error.includes("session") || error.includes("401");
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card className={`border-${isPermissionError || isAuthError ? 'yellow' : 'red'}-200 bg-${isPermissionError || isAuthError ? 'yellow' : 'red'}-50`}>
            <div className="p-6">
              <div className="flex items-start gap-3">
                <svg
                  className={`h-6 w-6 text-${isPermissionError || isAuthError ? 'yellow' : 'red'}-500 flex-shrink-0 mt-0.5`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isPermissionError || isAuthError ? "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"}
                  />
                </svg>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold text-${isPermissionError || isAuthError ? 'yellow' : 'red'}-900`}>
                    {isPermissionError ? "Access Denied" : isAuthError ? "Authentication Required" : "Error"}
                  </h3>
                  <p className={`text-sm text-${isPermissionError || isAuthError ? 'yellow' : 'red'}-800 mt-1`}>{error}</p>
                  
                  {isPermissionError && (
                    <div className="mt-3 p-3 bg-white rounded border border-yellow-200">
                      <p className="text-sm text-gray-700 font-medium mb-2">Possible solutions:</p>
                      <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                        <li>Contact your administrator to request access to hotel details</li>
                        <li>Verify that you have the necessary permissions for this feature</li>
                        <li>Check if you need to provide an API key for this operation</li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.back()}
                  className={`text-${isPermissionError || isAuthError ? 'yellow' : 'red'}-700 border-${isPermissionError || isAuthError ? 'yellow' : 'red'}-300 hover:bg-${isPermissionError || isAuthError ? 'yellow' : 'red'}-100`}
                >
                  Go Back
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!hotelDetails) {
    return null;
  }

  const hotel = hotelDetails.hotel;
  const currentProvider = hotelDetails.provider_mappings[selectedProvider];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back button */}
        <Button
          onClick={() => router.back()}
          variant="primary"
          size="sm"
          className="mb-6"
        >
          <svg
            className="h-4 w-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Search Results
        </Button>

        {/* Hotel Header */}
        <Card className="mb-6" hover={false}>
          <div className="p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Hotel Image */}
              <div className="lg:w-1/3">
                {hotel.primary_photo ? (
                  <img
                    src={hotel.primary_photo}
                    alt={hotel.name}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23f3f4f6' width='400' height='300'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />
                ) : (
                  <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg
                      className="h-16 w-16 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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

              {/* Hotel Info */}
              <div className="lg:w-2/3">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {hotel.name}
                </h1>

                {/* Rating */}
                {hotel.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`h-5 w-5 ${
                            i < parseFloat(hotel.rating)
                              ? "text-yellow-500"
                              : "text-gray-300"
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-lg font-semibold text-gray-900">
                      {hotel.rating} Star Hotel
                    </span>
                  </div>
                )}

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {hotel.property_type && (
                    <Badge variant="secondary">{hotel.property_type}</Badge>
                  )}
                  <Badge variant="success">ITT ID: {hotel.ittid}</Badge>
                  <Badge variant="info">
                    {hotelDetails.total_supplier} Suppliers
                  </Badge>
                </div>

                {/* Address */}
                <div className="space-y-2 text-gray-700 mb-4">
                  {hotel.address_line1 && (
                    <p className="flex items-start gap-2">
                      <svg
                        className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5"
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
                      <span>{hotel.address_line1}</span>
                    </p>
                  )}
                  {hotel.address_line2 && (
                    <p className="ml-7">{hotel.address_line2}</p>
                  )}
                  {hotel.postal_code && (
                    <p className="ml-7">Postal Code: {hotel.postal_code}</p>
                  )}
                </div>

                {/* Coordinates */}
                {(hotel.latitude || hotel.longitude) && (
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {hotel.latitude && (
                      <div>
                        <span className="text-gray-500">Latitude:</span>
                        <span className="ml-2 font-medium">
                          {hotel.latitude}
                        </span>
                      </div>
                    )}
                    {hotel.longitude && (
                      <div>
                        <span className="text-gray-500">Longitude:</span>
                        <span className="ml-2 font-medium">
                          {hotel.longitude}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Supplier Information */}
        <Card className="mb-6" hover={false}>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Available Suppliers
              </h2>
              <Badge variant="secondary" size="md">
                {hotelDetails.total_supplier} Suppliers
              </Badge>
            </div>
            {(() => {
              // Convert have_provider_list to a usable format and check if supplier has full details
              const supplierData: Array<{
                name: string;
                ids: string[];
                hasFullDetails: boolean;
              }> = [];

              hotelDetails.have_provider_list.forEach((providerObj) => {
                Object.entries(providerObj).forEach(([supplierName, ids]) => {
                  // Check if this supplier has full details in provider_mappings
                  const hasFullDetails = hotelDetails.provider_mappings.some(
                    (mapping) =>
                      mapping.provider_name.toLowerCase() ===
                        supplierName.toLowerCase() &&
                      mapping.full_details !== null
                  );

                  supplierData.push({
                    name: supplierName,
                    ids: ids,
                    hasFullDetails: hasFullDetails,
                  });
                });
              });

              const first6 = supplierData.slice(0, 6);
              const remaining = supplierData.slice(6);

              const renderSupplierCard = (
                supplier: {
                  name: string;
                  ids: string[];
                  hasFullDetails: boolean;
                },
                index: number
              ) => {
                // Choose colors based on whether supplier has full details
                const bgGradient = supplier.hasFullDetails
                  ? "bg-gradient-to-br from-blue-50 to-indigo-50"
                  : "bg-gradient-to-br from-red-50 to-rose-50";
                const borderColor = supplier.hasFullDetails
                  ? "border-blue-200"
                  : "border-red-200";
                const badgeVariant = supplier.hasFullDetails ? "info" : "error";
                const codeBg = supplier.hasFullDetails
                  ? "bg-white border-blue-200 text-blue-700"
                  : "bg-white border-red-200 text-red-700";
                const copyHoverBg = supplier.hasFullDetails
                  ? "hover:bg-blue-100"
                  : "hover:bg-red-100";
                const copyIconColor = supplier.hasFullDetails
                  ? "text-blue-600"
                  : "text-red-600";
                const dividerColor = supplier.hasFullDetails
                  ? "border-blue-200"
                  : "border-red-200";
                const dividerTopColor = supplier.hasFullDetails
                  ? "border-blue-300"
                  : "border-red-300";

                return (
                  <div
                    key={index}
                    className={`${bgGradient} border ${borderColor} rounded-lg p-4 hover:shadow-md transition-all`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant={badgeVariant} size="sm">
                        Supplier {index + 1}
                      </Badge>
                      <div className="flex items-center gap-2">
                        {supplier.ids.length > 1 && (
                          <Badge variant="secondary" size="sm">
                            {supplier.ids.length} IDs
                          </Badge>
                        )}
                        {!supplier.hasFullDetails && (
                          <Badge variant="error" size="sm">
                            No Full Details
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="font-bold text-gray-900 mb-3 capitalize">
                      {supplier.name}
                    </h3>
                    <div className="space-y-3">
                      {supplier.ids.map((providerId, providerIndex) => (
                        <div key={providerIndex} className="space-y-2">
                          {supplier.ids.length > 1 && (
                            <div className="text-xs font-semibold text-gray-500 mb-1">
                              Provider ID {providerIndex + 1}
                            </div>
                          )}
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs text-gray-600 flex-shrink-0">
                              {supplier.ids.length === 1
                                ? "Provider ID:"
                                : "ID:"}
                            </span>
                            <div className="flex items-center gap-1 flex-1 min-w-0">
                              <code
                                className={`text-xs font-mono px-2 py-1 rounded border truncate flex-1 ${codeBg}`}
                              >
                                {providerId}
                              </code>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  handleCopyProviderId(providerId);
                                }}
                                className={`flex-shrink-0 p-1.5 ${copyHoverBg} rounded transition-colors cursor-pointer`}
                                title="Copy Provider ID"
                                type="button"
                              >
                                {copiedId === providerId ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy
                                    className={`w-4 h-4 ${copyIconColor}`}
                                  />
                                )}
                              </button>
                            </div>
                          </div>
                          {providerIndex < supplier.ids.length - 1 && (
                            <div
                              className={`border-t ${dividerColor} pt-2`}
                            ></div>
                          )}
                        </div>
                      ))}
                      <div className={`mt-2 pt-2 border-t ${dividerTopColor}`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600 flex-shrink-0">
                            ITT ID:
                          </span>
                          <code
                            className={`text-xs font-mono px-2 py-1 rounded border ${codeBg}`}
                          >
                            {hotelDetails.hotel.ittid}
                          </code>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              };

              return (
                <>
                  <style jsx>{`
                    .supplier-scroll::-webkit-scrollbar {
                      width: 8px;
                    }
                    .supplier-scroll::-webkit-scrollbar-track {
                      background: #e5e7eb;
                      border-radius: 4px;
                    }
                    .supplier-scroll::-webkit-scrollbar-thumb {
                      background: #3b82f6;
                      border-radius: 4px;
                    }
                    .supplier-scroll::-webkit-scrollbar-thumb:hover {
                      background: #2563eb;
                    }
                  `}</style>
                  <div
                    className="supplier-scroll grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-scroll pr-2 pb-2 relative"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "#3B82F6 #E5E7EB",
                    }}
                  >
                    {supplierData.map((supplier, index) =>
                      renderSupplierCard(supplier, index)
                    )}
                  </div>
                  {supplierData.length > 6 && (
                    <div className="mt-3 text-center text-sm text-gray-500">
                      ↕ Scroll to see all {supplierData.length} suppliers
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </Card>

        {/* Provider Details Tabs */}
        {hotelDetails.provider_mappings.length > 0 && (
          <Card className="mb-6" hover={false}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Provider Details
              </h2>

              {/* Provider Tabs */}
              <div className="flex flex-wrap gap-2 mb-6 border-b-2 border-gray-200 pb-2">
                {hotelDetails.provider_mappings.map((provider, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      console.log(
                        `🔄 Switching to provider: ${provider.provider_name} (index: ${index})`
                      );
                      setSelectedProvider(index);
                    }}
                    className={`px-6 py-3 font-semibold transition-all duration-200 relative ${
                      selectedProvider === index
                        ? "bg-blue-600 text-white rounded-t-lg shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102 rounded-lg"
                    }`}
                  >
                    {provider.provider_name}
                    {selectedProvider === index && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Provider Content */}
              {currentProvider && currentProvider.full_details && (
                <div className="space-y-6">
                  {/* Current Provider Header */}
                  <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-lg">
                    <div className="flex items-center gap-3">
                      <svg
                        className="h-6 w-6 text-blue-600"
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
                      <div>
                        <p className="text-sm text-blue-600 font-medium">
                          Currently Viewing
                        </p>
                        <p className="text-lg font-bold text-blue-900">
                          {currentProvider.provider_name} Details
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Provider ID</p>
                      <p className="font-semibold text-gray-900">
                        {currentProvider.provider_id}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Property Type</p>
                      <p className="font-semibold text-gray-900">
                        {currentProvider.full_details.property_type}
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Star Rating</p>
                      <p className="font-semibold text-gray-900">
                        {currentProvider.full_details.star_rating} Stars
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Last Updated</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(
                          currentProvider.updated_at
                        ).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {currentProvider.full_details.descriptions &&
                    currentProvider.full_details.descriptions.length > 0 && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">
                          Description
                        </h3>
                        <div className="space-y-4">
                          {currentProvider.full_details.descriptions.map(
                            (desc, index) => (
                              <div
                                key={index}
                                className="bg-gray-50 p-4 rounded-lg"
                              >
                                {desc.title && (
                                  <h4 className="font-semibold text-gray-900 mb-2">
                                    {desc.title}
                                  </h4>
                                )}
                                <p className="text-gray-700 text-sm leading-relaxed">
                                  {desc.text}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                  {/* Contact Information */}
                  {currentProvider.full_details.contacts && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Contact Information
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentProvider.full_details.contacts.phone_numbers &&
                          currentProvider.full_details.contacts.phone_numbers
                            .length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-600 mb-2">
                                Phone
                              </p>
                              {currentProvider.full_details.contacts.phone_numbers.map(
                                (phone, index) => (
                                  <p
                                    key={index}
                                    className="text-gray-900 font-medium"
                                  >
                                    {phone}
                                  </p>
                                )
                              )}
                            </div>
                          )}
                        {currentProvider.full_details.contacts.email_address &&
                          currentProvider.full_details.contacts.email_address
                            .length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-sm text-gray-600 mb-2">
                                Email
                              </p>
                              {currentProvider.full_details.contacts.email_address.map(
                                (email, index) => (
                                  <p
                                    key={index}
                                    className="text-gray-900 font-medium"
                                  >
                                    {email}
                                  </p>
                                )
                              )}
                            </div>
                          )}
                      </div>
                    </div>
                  )}

                  {/* Facilities */}
                  {currentProvider.full_details.facilities &&
                    currentProvider.full_details.facilities.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Facilities & Amenities
                          </h3>
                          <Badge variant="secondary" size="sm">
                            {currentProvider.full_details.facilities.length}{" "}
                            Total
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                          {(showAllFacilities
                            ? currentProvider.full_details.facilities
                            : currentProvider.full_details.facilities.slice(
                                0,
                                12
                              )
                          ).map((facility, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <svg
                                className="h-5 w-5 text-blue-600 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                              <span className="text-sm text-gray-900">
                                {facility.title}
                              </span>
                            </div>
                          ))}
                        </div>
                        {currentProvider.full_details.facilities.length >
                          12 && (
                          <div className="mt-4 text-center">
                            <Button
                              variant="outline"
                              size="md"
                              onClick={() =>
                                setShowAllFacilities(!showAllFacilities)
                              }
                              className="flex items-center gap-2"
                            >
                              {showAllFacilities ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Show Less
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  See More (
                                  {currentProvider.full_details.facilities
                                    .length - 12}{" "}
                                  more)
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    )}

                  {/* Hotel Photos with Scrolling */}
                  {currentProvider.full_details.hotel_photo &&
                    currentProvider.full_details.hotel_photo.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-lg font-semibold text-gray-900">
                            Hotel Photos
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span className="font-medium">
                              {currentProvider.full_details.hotel_photo.length}{" "}
                              photos
                            </span>
                            {currentProvider.full_details.hotel_photo.length >
                              12 && (
                              <>
                                <span>•</span>
                                <svg
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                  />
                                </svg>
                                <span className="hidden sm:inline">
                                  Scroll for more
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="relative">
                          <div
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto pr-2"
                            style={{
                              scrollbarWidth: "thin",
                              scrollbarColor: "#9ca3af #f3f4f6",
                            }}
                          >
                            {currentProvider.full_details.hotel_photo.map(
                              (photo, index) => (
                                <div
                                  key={index}
                                  className="aspect-video bg-gray-200 rounded-lg overflow-hidden group cursor-pointer"
                                  onClick={() =>
                                    window.open(photo.url, "_blank")
                                  }
                                >
                                  <img
                                    src={photo.url}
                                    alt={
                                      photo.title || `Hotel photo ${index + 1}`
                                    }
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.style.display = "none";
                                    }}
                                  />
                                  {photo.title && (
                                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      {photo.title}
                                    </div>
                                  )}
                                </div>
                              )
                            )}
                          </div>
                          {/* Fade indicator at bottom if there are many photos */}
                          {currentProvider.full_details.hotel_photo.length >
                            12 && (
                            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                          )}
                        </div>
                      </div>
                    )}

                  {/* Policies */}
                  {currentProvider.full_details.policies && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Policies
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentProvider.full_details.policies.checkin && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Check-in
                            </h4>
                            <p className="text-sm text-gray-700">
                              From:{" "}
                              {
                                currentProvider.full_details.policies.checkin
                                  .begin_time
                              }
                            </p>
                            <p className="text-sm text-gray-700">
                              Until:{" "}
                              {
                                currentProvider.full_details.policies.checkin
                                  .end_time
                              }
                            </p>
                          </div>
                        )}
                        {currentProvider.full_details.policies.checkout && (
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-gray-900 mb-2">
                              Check-out
                            </h4>
                            <p className="text-sm text-gray-700">
                              Time:{" "}
                              {
                                currentProvider.full_details.policies.checkout
                                  .time
                              }
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Contacts from main hotel data */}
        {hotelDetails.contacts && hotelDetails.contacts.length > 0 && (
          <Card className="mb-6" hover={false}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Additional Contacts
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {hotelDetails.contacts.map((contact, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      {contact.contact_type}
                    </p>
                    <p className="text-gray-900 font-medium">{contact.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Locations */}
        {hotelDetails.locations && hotelDetails.locations.length > 0 && (
          <Card className="mb-6" hover={false}>
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Location Details
              </h2>
              <div className="space-y-3">
                {hotelDetails.locations.map((location, index) => (
                  <div
                    key={index}
                    className="bg-gray-50 p-4 rounded-lg border border-gray-200"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                      {location.city_name && (
                        <div>
                          <span className="text-gray-500">City:</span>
                          <span className="ml-2 font-medium">
                            {location.city_name}
                          </span>
                        </div>
                      )}
                      {location.state_name && (
                        <div>
                          <span className="text-gray-500">State:</span>
                          <span className="ml-2 font-medium">
                            {location.state_name}
                          </span>
                        </div>
                      )}
                      {location.country_name && (
                        <div>
                          <span className="text-gray-500">Country:</span>
                          <span className="ml-2 font-medium">
                            {location.country_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {/* Room Details - Separate Card for Scrolling */}
        {hotelDetails.provider_mappings.length > 0 &&
          hotelDetails.provider_mappings[selectedProvider]?.full_details
            ?.room_type &&
          hotelDetails.provider_mappings[selectedProvider].full_details
            .room_type.length > 0 && (
            <Card hover={false}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Room Types & Details
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      Showing room details from{" "}
                      <span className="font-semibold text-blue-600">
                        {
                          hotelDetails.provider_mappings[selectedProvider]
                            .provider_name
                        }
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
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
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                    <span className="hidden sm:inline">Scroll to see more</span>
                  </div>
                </div>
                <div className="relative">
                  <div
                    className="space-y-4 max-h-[600px] overflow-y-auto pr-2"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "#9ca3af #f3f4f6",
                    }}
                  >
                    {hotelDetails.provider_mappings[
                      selectedProvider
                    ].full_details.room_type.map((room, index) => (
                      <div
                        key={index}
                        className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
                      >
                        {/* Room Header with Image */}
                        <div className="flex flex-col md:flex-row">
                          {/* Room Image */}
                          {room.room_pic && (
                            <div className="md:w-1/3 h-48 md:h-auto bg-gray-200">
                              <img
                                src={room.room_pic}
                                alt={room.title}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = "none";
                                }}
                              />
                            </div>
                          )}

                          {/* Room Info */}
                          <div className="flex-1 p-4">
                            <h4 className="text-lg font-bold text-gray-900 mb-2">
                              {room.title}
                            </h4>

                            {/* Room Description */}
                            {room.description && (
                              <p className="text-sm text-gray-600 mb-3">
                                {room.description}
                              </p>
                            )}

                            {/* Room Stats Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                              {/* Max Occupancy */}
                              {room.max_allowed && (
                                <div className="bg-blue-50 p-2 rounded">
                                  <p className="text-xs text-blue-600 font-medium">
                                    Max Guests
                                  </p>
                                  <p className="text-sm font-bold text-blue-900">
                                    {room.max_allowed.total || "N/A"}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {room.max_allowed.adults && (
                                      <span>
                                        {room.max_allowed.adults} Adults
                                      </span>
                                    )}
                                    {room.max_allowed.children > 0 && (
                                      <span>
                                        , {room.max_allowed.children} Kids
                                      </span>
                                    )}
                                  </p>
                                </div>
                              )}

                              {/* Room Size */}
                              {room.room_size && (
                                <div className="bg-green-50 p-2 rounded">
                                  <p className="text-xs text-green-600 font-medium">
                                    Room Size
                                  </p>
                                  <p className="text-sm font-bold text-green-900">
                                    {room.room_size}
                                  </p>
                                </div>
                              )}

                              {/* Number of Rooms */}
                              {room.no_of_room && (
                                <div className="bg-purple-50 p-2 rounded">
                                  <p className="text-xs text-purple-600 font-medium">
                                    Available
                                  </p>
                                  <p className="text-sm font-bold text-purple-900">
                                    {room.no_of_room} Rooms
                                  </p>
                                </div>
                              )}

                              {/* Shared Bathroom */}
                              {room.shared_bathroom !== null && (
                                <div className="bg-gray-50 p-2 rounded">
                                  <p className="text-xs text-gray-600 font-medium">
                                    Bathroom
                                  </p>
                                  <p className="text-sm font-bold text-gray-900">
                                    {room.shared_bathroom
                                      ? "Shared"
                                      : "Private"}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Bed Types */}
                            {room.bed_type && room.bed_type.length > 0 && (
                              <div className="mb-3">
                                <p className="text-xs text-gray-600 font-medium mb-1">
                                  Bed Configuration:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {room.bed_type.map((bed, bedIndex) => (
                                    <Badge
                                      key={bedIndex}
                                      variant="secondary"
                                      size="sm"
                                    >
                                      {bed.description}
                                      {bed.max_extrabeds && (
                                        <span className="ml-1 text-xs">
                                          (+{bed.max_extrabeds} extra)
                                        </span>
                                      )}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Room Amenities */}
                            {room.amenities && room.amenities.length > 0 && (
                              <div>
                                <p className="text-xs text-gray-600 font-medium mb-2">
                                  Room Amenities:
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {room.amenities
                                    .slice(0, 8)
                                    .map((amenity, amenityIndex) => (
                                      <div
                                        key={amenityIndex}
                                        className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-xs"
                                      >
                                        <svg
                                          className="h-3 w-3 text-green-600"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                        <span className="text-gray-700">
                                          {amenity}
                                        </span>
                                      </div>
                                    ))}
                                  {room.amenities.length > 8 && (
                                    <span className="text-xs text-gray-500 px-2 py-1">
                                      +{room.amenities.length - 8} more
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Fade indicator at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none"></div>
                </div>
              </div>
            </Card>
          )}
      </div>
    </div>
  );
}
