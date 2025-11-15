"use client";

import React, {
  useState,
  useMemo,
  lazy,
  Suspense,
  memo,
  useCallback,
} from "react";
import { CategoryFilter, type PhotoCategory } from "./CategoryFilter";
import { PhotoGrid } from "./PhotoGrid";
import type { HotelPhoto } from "@/lib/types/full-hotel-details";

// Lazy load Lightbox component
const Lightbox = lazy(() =>
  import("./Lightbox").then((module) => ({ default: module.Lightbox }))
);

export interface PhotosTabProps {
  photos: HotelPhoto[];
  providerName?: string;
}

export const PhotosTab: React.FC<PhotosTabProps> = memo(
  ({ photos, providerName }) => {
    console.log("PhotosTab received photos:", photos?.length, photos);

    const [activeCategory, setActiveCategory] = useState<PhotoCategory>("All");
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Get unique categories from photos
    const availableCategories = useMemo(() => {
      const categories = new Set<PhotoCategory>();
      photos.forEach((photo) => {
        if (photo.title) {
          categories.add(photo.title as PhotoCategory);
        }
      });
      return Array.from(categories);
    }, [photos]);

    // Filter photos by active category
    const filteredPhotos = useMemo(() => {
      if (activeCategory === "All") {
        return photos;
      }
      return photos.filter((photo) => photo.title === activeCategory);
    }, [photos, activeCategory]);

    // Memoize event handlers
    const handlePhotoClick = useCallback((photo: HotelPhoto, index: number) => {
      setLightboxIndex(index);
      setLightboxOpen(true);
    }, []);

    const handleCloseLightbox = useCallback(() => {
      setLightboxOpen(false);
    }, []);

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
      <div>
        <CategoryFilter
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
          availableCategories={availableCategories}
        />

        <PhotoGrid photos={filteredPhotos} onPhotoClick={handlePhotoClick} />

        {/* Lazy load Lightbox with Suspense boundary */}
        {lightboxOpen && (
          <Suspense
            fallback={
              <div className="fixed inset-0 z-[60] bg-black flex items-center justify-center">
                <div className="text-white text-lg">Loading...</div>
              </div>
            }
          >
            <Lightbox
              isOpen={lightboxOpen}
              photos={filteredPhotos}
              currentIndex={lightboxIndex}
              onClose={handleCloseLightbox}
              providerName={providerName}
            />
          </Suspense>
        )}
      </div>
    );
  }
);
