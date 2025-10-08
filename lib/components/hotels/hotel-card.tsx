/**
 * Hotel Card Component
 * Displays hotel information in a card format
 */

"use client";

import React from "react";
import {
  MapPin,
  Star,
  Building,
  Calendar,
  Eye,
  ExternalLink,
  Phone,
  Mail,
  Globe,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/lib/components/ui/card";
import { Badge } from "@/lib/components/ui/badge";
import { Button } from "@/lib/components/ui/button";
import type { Hotel } from "@/lib/types/hotel";

interface HotelCardProps {
  hotel: Hotel;
  onViewDetails?: (hotel: Hotel) => void;
  onSelect?: (hotel: Hotel) => void;
  className?: string;
  showActions?: boolean;
}

export function HotelCard({
  hotel,
  onViewDetails,
  onSelect,
  className,
  showActions = true,
}: HotelCardProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "mapped":
        return "success";
      case "unmapped":
        return "warning";
      case "pending":
        return "info";
      default:
        return "secondary";
    }
  };

  const formatAddress = () => {
    const parts = [
      hotel.addressLine1,
      hotel.addressLine2,
      hotel.postalCode,
    ].filter(Boolean);

    return parts.join(", ");
  };

  const formatCoordinates = () => {
    if (hotel.latitude && hotel.longitude) {
      return `${parseFloat(hotel.latitude).toFixed(4)}, ${parseFloat(
        hotel.longitude
      ).toFixed(4)}`;
    }
    return null;
  };

  return (
    <Card className={className} variant="outlined">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {hotel.name}
            </h3>
            <p className="text-sm text-gray-500">ITTID: {hotel.ittid}</p>
          </div>

          <div className="flex items-center space-x-2">
            {hotel.mapStatus && (
              <Badge variant={getStatusColor(hotel.mapStatus)}>
                {hotel.mapStatus}
              </Badge>
            )}

            {hotel.rating && (
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-yellow-400 fill-current" />
                <span className="text-sm font-medium">{hotel.rating}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location Information */}
        {formatAddress() && (
          <div className="flex items-start space-x-2">
            <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-700">{formatAddress()}</p>
              {formatCoordinates() && (
                <p className="text-xs text-gray-500 mt-1">
                  Coordinates: {formatCoordinates()}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Property Type */}
        {hotel.propertyType && (
          <div className="flex items-center space-x-2">
            <Building className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-700">{hotel.propertyType}</span>
          </div>
        )}

        {/* Last Updated */}
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-500">
            Updated: {new Date(hotel.updatedAt).toLocaleDateString()}
          </span>
        </div>

        {/* Content Update Status */}
        {hotel.contentUpdateStatus && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Content Status:</span>
            <Badge variant="secondary" className="text-xs">
              {hotel.contentUpdateStatus}
            </Badge>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <div className="flex space-x-2">
              {onViewDetails && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewDetails(hotel)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              )}

              {onSelect && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onSelect(hotel)}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Select
                </Button>
              )}
            </div>

            {/* Quick Info */}
            <div className="text-xs text-gray-500">ID: {hotel.id}</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Grid layout for multiple hotel cards
interface HotelCardGridProps {
  hotels: Hotel[];
  onViewDetails?: (hotel: Hotel) => void;
  onSelect?: (hotel: Hotel) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function HotelCardGrid({
  hotels,
  onViewDetails,
  onSelect,
  loading = false,
  emptyMessage = "No hotels found",
  className,
}: HotelCardGridProps) {
  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (hotels.length === 0) {
    return (
      <div className="text-center py-12">
        <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
    >
      {hotels.map((hotel) => (
        <HotelCard
          key={hotel.ittid}
          hotel={hotel}
          onViewDetails={onViewDetails}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
