"use client";

import React, { memo } from "react";

export interface ModalOverlayProps {
  onClick: () => void;
  isOpen: boolean;
}

export const ModalOverlay: React.FC<ModalOverlayProps> = memo(
  ({ onClick, isOpen }) => {
    return (
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ${
          isOpen ? "opacity-50" : "opacity-0"
        }`}
        onClick={onClick}
        aria-hidden="true"
      />
    );
  }
);
