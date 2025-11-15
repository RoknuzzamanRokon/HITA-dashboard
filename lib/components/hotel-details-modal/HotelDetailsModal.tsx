"use client";

import React, { useEffect, useRef, useCallback } from "react";
import FocusLock from "react-focus-lock";
import { RemoveScroll } from "react-remove-scroll";
import { ModalOverlay } from "./ModalOverlay";
import { ModalContent } from "./ModalContent";
import { ModalHeader } from "./ModalHeader";

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
          ref={modalRef}
        >
          <ModalOverlay onClick={handleOverlayClick} isOpen={isOpen} />

          <ModalContent isOpen={isOpen}>
            <ModalHeader
              hotelName={hotelName}
              onClose={onClose}
              closeButtonRef={closeButtonRef}
            />

            {/* Modal body will be added in future tasks */}
            <div className="p-6">
              <p className="text-gray-600">ITTID: {ittid}</p>
              <p className="text-gray-500 mt-2">
                Content loading will be implemented in the next tasks...
              </p>
            </div>
          </ModalContent>
        </div>
      </FocusLock>
    </RemoveScroll>
  );
};
