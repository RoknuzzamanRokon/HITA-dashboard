"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import FocusLock from "react-focus-lock";
import { RemoveScroll } from "react-remove-scroll";
import { ModalOverlay } from "./ModalOverlay";
import { ModalContent } from "./ModalContent";
import { ModalHeader } from "./ModalHeader";
import { SkeletonLoader } from "./SkeletonLoader";
import { ErrorState } from "./ErrorState";
import { HotelService } from "@/lib/api/hotels";
import { transformFullHotelDetails } from "@/lib/utils/hotel-details-transform";
import type { FullHotelDetails } from "@/lib/types/full-hotel-details";
import type { ApiError } from "@/lib/api/client";

export interface HotelDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ittid: string;
  hotelName?: string;
  triggerRef?: React.RefObject<HTMLElement>;
}

export const HotelDetailsModal: React.FC<HotelDetailsModalProps> = ({
  isOpen,
  onClose,
  ittid,
  hotelName,
  triggerRef,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // State management
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [hotelData, setHotelData] = useState<FullHotelDetails | null>(null);
  const [requestId] = useState<string>(
    () => `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  // Fetch hotel details
  const fetchHotelDetails = useCallback(async () => {
    if (!ittid) return;

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);
    setHotelData(null);

    try {
      console.log(`🔄 Fetching hotel details for ittid: ${ittid}`);

      const response = await HotelService.getFullHotelDetails(
        ittid,
        abortControllerRef.current.signal
      );

      // Check if request was cancelled
      if (abortControllerRef.current.signal.aborted) {
        console.log("Request was cancelled");
        return;
      }

      if (response.success && response.data) {
        console.log("✅ Successfully fetched hotel details");
        const transformedData = transformFullHotelDetails(response.data);
        setHotelData(transformedData);
        setError(null);
      } else {
        console.error("❌ Failed to fetch hotel details:", response.error);
        setError(
          response.error || {
            status: 0,
            message: "Unknown error occurred",
          }
        );
        setHotelData(null);
      }
    } catch (err) {
      console.error("❌ Error fetching hotel details:", err);
      setError({
        status: 0,
        message:
          err instanceof Error ? err.message : "Failed to fetch hotel details",
        details: err,
      });
      setHotelData(null);
    } finally {
      setIsLoading(false);
    }
  }, [ittid]);

  // Handle retry
  const handleRetry = useCallback(() => {
    fetchHotelDetails();
  }, [fetchHotelDetails]);

  // Handle Escape key press
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  // Handle overlay click
  const handleOverlayClick = useCallback(() => {
    onClose();
  }, [onClose]);

  // Handle modal close with cleanup
  const handleClose = useCallback(() => {
    // Cancel any pending API requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Reset state
    setIsLoading(false);
    setError(null);
    setHotelData(null);

    // Call parent onClose
    onClose();
  }, [onClose]);

  // Fetch data when modal opens
  useEffect(() => {
    if (isOpen && ittid) {
      fetchHotelDetails();
    }

    // Cleanup on unmount or when modal closes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
    };
  }, [isOpen, ittid, fetchHotelDetails]);

  // Set up event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscapeKey);

      // Focus the close button when modal opens
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 100);
    }

    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, handleEscapeKey]);

  // Return focus to trigger element when modal closes
  useEffect(() => {
    if (!isOpen && triggerRef?.current) {
      triggerRef.current.focus();
    }
  }, [isOpen, triggerRef]);

  if (!isOpen) {
    return null;
  }

  return (
    <RemoveScroll>
      <FocusLock returnFocus={false}>
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-label={
            hotelName ? `Hotel details for ${hotelName}` : "Hotel details"
          }
          aria-busy={isLoading}
          ref={modalRef}
        >
          <ModalOverlay onClick={handleOverlayClick} isOpen={isOpen} />

          <ModalContent isOpen={isOpen}>
            <ModalHeader
              hotelName={hotelName || hotelData?.basic?.name}
              onClose={handleClose}
              closeButtonRef={closeButtonRef}
            />

            {/* Modal body with loading, error, and content states */}
            <div className="p-6">
              {isLoading && <SkeletonLoader />}

              {error && !isLoading && (
                <ErrorState
                  error={error}
                  ittid={ittid}
                  requestId={requestId}
                  onRetry={handleRetry}
                />
              )}

              {hotelData && !isLoading && !error && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {hotelData.basic.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      ITTID: {hotelData.basic.ittid}
                    </p>
                    <p className="text-sm text-gray-600">
                      Property Type: {hotelData.basic.property_type}
                    </p>
                    <p className="text-sm text-gray-600">
                      Rating: {hotelData.basic.rating} stars
                    </p>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-2">
                      Address
                    </h4>
                    <p className="text-sm text-gray-600">
                      {hotelData.basic.address_line1}
                    </p>
                    {hotelData.basic.address_line2 && (
                      <p className="text-sm text-gray-600">
                        {hotelData.basic.address_line2}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {hotelData.basic.postal_code}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-2">
                      Providers
                    </h4>
                    <p className="text-sm text-gray-600">
                      Total Suppliers: {hotelData.totalSuppliers}
                    </p>
                    <p className="text-sm text-gray-600">
                      Available Providers:{" "}
                      {hotelData.availableProviders.join(", ")}
                    </p>
                    {hotelData.primaryProvider && (
                      <p className="text-sm text-green-600 font-medium">
                        Primary Provider:{" "}
                        {hotelData.primaryProvider.provider_name} (has full
                        details)
                      </p>
                    )}
                  </div>

                  <p className="text-sm text-gray-500 italic">
                    Detailed content tabs will be implemented in future tasks...
                  </p>
                </div>
              )}
            </div>
          </ModalContent>
        </div>
      </FocusLock>
    </RemoveScroll>
  );
};
