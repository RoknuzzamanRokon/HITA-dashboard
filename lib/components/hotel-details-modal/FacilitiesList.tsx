"use client";

import React, { useState } from "react";
import type { Facility } from "@/lib/types/full-hotel-details";

export interface FacilitiesListProps {
  facilities: Facility[];
}

export const FacilitiesList: React.FC<FacilitiesListProps> = ({
  facilities,
}) => {
  const [showAll, setShowAll] = useState(false);

  if (!facilities || facilities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-sm">No facilities information available</p>
      </div>
    );
  }

  const displayedFacilities = showAll ? facilities : facilities.slice(0, 10);
  const hasMore = facilities.length > 10;

  return (
    <div className="space-y-3 sm:space-y-4">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900">
        Facilities
      </h3>

      {/* Facilities List */}
      <ul className="space-y-2">
        {displayedFacilities.map((facility, index) => (
          <li
            key={`${facility.type}-${index}`}
            className="flex items-start gap-2 text-sm text-gray-700"
          >
            <span className="text-blue-600 mt-1">•</span>
            <span>{facility.title}</span>
          </li>
        ))}
      </ul>

      {/* Show All / Show Less Button */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="min-h-[44px] text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-2"
          aria-expanded={showAll}
          aria-controls="facilities-list"
        >
          {showAll ? "Show less" : `Show all (${facilities.length - 10} more)`}
        </button>
      )}
    </div>
  );
};
