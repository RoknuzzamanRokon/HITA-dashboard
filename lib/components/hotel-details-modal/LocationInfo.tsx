"use client";

import React, { useState } from "react";
import { MapPin, ExternalLink, Copy, Check } from "lucide-react";
import type {
  HotelBasicInfo,
  LocationDetail,
} from "@/lib/types/full-hotel-details";

export interface LocationInfoProps {
  basic: HotelBasicInfo;
  locations: LocationDetail[];
}

export const LocationInfo: React.FC<LocationInfoProps> = ({
  basic,
  locations,
}) => {
  const [copied, setCopied] = useState(false);

  // Parse coordinates
  const latitude = basic.latitude ? parseFloat(basic.latitude) : null;
  const longitude = basic.longitude ? parseFloat(basic.longitude) : null;

  // Get location details
  const location = locations.length > 0 ? locations[0] : null;

  // Generate Google Maps URL
  const mapUrl =
    latitude && longitude
      ? `https://www.google.com/maps?q=${latitude},${longitude}`
      : null;

  // Handle copy to clipboard
  const handleCopyCoordinates = async () => {
    if (latitude && longitude) {
      try {
        await navigator.clipboard.writeText(`${latitude}, ${longitude}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy coordinates:", err);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Geographic Coordinates */}
      {latitude && longitude && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-gray-600" aria-hidden="true" />
            <h4 className="text-sm font-semibold text-gray-900">
              Geographic Coordinates
            </h4>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="text-sm text-gray-700 font-mono">
              <span className="font-medium">Lat:</span> {latitude.toFixed(6)},{" "}
              <span className="font-medium">Lng:</span> {longitude.toFixed(6)}
            </div>

            <div className="flex items-center gap-2">
              {/* Copy to Clipboard Button */}
              <button
                onClick={handleCopyCoordinates}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                aria-label="Copy coordinates to clipboard"
              >
                {copied ? (
                  <>
                    <Check
                      className="w-4 h-4 text-green-600"
                      aria-hidden="true"
                    />
                    <span className="text-green-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" aria-hidden="true" />
                    <span>Copy</span>
                  </>
                )}
              </button>

              {/* Open Map Link */}
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  aria-label="Open location in Google Maps (opens in new tab)"
                >
                  <span>View Map</span>
                  <ExternalLink className="w-4 h-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Location Details */}
      {location && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-900">Location</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-700">
            {location.city_name && (
              <div>
                <span className="font-medium text-gray-900">City:</span>{" "}
                {location.city_name}
              </div>
            )}
            {location.state_name && (
              <div>
                <span className="font-medium text-gray-900">State:</span>{" "}
                {location.state_name}
              </div>
            )}
            {location.country_name && (
              <div>
                <span className="font-medium text-gray-900">Country:</span>{" "}
                {location.country_name}
              </div>
            )}
            {location.country_code && (
              <div>
                <span className="font-medium text-gray-900">Country Code:</span>{" "}
                {location.country_code}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
