/**
 * Hotel Details Component
 * Displays comprehensive hotel information including provider mappings, locations, and contacts
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Star,
  Building,
  Calendar,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  Edit,
  ArrowLeft,
  Copy,
  CheckCircle,
  AlertCircle,
  Info,
  Database,
  Navigation,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/lib/components/ui/card";
import { Badge } from "@/lib/components/ui/badge";
import { Button } from "@/lib/components/ui/button";
import { DataTable, Column } from "@/lib/components/ui/data-table";
import { HotelService } from "@/lib/api/hotels";
import type {
  HotelDetails,
  ProviderMapping,
  Location,
  Contact,
  Chain,
} from "@/lib/types/hotel";

interface HotelDetailsProps {
  ittid: string;
  onBack?: () => void;
  onEdit?: (hotel: HotelDetails) => void;
  className?: string;
}

export function HotelDetailsView({
  ittid,
  onBack,
  onEdit,
  className,
}: HotelDetailsProps) {
  const [hotel, setHotel] = useState<HotelDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    loadHotelDetails();
  }, [ittid]);

  const loadHotelDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await HotelService.getHotelDetails(ittid);

      if (response.success && response.data) {
        setHotel(response.data);
      } else {
        setError(response.error?.message || "Failed to load hotel details");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const formatCoordinates = () => {
    if (hotel?.latitude && hotel?.longitude) {
      return `${parseFloat(hotel.latitude).toFixed(6)}, ${parseFloat(
        hotel.longitude
      ).toFixed(6)}`;
    }
    return null;
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "mapped":
        return "success";
      case "unmapped":
        return "warning";
      case "pending":
        return "info";
      case "active":
        return "success";
      case "inactive":
        return "error";
      default:
        return "secondary";
    }
  };

  // Provider mappings table columns
  const providerColumns: Column<ProviderMapping>[] = [
    {
      key: "providerName",
      label: "Provider",
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "providerId",
      label: "Provider ID",
      render: (value) => (
        <div className="flex items-center space-x-2">
          <code className="px-2 py-1 bg-gray-100 rounded text-sm">{value}</code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyToClipboard(value, `provider-${value}`)}
            className="h-6 w-6 p-0"
          >
            {copiedField === `provider-${value}` ? (
              <CheckCircle className="h-3 w-3 text-green-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </div>
      ),
    },
    {
      key: "systemType",
      label: "System Type",
      render: (value) => <Badge variant="secondary">{value}</Badge>,
    },
    {
      key: "vervotechId",
      label: "Vervotech ID",
      render: (value) =>
        value ? (
          <code className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-sm">
            {value}
          </code>
        ) : (
          <span className="text-gray-400 text-sm">Not mapped</span>
        ),
    },
    {
      key: "giataCode",
      label: "Giata Code",
      render: (value) =>
        value ? (
          <code className="px-2 py-1 bg-green-50 text-green-700 rounded text-sm">
            {value}
          </code>
        ) : (
          <span className="text-gray-400 text-sm">Not mapped</span>
        ),
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      render: (value) => (
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ),
    },
  ];

  // Locations table columns
  const locationColumns: Column<Location>[] = [
    {
      key: "cityName",
      label: "City",
      render: (value, location) => (
        <div className="flex flex-col">
          <span className="font-medium">{value || "Unknown"}</span>
          {location.masterCityName && location.masterCityName !== value && (
            <span className="text-sm text-gray-500">
              Master: {location.masterCityName}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "stateName",
      label: "State/Region",
      render: (value, location) => (
        <div className="flex flex-col">
          {value && <span>{value}</span>}
          {location.stateCode && (
            <span className="text-sm text-gray-500">
              Code: {location.stateCode}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "countryName",
      label: "Country",
      render: (value, location) => (
        <div className="flex items-center space-x-2">
          <span>{value || "Unknown"}</span>
          {location.countryCode && (
            <Badge variant="outline" size="sm">
              {location.countryCode}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "cityCode",
      label: "City Code",
      render: (value) =>
        value ? (
          <code className="px-2 py-1 bg-gray-100 rounded text-sm">{value}</code>
        ) : (
          <span className="text-gray-400 text-sm">N/A</span>
        ),
    },
  ];

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-6">
              <Card>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">Hotel Details</h1>
        </div>

        <Card>
          <CardContent className="p-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to Load Hotel Details
            </h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={loadHotelDetails}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{hotel.name}</h1>
            <p className="text-gray-600">ITTID: {hotel.ittid}</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {hotel.mapStatus && (
            <Badge variant={getStatusColor(hotel.mapStatus)}>
              {hotel.mapStatus}
            </Badge>
          )}
          {onEdit && (
            <Button onClick={() => onEdit(hotel)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Hotel Photo */}
          {hotel.primaryPhoto && (
            <Card>
              <CardHeader title="Hotel Photo" />
              <CardContent>
                <div className="relative">
                  <img
                    src={hotel.primaryPhoto}
                    alt={hotel.name}
                    className="w-full h-64 object-cover rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader title="Basic Information" />
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Hotel Name
                  </label>
                  <p className="text-gray-900">{hotel.name}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">
                    ITTID
                  </label>
                  <div className="flex items-center space-x-2">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {hotel.ittid}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(hotel.ittid, "ittid")}
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === "ittid" ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>

                {hotel.rating && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Rating
                    </label>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span>
                        {hotel.rating} Star{hotel.rating !== "1" ? "s" : ""}
                      </span>
                    </div>
                  </div>
                )}

                {hotel.propertyType && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Property Type
                    </label>
                    <div className="flex items-center space-x-2">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span>{hotel.propertyType}</span>
                    </div>
                  </div>
                )}

                {hotel.chains && hotel.chains.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Chain Information
                    </label>
                    <div className="mt-1 space-y-1">
                      {hotel.chains.map((chain, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2"
                        >
                          <Building className="h-4 w-4 text-gray-400" />
                          <div>
                            <span className="font-medium">
                              {chain.chainName}
                            </span>
                            {chain.brandName !== chain.chainName && (
                              <span className="text-gray-500 ml-2">
                                ({chain.brandName})
                              </span>
                            )}
                            {chain.chainCode && (
                              <Badge
                                variant="outline"
                                size="sm"
                                className="ml-2"
                              >
                                {chain.chainCode}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Address
                </label>
                <div className="flex items-start space-x-2 mt-1">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    {hotel.addressLine1 && <p>{hotel.addressLine1}</p>}
                    {hotel.addressLine2 && <p>{hotel.addressLine2}</p>}
                    {hotel.postalCode && (
                      <p className="text-gray-500">{hotel.postalCode}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Coordinates */}
              {formatCoordinates() && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Coordinates
                  </label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Navigation className="h-4 w-4 text-gray-400" />
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm">
                      {formatCoordinates()}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(formatCoordinates()!, "coordinates")
                      }
                      className="h-6 w-6 p-0"
                    >
                      {copiedField === "coordinates" ? (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(
                          `https://maps.google.com/?q=${hotel.latitude},${hotel.longitude}`,
                          "_blank"
                        )
                      }
                      className="h-6 w-6 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Provider Mappings */}
          <Card>
            <CardHeader
              title="Provider Mappings"
              subtitle={`${hotel.providerMappings.length} provider${
                hotel.providerMappings.length !== 1 ? "s" : ""
              } mapped`}
            />
            <CardContent>
              {hotel.providerMappings.length > 0 ? (
                <DataTable
                  data={hotel.providerMappings}
                  columns={providerColumns}
                  emptyMessage="No provider mappings found"
                />
              ) : (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No provider mappings available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Locations */}
          <Card>
            <CardHeader
              title="Location Information"
              subtitle={`${hotel.locations.length} location record${
                hotel.locations.length !== 1 ? "s" : ""
              }`}
            />
            <CardContent>
              {hotel.locations.length > 0 ? (
                <DataTable
                  data={hotel.locations}
                  columns={locationColumns}
                  emptyMessage="No location information found"
                />
              ) : (
                <div className="text-center py-8">
                  <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    No location information available
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Information */}
          <Card>
            <CardHeader title="Status Information" />
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">
                  Map Status
                </label>
                <div className="mt-1">
                  <Badge variant={getStatusColor(hotel.mapStatus || "")}>
                    {hotel.mapStatus || "Unknown"}
                  </Badge>
                </div>
              </div>

              {hotel.contentUpdateStatus && (
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Content Status
                  </label>
                  <div className="mt-1">
                    <Badge variant="secondary">
                      {hotel.contentUpdateStatus}
                    </Badge>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Created
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(hotel.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-600">
                  Last Updated
                </label>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(hotel.updatedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          {hotel.contacts.length > 0 && (
            <Card>
              <CardHeader title="Contact Information" />
              <CardContent className="space-y-3">
                {hotel.contacts.map((contact, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    {contact.contactType === "phone" && (
                      <Phone className="h-4 w-4 text-gray-400" />
                    )}
                    {contact.contactType === "email" && (
                      <Mail className="h-4 w-4 text-gray-400" />
                    )}
                    {contact.contactType === "website" && (
                      <Globe className="h-4 w-4 text-gray-400" />
                    )}
                    {!["phone", "email", "website"].includes(
                      contact.contactType
                    ) && <Info className="h-4 w-4 text-gray-400" />}

                    <div className="flex-1">
                      <p className="text-xs text-gray-500 uppercase">
                        {contact.contactType}
                      </p>
                      {contact.contactType === "website" ? (
                        <a
                          href={
                            contact.value.startsWith("http")
                              ? contact.value
                              : `https://${contact.value}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {contact.value}
                        </a>
                      ) : (
                        <p className="text-sm">{contact.value}</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader title="Quick Actions" />
            <CardContent className="space-y-2">
              {formatCoordinates() && (
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() =>
                    window.open(
                      `https://maps.google.com/?q=${hotel.latitude},${hotel.longitude}`,
                      "_blank"
                    )
                  }
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on Map
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => copyToClipboard(hotel.ittid, "quick-ittid")}
              >
                {copiedField === "quick-ittid" ? (
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copy ITTID
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
