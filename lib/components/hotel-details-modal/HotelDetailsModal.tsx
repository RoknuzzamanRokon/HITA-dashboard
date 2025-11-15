"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import FocusLock from "react-focus-lock";
import { RemoveScroll } from "react-remove-scroll";
import { ModalOverlay } from "./ModalOverlay";
import { ModalContent } from "./ModalContent";
import { ModalHeader } from "./ModalHeader";
import { SkeletonLoader } from "./SkeletonLoader";
import { ErrorState } from "./ErrorState";
import { HeroSection } from "./HeroSection";
import { BasicInfo } from "./BasicInfo";
import { LocationInfo } from "./LocationInfo";
import { TabNavigation, type TabType } from "./TabNavigation";
import { TabContent } from "./TabContent";
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
  const [activeTab, setActiveTab] = useState<TabType>("overview");
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

  // Handle tab change
  const handleTabChange = useCallback((tab: TabType) => {
    setActiveTab(tab);
  }, []);

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
    setActiveTab("overview");

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
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              {isLoading && (
                <div className="p-6">
                  <SkeletonLoader />
                </div>
              )}

              {error && !isLoading && (
                <div className="p-6">
                  <ErrorState
                    error={error}
                    ittid={ittid}
                    requestId={requestId}
                    onRetry={handleRetry}
                  />
                </div>
              )}

              {hotelData && !isLoading && !error && (
                <div className="space-y-0">
                  {/* Hero Section */}
                  <HeroSection
                    primaryPhoto={hotelData.basic.primary_photo}
                    hotelName={hotelData.basic.name}
                    rating={hotelData.basic.rating}
                  />

                  {/* Tab Navigation */}
                  <TabNavigation
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                  />

                  {/* Tab Content */}
                  <TabContent activeTab={activeTab}>
                    {activeTab === "overview" && (
                      <div className="space-y-6">
                        {/* Basic Info */}
                        <BasicInfo
                          basic={hotelData.basic}
                          contacts={hotelData.contacts}
                        />

                        {/* Location Info */}
                        <LocationInfo
                          basic={hotelData.basic}
                          locations={hotelData.locations}
                        />

                        {/* Provider Info - Temporary until Providers tab is implemented */}
                        <div className="pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-semibold text-gray-900 mb-2">
                            Provider Information
                          </h4>
                          <div className="space-y-1 text-sm text-gray-700">
                            <p>
                              <span className="font-medium">
                                Total Suppliers:
                              </span>{" "}
                              {hotelData.totalSuppliers}
                            </p>
                            <p>
                              <span className="font-medium">
                                Available Providers:
                              </span>{" "}
                              {hotelData.availableProviders.join(", ")}
                            </p>
                            {hotelData.primaryProvider && (
                              <p className="text-green-600 font-medium">
                                Primary Provider:{" "}
                                {hotelData.primaryProvider.provider_name} (has
                                full details)
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "rooms" && (
                      <div className="text-center py-12 text-gray-500">
                        <p className="text-lg font-medium">Rooms Tab</p>
                        <p className="text-sm mt-2">
                          Room details will be implemented in task 8
                        </p>
                      </div>
                    )}

                    {activeTab === "facilities" && (
                      <div className="text-center py-12 text-gray-500">
                        <p className="text-lg font-medium">Facilities Tab</p>
                        <p className="text-sm mt-2">
                          Facilities will be implemented in task 9
                        </p>
                      </div>
                    )}

                    {activeTab === "policies" && (
                      <div className="text-center py-12 text-gray-500">
                        <p className="text-lg font-medium">Policies Tab</p>
                        <p className="text-sm mt-2">
                          Policies will be implemented in task 10
                        </p>
                      </div>
                    )}

                    {activeTab === "providers" && (
                      <div className="text-center py-12 text-gray-500">
                        <p className="text-lg font-medium">Providers Tab</p>
                        <p className="text-sm mt-2">
                          Provider details will be implemented in task 11
                        </p>
                      </div>
                    )}

                    {activeTab === "photos" && (
                      <div className="text-center py-12 text-gray-500">
                        <p className="text-lg font-medium">Photos Tab</p>
                        <p className="text-sm mt-2">
                          Photo gallery will be implemented in task 12
                        </p>
                      </div>
                    )}
                  </TabContent>
                </div>
              )}
            </div>
          </ModalContent>
        </div>
      </FocusLock>
    </RemoveScroll>
  );
};
