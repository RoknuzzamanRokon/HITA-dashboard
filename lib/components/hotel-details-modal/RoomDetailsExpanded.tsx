"use client";

import React from "react";
import type { RoomType } from "@/lib/types/full-hotel-details";

export interface RoomDetailsExpandedProps {
  room: RoomType;
}

export const RoomDetailsExpanded: React.FC<RoomDetailsExpandedProps> = ({
  room,
}) => {
  return (
    <div className="space-y-4">
      {/* Full Description */}
      {room.description && (
        <div>
          <h5 className="text-sm font-semibold text-gray-900 mb-2">
            Description
          </h5>
          <p className="text-sm text-gray-700 leading-relaxed">
            {room.description}
          </p>
        </div>
      )}

      {/* Amenities */}
      {room.amenities && room.amenities.length > 0 && (
        <div>
          <h5 className="text-sm font-semibold text-gray-900 mb-2">
            Room Amenities
          </h5>
          <div className="flex flex-wrap gap-2">
            {room.amenities.map((amenity, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-xs text-blue-700 border border-blue-200"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Additional Room Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Number of Rooms */}
        {room.no_of_room !== null && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
              Number of Rooms
            </p>
            <p className="text-sm text-gray-700">{room.no_of_room}</p>
          </div>
        )}

        {/* Shared Bathroom */}
        {room.shared_bathroom !== null && (
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
              Bathroom
            </p>
            <p className="text-sm text-gray-700">
              {room.shared_bathroom ? "Shared" : "Private"}
            </p>
          </div>
        )}

        {/* Extra Beds */}
        {room.bed_type &&
          room.bed_type.some((bed) => bed.max_extrabeds !== null) && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">
                Extra Beds Available
              </p>
              <div className="text-sm text-gray-700">
                {room.bed_type.map((bed, index) => {
                  if (bed.max_extrabeds !== null && bed.max_extrabeds > 0) {
                    return (
                      <p key={index}>
                        {bed.description}: up to {bed.max_extrabeds}
                      </p>
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}
      </div>

      {/* Cancellation Policy Placeholder */}
      <div className="pt-4 border-t border-gray-200">
        <h5 className="text-sm font-semibold text-gray-900 mb-2">
          Booking Information
        </h5>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <span className="font-medium">Note:</span> Cancellation policies,
            refundable status, and rate sources are typically provided during
            the booking process and may vary by provider and booking date.
          </p>
        </div>
      </div>

      {/* Title Language (if different) */}
      {room.title_lang && room.title_lang !== room.title && (
        <div className="pt-2">
          <p className="text-xs text-gray-500">
            Local name: <span className="text-gray-700">{room.title_lang}</span>
          </p>
        </div>
      )}
    </div>
  );
};
