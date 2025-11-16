"use client";

import React, {
  useEffect,
  useRef,
  useCallback,
  useState,
  lazy,
  Suspense,
} from "react";
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
import { HotelDescription } from "./HotelDescription";
import { ContactInfo } from "./ContactInfo";
import { EnhancedLocationInfo } from "./EnhancedLocationInfo";
import { TabNavigation, type TabType } from "./TabNavigation";
import { TabContent } from "./TabContent";
import { HotelService } from "@/lib/api/hotels";
import { transformFullHotelDetails } from "@/lib/utils/hotel-details-transform";
import type { FullHotelDetails } from "@/lib/types/full-hotel-details";
import type { ApiError } from "@/lib/api/client";

// Lazy load heavy tab components
const RoomList = lazy(() =>
  import("./RoomList").then((module) => ({ default: module.RoomList }))
);
const FacilitiesList = lazy(() =>
  import("./FacilitiesList").then((module) => ({
    default: module.FacilitiesList,
  }))
);
const AmenitiesList = lazy(() =>
  import("./AmenitiesList").then((module) => ({
    default: module.AmenitiesList,
  }))
);
const CheckInOutInfo = lazy(() =>
  import("./CheckInOutInfo").then((module) => ({
    default: module.CheckInOutInfo,
  }))
);
const ChildPolicy = lazy(() =>
  import("./ChildPolicy").then((module) => ({ default: module.ChildPolicy }))
);
const PetPolicy = lazy(() =>
  import("./PetPolicy").then((module) => ({ default: module.PetPolicy }))
);
const SpecialInstructions = lazy(() =>
  import("./SpecialInstructions").then((module) => ({
    default: module.SpecialInstructions,
  }))
);
const ProvidersTab = lazy(() =>
  import("./ProvidersTab").then((module) => ({ default: module.ProvidersTab }))
);
const PhotosTab = lazy(() =>
  import("./PhotosTab").then((module) => ({ default: module.PhotosTab }))
);

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

  // Fetch hotel details - memoized with useCallback
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

  // Tab content loading fallback
  const TabLoadingFallback = () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );

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
          aria-describedby={
            isLoading
              ? "loading-status"
              : error
              ? "error-status"
              : "modal-content"
          }
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
              ittid={ittid}
              onClose={handleClose}
              closeButtonRef={closeButtonRef}
            />

            {/* Modal body with loading, error, and content states */}
            <div
              id="modal-content"
              className="overflow-y-auto max-h-[calc(90vh-60px)] sm:max-h-[calc(90vh-72px)] lg:max-h-[calc(90vh-80px)]"
              role="region"
              aria-label="Hotel information"
            >
              {isLoading && (
                <div
                  className="p-6"
                  id="loading-status"
                  role="status"
                  aria-live="polite"
                >
                  <span className="sr-only">
                    Loading hotel details, please wait...
                  </span>
                  <SkeletonLoader />
                </div>
              )}

              {error && !isLoading && (
                <div className="p-6" id="error-status">
                  <ErrorState
                    error={error}
                    ittid={ittid}
                    requestId={requestId}
                    onRetry={handleRetry}
                  />
                </div>
              )}

              {hotelData && !isLoading && !error && (
                <div className="space-y-0" role="document">
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
                      <div className="space-y-4 sm:space-y-6">
                        {/* Desktop: Two-column layout */}
                        <div className="lg:grid lg:grid-cols-2 lg:gap-6 space-y-4 lg:space-y-0">
                          {/* Left Column - Description and Details */}
                          <div className="space-y-4 sm:space-y-6">
                            {/* Hotel Description */}
                            {hotelData.primaryProvider?.full_details
                              ?.descriptions && (
                              <HotelDescription
                                descriptions={
                                  hotelData.primaryProvider.full_details
                                    .descriptions
                                }
                              />
                            )}

                            {/* Contact Info from Provider */}
                            {hotelData.primaryProvider?.full_details
                              ?.contacts && (
                              <div className="pt-4 border-t border-gray-200">
                                <ContactInfo
                                  contacts={
                                    hotelData.primaryProvider.full_details
                                      .contacts
                                  }
                                />
                              </div>
                            )}

                            {/* Fallback: Basic Info if no provider details */}
                            {!hotelData.primaryProvider?.full_details && (
                              <BasicInfo
                                basic={hotelData.basic}
                                contacts={hotelData.contacts}
                              />
                            )}
                          </div>

                          {/* Right Column - Location and Provider Info */}
                          <div className="space-y-4 sm:space-y-6">
                            {/* Enhanced Location Info from Provider */}
                            {hotelData.primaryProvider?.full_details
                              ?.address && (
                              <EnhancedLocationInfo
                                address={
                                  hotelData.primaryProvider.full_details.address
                                }
                              />
                            )}

                            {/* Fallback: Location Info if no provider details */}
                            {!hotelData.primaryProvider?.full_details && (
                              <LocationInfo
                                basic={hotelData.basic}
                                locations={hotelData.locations}
                              />
                            )}

                            {/* Provider Info */}
                            <div className="pt-4 border-t border-gray-200">
                              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                Provider Information
                              </h4>
                              <div className="space-y-1 text-xs sm:text-sm text-gray-700">
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
                                    {hotelData.primaryProvider.provider_name}{" "}
                                    (has full details)
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === "rooms" && (
                      <div>
                        {hotelData.primaryProvider?.full_details?.room_type ? (
                          <Suspense fallback={<TabLoadingFallback />}>
                            <RoomList
                              rooms={
                                hotelData.primaryProvider.full_details.room_type
                              }
                            />
                          </Suspense>
                        ) : (
                          <div className="text-center py-12 text-gray-500">
                            <p className="text-lg font-medium">
                              No Room Information
                            </p>
                            <p className="text-sm mt-2">
                              Room details are not available for this hotel.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "facilities" && (
                      <Suspense fallback={<TabLoadingFallback />}>
                        <div className="space-y-6">
                          {hotelData.primaryProvider?.full_details
                            ?.facilities ? (
                            <FacilitiesList
                              facilities={
                                hotelData.primaryProvider.full_details
                                  .facilities
                              }
                            />
                          ) : (
                            <div className="text-center py-8 text-gray-500">
                              <p className="text-sm">
                                No facilities information available
                              </p>
                            </div>
                          )}

                          {hotelData.primaryProvider?.full_details
                            ?.amenities && (
                            <div className="pt-4 border-t border-gray-200">
                              <AmenitiesList
                                amenities={
                                  hotelData.primaryProvider.full_details
                                    .amenities
                                }
                              />
                            </div>
                          )}
                        </div>
                      </Suspense>
                    )}

                    {activeTab === "policies" && (
                      <Suspense fallback={<TabLoadingFallback />}>
                        <div className="space-y-6">
                          {hotelData.primaryProvider?.full_details?.policies ? (
                            <>
                              {/* Check-In/Out Information */}
                              {(hotelData.primaryProvider.full_details.policies
                                .checkin ||
                                hotelData.primaryProvider.full_details.policies
                                  .checkout) && (
                                <CheckInOutInfo
                                  checkin={
                                    hotelData.primaryProvider.full_details
                                      .policies.checkin
                                  }
                                  checkout={
                                    hotelData.primaryProvider.full_details
                                      .policies.checkout
                                  }
                                />
                              )}

                              {/* Child Policy */}
                              {hotelData.primaryProvider.full_details.policies
                                .child_and_extra_bed_policy && (
                                <div className="pt-4 border-t border-gray-200">
                                  <ChildPolicy
                                    childPolicy={
                                      hotelData.primaryProvider.full_details
                                        .policies.child_and_extra_bed_policy
                                    }
                                  />
                                </div>
                              )}

                              {/* Pet Policy */}
                              {hotelData.primaryProvider.full_details.policies
                                .pets && (
                                <div className="pt-4 border-t border-gray-200">
                                  <PetPolicy
                                    petPolicy={
                                      hotelData.primaryProvider.full_details
                                        .policies.pets
                                    }
                                  />
                                </div>
                              )}

                              {/* Special Instructions */}
                              {hotelData.primaryProvider.full_details.policies
                                .remark && (
                                <div className="pt-4 border-t border-gray-200">
                                  <SpecialInstructions
                                    remark={
                                      hotelData.primaryProvider.full_details
                                        .policies.remark
                                    }
                                  />
                                </div>
                              )}

                              {/* No policies message if all are empty */}
                              {!hotelData.primaryProvider.full_details.policies
                                .checkin &&
                                !hotelData.primaryProvider.full_details.policies
                                  .checkout &&
                                !hotelData.primaryProvider.full_details.policies
                                  .child_and_extra_bed_policy &&
                                !hotelData.primaryProvider.full_details.policies
                                  .pets &&
                                !hotelData.primaryProvider.full_details.policies
                                  .remark && (
                                  <div className="text-center py-8 text-gray-500">
                                    <p className="text-sm">
                                      No policy information available
                                    </p>
                                  </div>
                                )}
                            </>
                          ) : (
                            <div className="text-center py-12 text-gray-500">
                              <p className="text-lg font-medium">
                                No Policy Information
                              </p>
                              <p className="text-sm mt-2">
                                Policy details are not available for this hotel.
                              </p>
                            </div>
                          )}
                        </div>
                      </Suspense>
                    )}

                    {activeTab === "providers" && (
                      <Suspense fallback={<TabLoadingFallback />}>
                        <ProvidersTab
                          providers={hotelData.providers}
                          totalSuppliers={hotelData.totalSuppliers}
                        />
                      </Suspense>
                    )}

                    {activeTab === "photos" && (
                      <Suspense fallback={<TabLoadingFallback />}>
                        <div>
                          {hotelData.primaryProvider?.full_details
                            ?.hotel_photo ? (
                            <PhotosTab
                              photos={
                                hotelData.primaryProvider.full_details
                                  .hotel_photo
                              }
                              providerName={
                                hotelData.primaryProvider.provider_name
                              }
                            />
                          ) : (
                            <div className="text-center py-12 text-gray-500">
                              <p className="text-lg font-medium">
                                No Photos Available
                              </p>
                              <p className="text-sm mt-2">
                                There are no photos available for this hotel.
                              </p>
                            </div>
                          )}
                        </div>
                      </Suspense>
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
