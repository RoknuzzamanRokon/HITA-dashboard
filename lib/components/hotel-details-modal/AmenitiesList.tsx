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
    // If it's an array of objects with title property
    if (
      amenities.length > 0 &&
      typeof amenities[0] === "object" &&
      amenities[0].title
    ) {
      amenitiesList = amenities.map(
        (item: any) => item.title || item.type || String(item)
      );
    } else {
      amenitiesList = amenities.map((item: any) =>
        typeof item === "string" ? item : String(item)
      );
    }
  } else if (typeof amenities === "object") {
    // If amenities is a single object with title
    if (amenities.title) {
      amenitiesList = [amenities.title];
    } else {
      // If amenities is an object, extract values or keys
      amenitiesList = Object.values(amenities).filter(
        (item) => typeof item === "string"
      ) as string[];

      // If no string values, try keys
      if (amenitiesList.length === 0) {
        amenitiesList = Object.keys(amenities);
      }
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
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
        Amenities
      </h3>

      {/* Amenities List */}
      <ul className="space-y-2">
        {amenitiesList.map((amenity, index) => (
          <li
            key={`amenity-${index}`}
            className="flex items-start gap-2 text-sm text-gray-700"
          >
            <span className="text-blue-600 mt-1">•</span>
            <span>{amenity}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
