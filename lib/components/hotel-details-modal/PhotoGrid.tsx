"use client";

import React from "react";
import Image from "next/image";
import type { HotelPhoto } from "@/lib/types/full-hotel-details";

export interface PhotoGridProps {
  photos: HotelPhoto[];
  onPhotoClick: (photo: HotelPhoto, index: number) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = ({
  photos,
  onPhotoClick,
}) => {
  if (!photos || photos.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg font-medium">No Photos Available</p>
        <p className="text-sm mt-2">
          There are no photos available for this hotel.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {photos.map((photo, index) => (
        <button
          key={`${photo.picture_id}-${index}`}
          onClick={() => onPhotoClick(photo, index)}
          className="relative aspect-square overflow-hidden rounded-lg bg-gray-100 hover:opacity-90 transition-opacity duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group"
          aria-label={`View ${photo.title} photo`}
        >
          <Image
            src={photo.url}
            alt={photo.title || "Hotel photo"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
            loading="lazy"
          />
          {/* Overlay with category on hover */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-150 flex items-end">
            <div className="w-full p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <p className="text-white text-xs font-medium truncate">
                {photo.title}
              </p>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};
