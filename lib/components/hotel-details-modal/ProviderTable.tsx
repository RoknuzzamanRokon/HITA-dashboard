"use client";

import React, { useState } from "react";
import { Check, X, ChevronUp, ChevronDown } from "lucide-react";
import type { ProviderMappingDetail } from "@/lib/types/full-hotel-details";
import {
  getDisplayTimestamp,
  formatISOTimestamp,
} from "@/lib/utils/timestamp-formatter";

export interface ProviderTableProps {
  providers: ProviderMappingDetail[];
  totalSuppliers: number;
}

type SortColumn =
  | "provider_name"
  | "provider_id"
  | "has_full_details"
  | "updated_at";
type SortOrder = "asc" | "desc";

export const ProviderTable: React.FC<ProviderTableProps> = ({
  providers,
  totalSuppliers,
}) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>("provider_name");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Handle column sort
  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortOrder("asc");
    }
  };

  // Sort providers
  const sortedProviders = [...providers].sort((a, b) => {
    let comparison = 0;

    switch (sortColumn) {
      case "provider_name":
        comparison = a.provider_name.localeCompare(b.provider_name);
        break;
      case "provider_id":
        comparison = a.provider_id.localeCompare(b.provider_id);
        break;
      case "has_full_details":
        const aHasDetails = a.full_details ? 1 : 0;
        const bHasDetails = b.full_details ? 1 : 0;
        comparison = aHasDetails - bHasDetails;
        break;
      case "updated_at":
        const aTime = new Date(a.updated_at).getTime();
        const bTime = new Date(b.updated_at).getTime();
        comparison = aTime - bTime;
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  // Count providers with full details
  const providersWithFullDetails = providers.filter(
    (p) => p.full_details
  ).length;

  // Render sort icon
  const renderSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) {
      return null;
    }
    return sortOrder === "asc" ? (
      <ChevronUp className="h-4 w-4 inline ml-1" aria-hidden="true" />
    ) : (
      <ChevronDown className="h-4 w-4 inline ml-1" aria-hidden="true" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between text-sm">
        <p className="text-gray-700">
          <span className="font-semibold">{totalSuppliers}</span> total
          suppliers
        </p>
        <p className="text-gray-700">
          <span className="font-semibold text-green-600">
            {providersWithFullDetails}
          </span>{" "}
          with full details
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort("provider_name")}
                aria-sort={
                  sortColumn === "provider_name"
                    ? sortOrder === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                Provider Name
                {renderSortIcon("provider_name")}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort("provider_id")}
                aria-sort={
                  sortColumn === "provider_id"
                    ? sortOrder === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                Provider ID
                {renderSortIcon("provider_id")}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort("has_full_details")}
                aria-sort={
                  sortColumn === "has_full_details"
                    ? sortOrder === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                Full Details
                {renderSortIcon("has_full_details")}
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
                onClick={() => handleSort("updated_at")}
                aria-sort={
                  sortColumn === "updated_at"
                    ? sortOrder === "asc"
                      ? "ascending"
                      : "descending"
                    : "none"
                }
              >
                Last Updated
                {renderSortIcon("updated_at")}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedProviders.map((provider) => {
              const hasFullDetails = !!provider.full_details;
              const displayTimestamp = getDisplayTimestamp(provider.updated_at);
              const isoTimestamp = formatISOTimestamp(provider.updated_at);

              return (
                <tr
                  key={provider.id}
                  className={`hover:bg-gray-50 ${
                    hasFullDetails ? "bg-green-50/30" : ""
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {provider.provider_name}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 font-mono">
                    {provider.provider_id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {hasFullDetails ? (
                      <span className="inline-flex items-center text-green-600">
                        <Check className="h-5 w-5 mr-1" aria-hidden="true" />
                        <span className="font-medium">Yes</span>
                        <span className="sr-only">Has full details</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-gray-400">
                        <X className="h-5 w-5 mr-1" aria-hidden="true" />
                        <span>No</span>
                        <span className="sr-only">No full details</span>
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                    <span
                      title={isoTimestamp}
                      className="cursor-help border-b border-dotted border-gray-400"
                    >
                      {displayTimestamp}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Empty state */}
      {sortedProviders.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">No providers found</p>
        </div>
      )}
    </div>
  );
};
