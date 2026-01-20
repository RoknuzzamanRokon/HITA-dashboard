"use client";

import React from "react";
import { Clock, User } from "lucide-react";
import type {
  CheckInPolicy,
  CheckOutPolicy,
} from "@/lib/types/full-hotel-details";

export interface CheckInOutInfoProps {
  checkin: CheckInPolicy;
  checkout: CheckOutPolicy;
}

/**
 * Convert 24-hour time to 12-hour format with AM/PM
 */
function formatTime(time: string): string {
  if (!time) return "Not specified";

  // Handle time formats like "15:00:00" or "15:00"
  const timeParts = time.split(":");
  if (timeParts.length < 2) return time;

  const hours = parseInt(timeParts[0], 10);
  const minutes = timeParts[1];

  if (isNaN(hours)) return time;

  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;

  return `${displayHours}:${minutes} ${period}`;
}

export const CheckInOutInfo: React.FC<CheckInOutInfoProps> = ({
  checkin,
  checkout,
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Clock className="h-5 w-5 text-blue-600" aria-hidden="true" />
        Check-In & Check-Out Times
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Check-In Information */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-green-600" aria-hidden="true" />
            <span>Check-In</span>
          </h4>
          <div className="space-y-1 text-sm text-gray-700">
            {checkin.begin_time && (
              <p>
                <span className="font-medium">From:</span>{" "}
                <span
                  aria-label={`Check-in begins at ${formatTime(
                    checkin.begin_time
                  )}`}
                >
                  {formatTime(checkin.begin_time)}
                </span>
              </p>
            )}
            {checkin.end_time && (
              <p>
                <span className="font-medium">Until:</span>{" "}
                <span
                  aria-label={`Check-in ends at ${formatTime(
                    checkin.end_time
                  )}`}
                >
                  {formatTime(checkin.end_time)}
                </span>
              </p>
            )}
            {checkin.min_age !== null && checkin.min_age !== undefined && (
              <p className="flex items-center gap-1 pt-2 border-t border-gray-200">
                <User className="h-4 w-4 text-blue-600" aria-hidden="true" />
                <span className="font-medium">Minimum Age:</span>{" "}
                <span
                  aria-label={`Minimum check-in age is ${checkin.min_age} years`}
                >
                  {checkin.min_age} years
                </span>
              </p>
            )}
          </div>
          {checkin.instructions && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-gray-600 italic">
                {checkin.instructions}
              </p>
            </div>
          )}
        </div>

        {/* Check-Out Information */}
        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Clock className="h-4 w-4 text-red-600" aria-hidden="true" />
            <span>Check-Out</span>
          </h4>
          <div className="space-y-1 text-sm text-gray-700">
            {checkout.time && (
              <p>
                <span className="font-medium">By:</span>{" "}
                <span
                  aria-label={`Check-out time is ${formatTime(checkout.time)}`}
                >
                  {formatTime(checkout.time)}
                </span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
