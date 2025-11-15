"use client";

import React, { useState } from "react";
import { FileText } from "lucide-react";
import type { Description } from "@/lib/types/full-hotel-details";

export interface HotelDescriptionProps {
  descriptions: Description[];
}

const TRUNCATE_LENGTH = 300;

export const HotelDescription: React.FC<HotelDescriptionProps> = ({
  descriptions,
}) => {
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<number>>(
    new Set()
  );

  // Handle missing or empty descriptions
  if (!descriptions || descriptions.length === 0) {
    return null;
  }

  const toggleDescription = (index: number) => {
    setExpandedDescriptions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileText className="w-5 h-5 text-gray-600" aria-hidden="true" />
        <h4 className="text-sm font-semibold text-gray-900">Description</h4>
      </div>

      <div className="space-y-4">
        {descriptions.map((desc, index) => {
          const isExpanded = expandedDescriptions.has(index);
          const needsTruncation = desc.text.length > TRUNCATE_LENGTH;
          const displayText =
            needsTruncation && !isExpanded
              ? desc.text.substring(0, TRUNCATE_LENGTH) + "..."
              : desc.text;

          return (
            <div key={index} className="space-y-2">
              {desc.title && (
                <h5 className="text-sm font-medium text-gray-900">
                  {desc.title}
                </h5>
              )}
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                {displayText}
              </p>
              {needsTruncation && (
                <button
                  onClick={() => toggleDescription(index)}
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                  aria-expanded={isExpanded}
                  aria-label={
                    isExpanded
                      ? "Show less description"
                      : "Read more description"
                  }
                >
                  {isExpanded ? "Show less" : "Read more"}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
