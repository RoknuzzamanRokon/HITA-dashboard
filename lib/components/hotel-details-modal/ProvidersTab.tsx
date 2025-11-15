"use client";

import React, { useState, useMemo } from "react";
import { ProviderFilter } from "./ProviderFilter";
import { ProviderTable } from "./ProviderTable";
import type { ProviderMappingDetail } from "@/lib/types/full-hotel-details";

export interface ProvidersTabProps {
  providers: ProviderMappingDetail[];
  totalSuppliers: number;
}

export const ProvidersTab: React.FC<ProvidersTabProps> = ({
  providers,
  totalSuppliers,
}) => {
  const [hasFullDetailsFilter, setHasFullDetailsFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter providers based on search and full details filter
  const filteredProviders = useMemo(() => {
    let filtered = providers;

    // Apply full details filter
    if (hasFullDetailsFilter) {
      filtered = filtered.filter((p) => p.full_details !== null);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((p) =>
        p.provider_name.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [providers, hasFullDetailsFilter, searchQuery]);

  return (
    <div className="space-y-6">
      <ProviderFilter
        hasFullDetailsFilter={hasFullDetailsFilter}
        onHasFullDetailsChange={setHasFullDetailsFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <ProviderTable
        providers={filteredProviders}
        totalSuppliers={totalSuppliers}
      />
    </div>
  );
};
