"use client";

import React, { useState } from "react";
import type { HotelPhoto } from "@/lib/types/full-hotel-details";

interface PhotoItemProps {
  photo: HotelPhoto;
  index: number;
  totalPhotos: number;
  onPhotoClick: (photo: HotelPhoto, index: number) => void;
}

export const PhotoItem: React.FC<PhotoItemProps> = ({
  photo,
  index,
  totalPhotos,
  onPhotoClick,
}) => {
  const [imageError, setImageError] = useState(false);

  // Normalize image URL - EXACT same as Lightbox
  const normalizeImageUrl = (url: string) => {
    return url.replace(/^http:\/\//i, "https://");
  };

  const imageUrl = normalizeImageUrl(photo.url);

  return (
    <button
      onClick={() => onPhotoClick(photo, index)}
      className="relative aspect-square overflow-hidden rounded-lg bg-gray-200 hover:opacity-90 active:opacity-75 transition-opacity duration-150 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 group min-h-[200px]"
      aria-label={`View ${photo.title || "hotel"} photo, image ${
        index + 1
      } of ${totalPhotos}`}
      type="button"
    >
      {!imageError ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt={`${photo.title || "Hotel photo"} - Click to view full size`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.dataset.errorHandled) {
                target.dataset.errorHandled = "true";
                setImageError(true);
              }
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
        </>
      ) : (
        /* Show placeholder if image fails */
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-4">
            <svg
              className="w-12 h-12 mx-auto text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="text-xs text-gray-500 mt-2">Image unavailable</p>
          </div>
        </div>
      )}
    </button>
  );
};
