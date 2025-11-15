"use client";

import React, { memo } from "react";
import type { HotelPhoto } from "@/lib/types/full-hotel-details";

export interface PhotoGridProps {
  photos: HotelPhoto[];
  onPhotoClick: (photo: HotelPhoto, index: number) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = memo(
  ({ photos, onPhotoClick }) => {
    console.log("PhotoGrid rendering with photos:", photos?.length);

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

    // Convert HTTP to HTTPS for image URLs
    const normalizeImageUrl = (url: string) => {
      return url.replace(/^http:\/\//i, "https://");
    };

    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
        {photos.map((photo, index) => {
          const imageUrl = normalizeImageUrl(photo.url);
          return (
            <button
              key={`${photo.picture_id}-${index}`}
              onClick={() => onPhotoClick(photo, index)}
              className="relative aspect-square overflow-hidden rounded-lg bg-gray-200 hover:opacity-90 active:opacity-75 transition-opacity duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group min-h-[120px]"
              aria-label={`View ${photo.title || "hotel"} photo, image ${
                index + 1
              } of ${photos.length}`}
              type="button"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={`${
                  photo.title || "Hotel photo"
                } - Click to view full size`}
                className="absolute inset-0 w-full h-full object-cover bg-gray-200"
                loading="lazy"
                onError={(e) => {
                  console.error(
                    "Image failed to load:",
                    imageUrl,
                    "Original:",
                    photo.url
                  );
                  const target = e.target as HTMLImageElement;
                  // Show placeholder instead of hiding
                  target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3EImage unavailable%3C/text%3E%3C/svg%3E";
                  target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect width='400' height='400' fill='%23e5e7eb'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='16' fill='%239ca3af'%3EImage unavailable%3C/text%3E%3C/svg%3E";
                }}
              />
              {/* Overlay with category on hover/touch */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 group-active:bg-opacity-30 transition-all duration-150 flex items-end">
                <div className="w-full p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-150">
                  <p className="text-white text-xs font-medium truncate">
                    {photo.title}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  }
);
