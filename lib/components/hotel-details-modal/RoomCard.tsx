"use client";

import React, { useState, memo, useMemo } from "react";
import { Users, Baby, User, ChevronDown, ChevronUp } from "lucide-react";
import { RoomDetailsExpanded } from "./RoomDetailsExpanded";
import type { RoomType } from "@/lib/types/full-hotel-details";

export interface RoomCardProps {
  room: RoomType;
}

export const RoomCard: React.FC<RoomCardProps> = memo(({ room }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Memoize computed values
  const shortDescription = useMemo(
    () =>
      room.description && room.description.length > 150
        ? room.description.substring(0, 150) + "..."
        : room.description,
    [room.description]
  );

  const hasMoreContent = useMemo(
    () => room.description && room.description.length > 150,
    [room.description]
  );

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Room Photo Thumbnail */}
      <div className="relative w-full h-48 bg-gray-100">
        {room.room_pic ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={room.room_pic.replace(/^http:\/\//i, "https://")}
            alt={`${
              room.title || "Room"
            } - Photo showing room layout and amenities`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.dataset.errorHandled) {
                target.dataset.errorHandled = "true";
                target.src =
                  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='600' height='400'%3E%3Crect width='600' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3ERoom image unavailable%3C/text%3E%3C/svg%3E";
              }
            }}
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            role="img"
            aria-label="No room photo available"
          >
            <svg
              className="w-16 h-16 text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Room Content */}
      <div className="p-4">
        {/* Room Title */}
        <h4 className="text-lg font-semibold text-gray-900 mb-2">
          {room.title}
        </h4>

        {/* Short Description */}
        {shortDescription && (
          <p className="text-sm text-gray-600 mb-3">{shortDescription}</p>
        )}

        {/* Max Occupancy with Icons */}
        <div className="flex items-center gap-4 mb-3 text-sm text-gray-700">
          {room.max_allowed.adults > 0 && (
            <div
              className="flex items-center gap-1"
              title={`${room.max_allowed.adults} adults`}
            >
              <Users className="w-4 h-4 text-gray-500" aria-hidden="true" />
              <span aria-label={`${room.max_allowed.adults} adults`}>
                {room.max_allowed.adults}
              </span>
            </div>
          )}

          {room.max_allowed.children > 0 && (
            <div
              className="flex items-center gap-1"
              title={`${room.max_allowed.children} children`}
            >
              <User className="w-4 h-4 text-gray-500" aria-hidden="true" />
              <span aria-label={`${room.max_allowed.children} children`}>
                {room.max_allowed.children}
              </span>
            </div>
          )}

          {room.max_allowed.infant !== null && room.max_allowed.infant > 0 && (
            <div
              className="flex items-center gap-1"
              title={`${room.max_allowed.infant} infants`}
            >
              <Baby className="w-4 h-4 text-gray-500" aria-hidden="true" />
              <span aria-label={`${room.max_allowed.infant} infants`}>
                {room.max_allowed.infant}
              </span>
            </div>
          )}
        </div>

        {/* Bed Types */}
        {room.bed_type && room.bed_type.length > 0 && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
              Bed Types
            </p>
            <div className="flex flex-wrap gap-2">
              {room.bed_type.map((bed, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-md bg-gray-100 text-xs text-gray-700"
                >
                  {bed.description}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Room Size */}
        {room.room_size && (
          <div className="mb-3">
            <p className="text-xs font-medium text-gray-500 uppercase mb-1">
              Room Size
            </p>
            <p className="text-sm text-gray-700">{room.room_size}</p>
          </div>
        )}

        {/* Expandable Button - Always show to allow viewing full details */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 min-h-[44px] text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors mt-3 py-2"
          aria-expanded={isExpanded}
          aria-controls={`room-details-${room.room_id}`}
        >
          {isExpanded ? (
            <>
              <span>Show less</span>
              <ChevronUp className="w-4 h-4" aria-hidden="true" />
            </>
          ) : (
            <>
              <span>View full details</span>
              <ChevronDown className="w-4 h-4" aria-hidden="true" />
            </>
          )}
        </button>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div
          id={`room-details-${room.room_id}`}
          className="border-t border-gray-200 p-4 bg-gray-50 animate-fadeIn"
        >
          <RoomDetailsExpanded room={room} />
        </div>
      )}
    </div>
  );
});
