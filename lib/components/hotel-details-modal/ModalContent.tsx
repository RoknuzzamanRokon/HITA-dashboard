"use client";

import React, { memo } from "react";

export interface ModalContentProps {
  children: React.ReactNode;
  isOpen: boolean;
}

export const ModalContent: React.FC<ModalContentProps> = memo(
  ({ children, isOpen }) => {
    return (
      <div
        className={`
        relative z-10 bg-white shadow-xl
        w-full overflow-hidden
        transition-all duration-300 ease-in-out
        
        /* Mobile: Full width bottom sheet (<640px) */
        max-sm:fixed max-sm:bottom-0 max-sm:left-0 max-sm:right-0
        max-sm:max-w-full max-sm:rounded-t-2xl max-sm:rounded-b-none
        max-sm:max-h-[90vh]
        ${isOpen ? "max-sm:translate-y-0" : "max-sm:translate-y-full"}
        max-sm:opacity-100
        
        /* Tablet: Centered modal (640-1024px) */
        sm:max-lg:w-[90%] sm:max-lg:max-w-[800px]
        sm:max-lg:mx-auto sm:max-lg:rounded-lg sm:max-lg:max-h-[90vh]
        ${
          isOpen
            ? "sm:max-lg:opacity-100 sm:max-lg:translate-y-0 sm:max-lg:scale-100"
            : "sm:max-lg:opacity-0 sm:max-lg:translate-y-4 sm:max-lg:scale-95"
        }
        
        /* Desktop: Centered modal with max width (>1024px) */
        lg:w-[80%] lg:max-w-[1200px]
        lg:mx-auto lg:rounded-lg lg:max-h-[90vh]
        ${
          isOpen
            ? "lg:opacity-100 lg:translate-y-0 lg:scale-100"
            : "lg:opacity-0 lg:translate-y-4 lg:scale-95"
        }
      `}
      >
        {children}
      </div>
    );
  }
);
