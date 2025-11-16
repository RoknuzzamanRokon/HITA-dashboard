"use client";

import React, { memo, useState } from "react";
import { X, Copy, Check } from "lucide-react";

export interface ModalHeaderProps {
  hotelName?: string;
  ittid?: string;
  onClose: () => void;
  closeButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

export const ModalHeader: React.FC<ModalHeaderProps> = memo(
  ({ hotelName, ittid, onClose, closeButtonRef }) => {
    const [copied, setCopied] = useState(false);

    const handleCopyIttid = async () => {
      if (ittid) {
        try {
          await navigator.clipboard.writeText(ittid);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (err) {
          console.error("Failed to copy ITTID:", err);
        }
      }
    };

    return (
      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4">
          <div className="flex-1 min-w-0 pr-2 sm:pr-4">
            <h1
              id="modal-title"
              className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate"
              role="heading"
              aria-level={1}
            >
              {hotelName || "Hotel Details"}
            </h1>
            {ittid && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs sm:text-sm text-gray-500">
                  ITTID:{" "}
                  <span className="font-mono text-gray-700">{ittid}</span>
                </span>
                <button
                  onClick={handleCopyIttid}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-label={copied ? "ITTID copied" : "Copy ITTID"}
                  type="button"
                >
                  {copied ? (
                    <>
                      <Check
                        className="h-3 w-3 text-green-600"
                        aria-hidden="true"
                      />
                      <span className="text-green-600">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy
                        className="h-3 w-3 text-gray-600"
                        aria-hidden="true"
                      />
                      <span className="text-gray-600">Copy</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="flex-shrink-0 min-w-[44px] min-h-[44px] p-2 sm:p-2.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
            aria-label="Close hotel details"
            type="button"
          >
            <X
              className="h-5 w-5 sm:h-6 sm:w-6 text-gray-600"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    );
  }
);
