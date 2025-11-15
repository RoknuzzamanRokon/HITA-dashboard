"use client";

import React, { useState } from "react";
import { MapPin, ExternalLink, Copy, Check } from "lucide-react";
import type { AddressDetails } from "@/lib/types/full-hotel-details";

export interface EnhancedLocationInfoProps {
  address: AddressDetails;
}

export const EnhancedLocationInfo: React.FC<EnhancedLocationInfoProps> = ({
  address,
}) => {
  const [copied, setCopied] = useState(false);

  // Handle copy to clipboard
  const handleCopyCoordinates = async () => {
    if (address.latitude && address.longitude) {
      try {
        await navigator.clipboard.writeText(
          `${address.latitude}, ${address.longitude}`
        );
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy coordinates:", err);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-gray-600" aria-hidden="true" />
        <h4 className="text-sm font-semibold text-gray-900">Location</h4>
      </div>

      {/* Full Address */}
      <div className="space-y-2">
        <div className="text-sm text-gray-700">
          {address.address_line_1 && (
            <div className="font-medium">{address.address_line_1}</div>
          )}
          {address.address_line_2 && <div>{address.address_line_2}</div>}
          <div className="flex flex-wrap gap-1 mt-1">
            {address.city && <span>{address.city},</span>}
            {address.state && <span>{address.state}</span>}
            {address.postal_code && <span>{address.postal_code}</span>}
          </div>
          {address.country && (
            <div className="font-medium mt-1">{address.country}</div>
          )}
        </div>
      </div>

      {/* Geographic Coordinates */}
      {address.latitude && address.longitude && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h5 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
            Geographic Coordinates
          </h5>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm text-gray-700 font-mono">
              <span className="font-medium">Lat:</span>{" "}
              {address.latitude.toFixed(6)},{" "}
              <span className="font-medium">Lng:</span>{" "}
              {address.longitude.toFixed(6)}
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
              {address.google_map_site_link && (
                <a
                  href={address.google_map_site_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  aria-label="Open location in Google Maps (opens in new tab)"
                >
                  <MapPin className="w-4 h-4" aria-hidden="true" />
                  <span>View Map</span>
                  <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Location Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {address.city && (
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              City
            </span>
            <span className="text-gray-900 mt-0.5">{address.city}</span>
          </div>
        )}
        {address.state && (
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              State
            </span>
            <span className="text-gray-900 mt-0.5">{address.state}</span>
          </div>
        )}
        {address.country && (
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Country
            </span>
            <span className="text-gray-900 mt-0.5">{address.country}</span>
          </div>
        )}
        {address.country_code && (
          <div className="flex flex-col">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              Country Code
            </span>
            <span className="text-gray-900 mt-0.5">{address.country_code}</span>
          </div>
        )}
      </div>
    </div>
  );
};
