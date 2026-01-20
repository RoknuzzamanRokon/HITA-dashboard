"use client";

import React, { useState } from "react";
import { Dog, ChevronDown, ChevronUp } from "lucide-react";

export interface PetPolicyProps {
  petPolicy: any;
}

export const PetPolicy: React.FC<PetPolicyProps> = ({ petPolicy }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Handle null or undefined pet policy
  if (!petPolicy) {
    return null;
  }

  // Convert pet policy to string if it's an object
  const policyText =
    typeof petPolicy === "string"
      ? petPolicy
      : typeof petPolicy === "object"
      ? JSON.stringify(petPolicy, null, 2)
      : String(petPolicy);

  // Check if text is too long (>300 chars)
  const isLongText = policyText.length > 300;
  const displayText =
    isLongText && !isExpanded
      ? policyText.substring(0, 300) + "..."
      : policyText;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Dog className="h-5 w-5 text-blue-600" aria-hidden="true" />
        Pet Policy
      </h3>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <div className="text-sm text-gray-700 whitespace-pre-wrap">
          {displayText}
        </div>

        {isLongText && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "Show less" : "Read more"}
          >
            {isExpanded ? (
              <>
                <span>Show less</span>
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              </>
            ) : (
              <>
                <span>Read more</span>
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};
