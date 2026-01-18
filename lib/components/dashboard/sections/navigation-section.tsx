/**
 * Navigation Section Component
 * Role-based navigation features
 */

"use client";

import React from "react";
import { RoleBasedNav } from "@/lib/components/navigation/role-based-nav";

export function NavigationSection() {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-[rgb(var(--text-primary))] mb-4">
        Available Features
      </h2>
      <RoleBasedNav variant="grid" />
    </div>
  );
}
