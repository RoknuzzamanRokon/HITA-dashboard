"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Star } from "lucide-react";

export interface HeroSectionProps {
  primaryPhoto?: string;
  hotelName: string;
  rating?: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  primaryPhoto,
  hotelName,
  rating,
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Parse rating to number
  const numericRating = rating ? parseFloat(rating) : 0;
  const fullStars = Math.floor(numericRating);
  const hasHalfStar = numericRating % 1 >= 0.5;

  // Determine if we should show the image or placeholder
  const showImage = primaryPhoto && !imageError;

  return (
    <div className="relative w-full overflow-hidden bg-gray-100">
      {/* Hero Image Container with responsive aspect ratios */}
      <div
        className="
          relative w-full
          aspect-[4/3]
          sm:aspect-[16/9]
        "
      >
        {showImage ? (
          <>
            {/* Loading placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}

            {/* Actual image */}
            <Image
              src={primaryPhoto}
              alt={`${hotelName} - Primary photo`}
              fill
              className={`
                object-cover
                transition-opacity duration-300
                ${imageLoaded ? "opacity-100" : "opacity-0"}
              `}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              priority
              loading="eager"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(false);
              }}
            />
          </>
        ) : (
          /* Fallback placeholder */
          <div
            className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300"
            role="img"
            aria-label={`${hotelName} - No primary photo available`}
          >
            <div className="text-center p-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-gray-400 flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
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
              <p
                className="text-sm text-gray-600 font-medium"
                aria-hidden="true"
              >
                No image available
              </p>
            </div>
          </div>
        )}

        {/* Overlay with hotel name and rating */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
          <h2
            className="text-2xl sm:text-3xl font-bold text-white mb-2 drop-shadow-lg"
            id="modal-title"
          >
            {hotelName}
          </h2>

          {/* Star rating display */}
          {numericRating > 0 && (
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1"
                aria-label={`${numericRating} star rating`}
              >
                {[...Array(5)].map((_, index) => {
                  if (index < fullStars) {
                    // Full star
                    return (
                      <Star
                        key={index}
                        className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        aria-hidden="true"
                      />
                    );
                  } else if (index === fullStars && hasHalfStar) {
                    // Half star
                    return (
                      <div key={index} className="relative w-5 h-5">
                        <Star
                          className="absolute inset-0 w-5 h-5 text-yellow-400"
                          aria-hidden="true"
                        />
                        <div className="absolute inset-0 overflow-hidden w-1/2">
                          <Star
                            className="w-5 h-5 fill-yellow-400 text-yellow-400"
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    );
                  } else {
                    // Empty star
                    return (
                      <Star
                        key={index}
                        className="w-5 h-5 text-yellow-400"
                        aria-hidden="true"
                      />
                    );
                  }
                })}
              </div>
              <span className="text-white font-semibold text-lg drop-shadow-lg">
                {numericRating.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
