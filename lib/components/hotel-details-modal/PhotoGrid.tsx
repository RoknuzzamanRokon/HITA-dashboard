"use client";

import React, { memo } from "react";
import type { HotelPhoto } from "@/lib/types/full-hotel-details";
import { PhotoItem } from "./PhotoItem";

export interface PhotoGridProps {
  photos: HotelPhoto[];
  onPhotoClick: (photo: HotelPhoto, index: number) => void;
}

export const PhotoGrid: React.FC<PhotoGridProps> = memo(
  ({ photos, onPhotoClick }) => {
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
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {photos.map((photo, index) => (
          <PhotoItem
            key={`${photo.picture_id}-${index}`}
            photo={photo}
            index={index}
            totalPhotos={photos.length}
            onPhotoClick={onPhotoClick}
          />
        ))}
      </div>
    );
  }
);
