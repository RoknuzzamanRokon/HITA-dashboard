"use client";

import React from "react";

export interface AmenitiesListProps {
  amenities: any;
}

export const AmenitiesList: React.FC<AmenitiesListProps> = ({ amenities }) => {
  // Handle missing or null amenities
  if (!amenities) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No amenities information available</p>
      </div>
    );
  }

  // Convert amenities to array if it's an object
  let amenitiesList: string[] = [];

  if (Array.isArray(amenities)) {
    amenitiesList = amenities;
  } else if (typeof amenities === "object") {
    // If amenities is an object, extract values or keys
    amenitiesList = Object.values(amenities).filter(
      (item) => typeof item === "string"
    ) as string[];

    // If no string values, try keys
    if (amenitiesList.length === 0) {
      amenitiesList = Object.keys(amenities);
    }
  } else if (typeof amenities === "string") {
    amenitiesList = [amenities];
  }

  if (amenitiesList.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No amenities information available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Amenities</h3>

      {/* Amenities Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {amenitiesList.map((amenity, index) => (
          <div
            key={`amenity-${index}`}
            className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            {/* Icon - using a generic checkmark */}
            <span
              className="text-blue-600 flex-shrink-0"
              role="img"
              aria-label="Available"
            >
              ✓
            </span>

            {/* Amenity text */}
            <span
              className="text-sm text-gray-700 truncate"
              title={amenity}
              aria-label={`Amenity: ${amenity}`}
            >
              {amenity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
