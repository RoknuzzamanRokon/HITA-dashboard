/**
 * Skip Link Component
 *
 * Provides a skip navigation link for screen readers and keyboard users
 * to jump directly to main content, bypassing navigation elements.
 *
 * Requirements: 9.5, 9.6
 */

"use client";

import React from "react";

export interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

export function SkipLink({ href, children }: SkipLinkProps) {
  return (
    <a
      href={href}
      className="
        sr-only focus:not-sr-only
        fixed top-4 left-4
        bg-blue-600 text-white
        px-4 py-2 rounded-lg
        font-medium text-sm
        focus:outline-none focus:ring-4 focus:ring-blue-300
        transition-all duration-200
      "
      style={{ zIndex: 10000 }}
    >
      {children}
    </a>
  );
}
