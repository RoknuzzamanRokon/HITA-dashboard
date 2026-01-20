"use client";

import React from "react";
import { Users, Baby, Bed } from "lucide-react";
import type { ChildPolicy as ChildPolicyType } from "@/lib/types/full-hotel-details";

export interface ChildPolicyProps {
  childPolicy: ChildPolicyType;
}

export const ChildPolicy: React.FC<ChildPolicyProps> = ({ childPolicy }) => {
  const hasAnyData =
    childPolicy.infant_age !== null ||
    childPolicy.children_age_from !== null ||
    childPolicy.children_age_to !== null ||
    childPolicy.children_stay_free !== null ||
    childPolicy.min_guest_age !== null;

  if (!hasAnyData) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Users className="h-5 w-5 text-blue-600" aria-hidden="true" />
        Child & Guest Policy
      </h3>

      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        {/* Child Age Ranges */}
        {(childPolicy.children_age_from !== null ||
          childPolicy.children_age_to !== null ||
          childPolicy.infant_age !== null) && (
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Baby className="h-4 w-4 text-purple-600" aria-hidden="true" />
              <span>Age Definitions</span>
            </h4>
            <div className="space-y-1 text-sm text-gray-700 pl-6">
              {childPolicy.infant_age !== null && (
                <p>
                  <span className="font-medium">Infant:</span>{" "}
                  <span
                    aria-label={`Infants are ${childPolicy.infant_age} years and under`}
                  >
                    {childPolicy.infant_age} years and under
                  </span>
                </p>
              )}
              {(childPolicy.children_age_from !== null ||
                childPolicy.children_age_to !== null) && (
                <p>
                  <span className="font-medium">Children:</span>{" "}
                  <span
                    aria-label={`Children are from ${
                      childPolicy.children_age_from || 0
                    } to ${childPolicy.children_age_to || 0} years`}
                  >
                    {childPolicy.children_age_from !== null &&
                      `${childPolicy.children_age_from} `}
                    {childPolicy.children_age_from !== null &&
                      childPolicy.children_age_to !== null &&
                      "to "}
                    {childPolicy.children_age_to !== null &&
                      `${childPolicy.children_age_to} years`}
                  </span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* Minimum Guest Age */}
        {childPolicy.min_guest_age !== null && (
          <div className="space-y-2 pt-3 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" aria-hidden="true" />
              <span>Minimum Guest Age</span>
            </h4>
            <p className="text-sm text-gray-700 pl-6">
              <span
                aria-label={`Minimum guest age is ${childPolicy.min_guest_age} years`}
              >
                Guests must be at least {childPolicy.min_guest_age} years old
              </span>
            </p>
          </div>
        )}

        {/* Children Stay Free */}
        {childPolicy.children_stay_free && (
          <div className="space-y-2 pt-3 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Bed className="h-4 w-4 text-green-600" aria-hidden="true" />
              <span>Children Stay Free</span>
            </h4>
            <p className="text-sm text-gray-700 pl-6">
              {childPolicy.children_stay_free}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
