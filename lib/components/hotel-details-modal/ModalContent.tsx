"use client";

import React from "react";

export interface ModalContentProps {
  children: React.ReactNode;
  isOpen: boolean;
}

export const ModalContent: React.FC<ModalContentProps> = ({
  children,
  isOpen,
}) => {
  return (
    <div
      className={`
        relative z-10 bg-white rounded-lg shadow-xl
        w-full max-w-[1200px] max-h-[90vh]
        overflow-hidden
        transition-all duration-300 ease-in-out
        ${
          isOpen
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95"
        }
        
        /* Mobile: Full width bottom sheet */
        max-[640px]:fixed max-[640px]:bottom-0 max-[640px]:left-0 max-[640px]:right-0
        max-[640px]:max-w-full max-[640px]:rounded-t-lg max-[640px]:rounded-b-none
        max-[640px]:max-h-[85vh]
        ${isOpen ? "max-[640px]:translate-y-0" : "max-[640px]:translate-y-full"}
        
        /* Tablet: Centered modal */
        min-[640px]:max-[1024px]:w-[90%] min-[640px]:max-[1024px]:max-w-[800px]
        min-[640px]:mx-4
        
        /* Desktop: Centered modal with max width */
        min-[1024px]:w-[80%] min-[1024px]:mx-8
      `}
    >
      {children}
    </div>
  );
};
