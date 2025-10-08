/**
 * Hotel Search Interface Component
 * Provides search functionality with filters and results display
 */

"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Building,
  Calendar,
  Eye,
} from "lucide-react";
import { Input } from "@/lib/components/ui/input";
import { Button } from "@/lib/components/ui/button";
import { Card, CardContent, CardHeader } from "@/lib/components/ui/card";
import { Select } from "@/lib/components/ui/select";
import { DataTable, Column } from "@/lib/components/ui/data-table";
import { Badge } from "@/lib/components/ui/badge";
import { HotelService } from "@/lib/api/hotels";
import type { Hotel, HotelSearchParams, HotelFilters } from "@/lib/types/hotel";

interface HotelSearchProps {
  onHotelSelect?: (hotel: Hotel) => void;
  className?: string;
}

export function HotelSearch({ onHotelSelect, className }: HotelSearchProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [ratings, setRatings] = useState<string[]>([]);

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0,
  });

  // Store resume keys for each page to enable proper navigation
  const [resumeKeys, setResumeKeys] = useState<Record<number, string>>({});

  // Filter state
  const [filters, setFilters] = useState<HotelFilters>({});

  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load hotels when search params change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Always load hotels, even without search query (API provides default data)
      searchHotels();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, filters, pagination.page, pagination.pageSize]);

  const loadFilterOptions = async () => {
    try {
      const [propertyTypesResponse, ratingsResponse] = await Promise.all([
        HotelService.getPropertyTypes(),
        HotelService.getRatings(),
      ]);

      if (propertyTypesResponse.success && propertyTypesResponse.data) {
        setPropertyTypes(propertyTypesResponse.data);
      }

      if (ratingsResponse.success && ratingsResponse.data) {
        setRatings(ratingsResponse.data);
      }
    } catch (error) {
      console.error("Failed to load filter options:", error);
    }
  };

  const searchHotels = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get the resume key for the current page (if any)
      const currentResumeKey = resumeKeys[pagination.page];

      const searchParams: HotelSearchParams = {
        search: searchQuery.trim() || undefined,
        page: pagination.page,
        limit: pagination.pageSize,
        // Only include resumeKey if we have one for this page
        resumeKey: currentResumeKey,
        propertyType: filters.propertyType,
        rating: filters.rating,
        mapStatus: filters.mapStatus,
        sortBy: "name",
        sortOrder: "asc",
      };

      const response = await HotelService.searchHotels(searchParams);

      if (response.success && response.data) {
        const data = response.data; // Extract data to help TypeScript understand it's not undefined
        setHotels(data.hotels);
        setPagination((prev) => ({
          ...prev,
          total: data.total,
        }));

        // Store the resume key for the next page
        if (data.resumeKey) {
          setResumeKeys((prev) => ({
            ...prev,
            [pagination.page + 1]: data.resumeKey!,
          }));
        }
      } else {
        setError(response.error?.message || "Failed to search hotels");
        setHotels([]);
      }
    } catch (error) {
      setError("An unexpected error occurred");
      setHotels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    setResumeKeys({}); // Clear resume keys for new search
  };

  const handleFilterChange = (
    key: keyof HotelFilters,
    value: string | undefined
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value || undefined,
    }));
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to first page
    setResumeKeys({}); // Clear resume keys for new filter
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      page,
    }));
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination((prev) => ({
      ...prev,
      pageSize,
      page: 1,
    }));
    setResumeKeys({}); // Clear resume keys for new page size
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
    setPagination((prev) => ({ ...prev, page: 1 }));
    setResumeKeys({}); // Clear resume keys
  };

  // Define table columns
  const columns: Column<Hotel>[] = [
    {
      key: "name",
      label: "Hotel Name",
      sortable: true,
      render: (value, hotel) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{value}</span>
          <span className="text-sm text-gray-500">ITTID: {hotel.ittid}</span>
        </div>
      ),
    },
    {
      key: "addressLine1",
      label: "Location",
      render: (value, hotel) => (
        <div className="flex items-start space-x-2">
          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
          <div className="flex flex-col text-sm">
            {value && <span>{value}</span>}
            {hotel.addressLine2 && <span>{hotel.addressLine2}</span>}
            {hotel.postalCode && (
              <span className="text-gray-500">{hotel.postalCode}</span>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "rating",
      label: "Rating",
      render: (value) =>
        value ? (
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-sm font-medium">{value}</span>
          </div>
        ) : (
          <span className="text-gray-400 text-sm">No rating</span>
        ),
    },
    {
      key: "propertyType",
      label: "Property Type",
      render: (value) =>
        value ? (
          <Badge variant="secondary">
            <Building className="h-3 w-3 mr-1" />
            {value}
          </Badge>
        ) : (
          <span className="text-gray-400 text-sm">Unknown</span>
        ),
    },
    {
      key: "mapStatus",
      label: "Status",
      render: (value) => {
        const getStatusColor = (status: string) => {
          switch (status?.toLowerCase()) {
            case "mapped":
              return "success";
            case "unmapped":
              return "warning";
            case "pending":
              return "info";
            default:
              return "secondary";
          }
        };

        return (
          <Badge variant={getStatusColor(value || "")}>
            {value || "Unknown"}
          </Badge>
        );
      },
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      render: (value) => (
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: "ittid" as keyof Hotel,
      label: "Actions",
      render: (_, hotel) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onHotelSelect?.(hotel)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={className}>
      <Card>
        <CardHeader
          title="Hotel Search"
          subtitle="Search and filter hotels by name, location, or other criteria"
          actions={
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          }
        />

        <CardContent className="space-y-6">
          {/* Search Input */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search hotels by name, ITTID, or location..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                leftIcon={<Search className="h-4 w-4" />}
              />
            </div>
            {(searchQuery || Object.keys(filters).length > 0) && (
              <Button variant="outline" onClick={clearFilters}>
                Clear
              </Button>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
              <Select
                label="Property Type"
                value={filters.propertyType || ""}
                onChange={(value) => {
                  const stringValue =
                    typeof value === "string"
                      ? value
                      : (value as any)?.target?.value || "";
                  handleFilterChange("propertyType", stringValue);
                }}
                options={[
                  { value: "", label: "All Property Types" },
                  ...propertyTypes.map((type) => ({
                    value: type,
                    label: type,
                  })),
                ]}
              />

              <Select
                label="Rating"
                value={filters.rating || ""}
                onChange={(value) => {
                  const stringValue =
                    typeof value === "string"
                      ? value
                      : (value as any)?.target?.value || "";
                  handleFilterChange("rating", stringValue);
                }}
                options={[
                  { value: "", label: "All Ratings" },
                  ...ratings.map((rating) => ({
                    value: rating,
                    label: `${rating} Star${rating !== "1" ? "s" : ""}`,
                  })),
                ]}
              />

              <Select
                label="Map Status"
                value={filters.mapStatus || ""}
                onChange={(value) => {
                  const stringValue =
                    typeof value === "string"
                      ? value
                      : (value as any)?.target?.value || "";
                  handleFilterChange("mapStatus", stringValue);
                }}
                options={[
                  { value: "", label: "All Statuses" },
                  { value: "mapped", label: "Mapped" },
                  { value: "unmapped", label: "Unmapped" },
                  { value: "pending", label: "Pending" },
                ]}
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Results Table */}
          <DataTable
            data={hotels}
            columns={columns}
            loading={loading}
            pagination={{
              page: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.total,
            }}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            emptyMessage={
              searchQuery || Object.keys(filters).length > 0
                ? "No hotels found matching your search criteria"
                : "No hotels available"
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
