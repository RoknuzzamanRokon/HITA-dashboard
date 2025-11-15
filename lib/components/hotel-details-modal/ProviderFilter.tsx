"use client";

import React from "react";
import { Search } from "lucide-react";

export interface ProviderFilterProps {
  hasFullDetailsFilter: boolean;
  onHasFullDetailsChange: (checked: boolean) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const ProviderFilter: React.FC<ProviderFilterProps> = ({
  hasFullDetailsFilter,
  onHasFullDetailsChange,
  searchQuery,
  onSearchChange,
}) => {
  return (
    <div className="space-y-4 mb-6">
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" aria-hidden="true" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search provider name..."
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg 
                     focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                     text-sm placeholder-gray-400"
          aria-label="Search providers by name"
        />
      </div>

      {/* Has Full Details Checkbox */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="has-full-details-filter"
          checked={hasFullDetailsFilter}
          onChange={(e) => onHasFullDetailsChange(e.target.checked)}
          className="h-4 w-4 text-blue-600 border-gray-300 rounded 
                     focus:ring-2 focus:ring-blue-500 cursor-pointer"
        />
        <label
          htmlFor="has-full-details-filter"
          className="ml-2 text-sm text-gray-700 cursor-pointer select-none"
        >
          Show only providers with full details
        </label>
      </div>
    </div>
  );
};
