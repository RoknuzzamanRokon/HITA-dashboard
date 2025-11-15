"use client";

import React from "react";
import { X } from "lucide-react";

export interface ModalHeaderProps {
  hotelName?: string;
  onClose: () => void;
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({
  hotelName,
  onClose,
  closeButtonRef,
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-200">
      <h1
        id="modal-title"
        className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate pr-2 sm:pr-4"
        role="heading"
        aria-level={1}
      >
        {hotelName || "Hotel Details"}
      </h1>

      <button
        ref={closeButtonRef}
        onClick={onClose}
        className="flex-shrink-0 min-w-[44px] min-h-[44px] p-2 sm:p-2.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
        aria-label="Close hotel details"
        type="button"
      >
        <X className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600" aria-hidden="true" />
      </button>
    </div>
  );
};
