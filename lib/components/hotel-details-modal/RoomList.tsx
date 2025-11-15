"use client";

import React from "react";
import { RoomCard } from "./RoomCard";
import type { RoomType } from "@/lib/types/full-hotel-details";

export interface RoomListProps {
  rooms: RoomType[];
}

export const RoomList: React.FC<RoomListProps> = ({ rooms }) => {
  // Handle empty room data state
  if (!rooms || rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
          <svg
            className="w-8 h-8 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Room Information Available
        </h3>
        <p className="text-sm text-gray-600">
          Room details are not available for this hotel at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Available Rooms</h3>
        <p className="text-sm text-gray-600 mt-1">
          {rooms.length} {rooms.length === 1 ? "room type" : "room types"}{" "}
          available
        </p>
      </div>

      {/* Responsive grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {rooms.map((room) => (
          <RoomCard key={room.room_id} room={room} />
        ))}
      </div>
    </div>
  );
};
