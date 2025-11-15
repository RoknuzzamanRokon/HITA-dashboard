"use client";

import React, { useEffect, useCallback, useRef, useState } from "react";
import FocusLock from "react-focus-lock";
import { RemoveScroll } from "react-remove-scroll";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import type { HotelPhoto } from "@/lib/types/full-hotel-details";

export interface LightboxProps {
  isOpen: boolean;
  photos: HotelPhoto[];
  currentIndex: number;
  onClose: () => void;
  providerName?: string;
}

export const Lightbox: React.FC<LightboxProps> = ({
  isOpen,
  photos,
  currentIndex,
  onClose,
  providerName = "Provider",
}) => {
  const [activeIndex, setActiveIndex] = useState(currentIndex);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Update active index when currentIndex prop changes
  useEffect(() => {
    if (isOpen) {
      setActiveIndex(currentIndex);
    }
  }, [currentIndex, isOpen]);

  // Preload next image
  useEffect(() => {
    if (isOpen && photos.length > 1) {
      const nextIndex = (activeIndex + 1) % photos.length;
      const nextPhoto = photos[nextIndex];
      if (nextPhoto) {
        const img = new window.Image();
        img.src = nextPhoto.url;
      }
    }
  }, [activeIndex, photos, isOpen]);

  const currentPhoto = photos[activeIndex];

  const handlePrevious = useCallback(() => {
    setActiveIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  }, [photos.length]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          event.preventDefault();
          handlePrevious();
          break;
        case "ArrowRight":
          event.preventDefault();
          handleNext();
          break;
      }
    },
    [isOpen, onClose, handlePrevious, handleNext]
  );

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrevious();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  // Set up keyboard event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);

      // Focus close button when lightbox opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen || !currentPhoto) {
    return null;
  }

  return (
    <RemoveScroll>
      <FocusLock returnFocus={true}>
        <div
          className="fixed inset-0 z-[60] bg-black"
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Close button */}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white"
            aria-label="Close image viewer"
            type="button"
          >
            <X className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Image counter */}
          <div
            className="absolute top-4 left-4 z-10 px-3 py-1 bg-black/50 text-white text-sm rounded-full"
            role="status"
            aria-live="polite"
            aria-label={`Viewing image ${activeIndex + 1} of ${photos.length}`}
          >
            <span aria-hidden="true">
              {activeIndex + 1} / {photos.length}
            </span>
          </div>

          {/* Previous button */}
          {photos.length > 1 && (
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={`Previous image (${activeIndex} of ${photos.length})`}
              type="button"
            >
              <ChevronLeft className="h-8 w-8" aria-hidden="true" />
            </button>
          )}

          {/* Next button */}
          {photos.length > 1 && (
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-white"
              aria-label={`Next image (${activeIndex + 2} of ${photos.length})`}
              type="button"
            >
              <ChevronRight className="h-8 w-8" aria-hidden="true" />
            </button>
          )}

          {/* Main image container */}
          <div className="flex items-center justify-center h-full p-4 md:p-8">
            <div className="relative w-full h-full max-w-7xl max-h-full">
              <Image
                src={currentPhoto.url}
                alt={`${
                  currentPhoto.title || "Hotel photo"
                } - Full size view, image ${activeIndex + 1} of ${
                  photos.length
                }`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Caption */}
          <div
            className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent"
            role="region"
            aria-label="Image caption"
          >
            <div className="max-w-7xl mx-auto">
              <p className="text-white text-lg font-medium">
                {currentPhoto.title}
              </p>
              <p className="text-gray-300 text-sm mt-1">
                Source: {providerName}
              </p>
            </div>
          </div>
        </div>
      </FocusLock>
    </RemoveScroll>
  );
};
