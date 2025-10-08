/**
 * Provider Hotel Listing Page
 * Displays paginated hotel list for a specific provider with mapping information
 */

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Star,
  Building2,
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import { ProvidersApi } from "@/lib/api/providers";
import { ExportModal } from "@/lib/components/providers";
import type {
  ProviderHotelListResponse,
  ProviderHotel,
  ProviderHotelListParams,
} from "@/lib/types/provider";

export default function ProviderHotelsPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const providerName = decodeURIComponent(params.provider as string);

  const [hotelData, setHotelData] = useState<ProviderHotelListResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("sortOrder") as "asc" | "desc") || "asc"
  );
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [pageSize] = useState(20);
  const [showExportModal, setShowExportModal] = useState(false);

  const loadHotels = useCallback(
    async (params: Partial<ProviderHotelListParams> = {}) => {
      setLoading(true);
      setError(null);

      try {
        const requestParams: ProviderHotelListParams = {
          provider: providerName,
          page: currentPage,
          limit: pageSize,
          search: searchQuery || undefined,
          sortBy,
          sortOrder,
          ...params,
        };

        const response = await ProvidersApi.getProviderHotels(requestParams);

        if (response.success && response.data) {
          setHotelData(response.data);
        } else {
          setError(response.error?.message || "Failed to load hotels");
        }
      } catch (err) {
        setError("Failed to load hotel data");
        console.error("Error loading hotels:", err);
      } finally {
        setLoading(false);
      }
    },
    [providerName, currentPage, pageSize, searchQuery, sortBy, sortOrder]
  );

  useEffect(() => {
    loadHotels();
  }, [loadHotels]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    updateUrl({ search: query, page: "1" });
  };

  const handleSort = (field: string) => {
    const newOrder = field === sortBy && sortOrder === "asc" ? "desc" : "asc";
    setSortBy(field);
    setSortOrder(newOrder);
    setCurrentPage(1);
    updateUrl({ sortBy: field, sortOrder: newOrder, page: "1" });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    updateUrl({ page: page.toString() });
  };

  const updateUrl = (newParams: Record<string, string>) => {
    const current = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    router.push(
      `/dashboard/providers/${encodeURIComponent(
        providerName
      )}?${current.toString()}`
    );
  };

  const getMappingStatusIcon = (status: string) => {
    switch (status) {
      case "mapped":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "unmapped":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "partial":
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getMappingStatusColor = (status: string) => {
    switch (status) {
      case "mapped":
        return "bg-green-50 text-green-700 border-green-200";
      case "unmapped":
        return "bg-red-50 text-red-700 border-red-200";
      case "partial":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSortIcon = (field: string) => {
    if (field !== sortBy) return null;
    return sortOrder === "asc" ? "↑" : "↓";
  };

  if (loading && !hotelData) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Providers
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {providerName} Hotels
          </h1>
          <p className="text-gray-600">Loading hotel listings...</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="border-b border-gray-200 pb-4">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Providers
        </button>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
          <button
            onClick={() => loadHotels()}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Providers
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {providerName} Hotels
            </h1>
            <p className="text-gray-600">
              {hotelData?.pagination.total.toLocaleString()} hotels found
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => loadHotels()}
              className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </button>

            <button
              onClick={() => setShowExportModal(true)}
              className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search hotels by name..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <button className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 border border-gray-300 rounded-md hover:bg-gray-50">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </button>
        </div>
      </div>

      {/* Hotels Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("name")}
                >
                  Hotel Name {getSortIcon("name")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Provider ID
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("mappingStatus")}
                >
                  Mapping Status {getSortIcon("mappingStatus")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("lastUpdated")}
                >
                  Last Updated {getSortIcon("lastUpdated")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {hotelData?.hotels.map((hotel) => (
                <tr
                  key={`${hotel.ittid}-${hotel.providerId}`}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {hotel.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        ITTID: {hotel.ittid}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {hotel.providerId}
                    </div>
                    <div className="text-sm text-gray-500">
                      {hotel.systemType}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs border ${getMappingStatusColor(
                        hotel.mappingStatus
                      )}`}
                    >
                      {getMappingStatusIcon(hotel.mappingStatus)}
                      <span className="ml-1 capitalize">
                        {hotel.mappingStatus}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {hotel.rating && (
                        <div className="flex items-center mb-1">
                          <Star className="h-3 w-3 text-yellow-400 mr-1" />
                          <span>{hotel.rating}</span>
                        </div>
                      )}
                      {hotel.propertyType && (
                        <div className="flex items-center mb-1">
                          <Building2 className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs">{hotel.propertyType}</span>
                        </div>
                      )}
                      {hotel.address && (
                        <div className="flex items-center">
                          <MapPin className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-600 truncate max-w-xs">
                            {hotel.address}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(hotel.lastUpdated)}
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() =>
                        router.push(`/dashboard/hotels/${hotel.ittid}`)
                      }
                      className="text-blue-600 hover:text-blue-900 flex items-center"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {hotelData && hotelData.pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!hotelData.pagination.hasPrevious}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hotelData.pagination.hasNext}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>

              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing{" "}
                    <span className="font-medium">
                      {(currentPage - 1) * pageSize + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-medium">
                      {Math.min(
                        currentPage * pageSize,
                        hotelData.pagination.total
                      )}
                    </span>{" "}
                    of{" "}
                    <span className="font-medium">
                      {hotelData.pagination.total}
                    </span>{" "}
                    results
                  </p>
                </div>

                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={!hotelData.pagination.hasPrevious}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>

                    {/* Page numbers */}
                    {Array.from(
                      { length: Math.min(5, hotelData.pagination.totalPages) },
                      (_, i) => {
                        const pageNum =
                          Math.max(
                            1,
                            Math.min(
                              hotelData.pagination.totalPages - 4,
                              Math.max(1, currentPage - 2)
                            )
                          ) + i;

                        if (pageNum > hotelData.pagination.totalPages)
                          return null;

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                              pageNum === currentPage
                                ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                                : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      }
                    )}

                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={!hotelData.pagination.hasNext}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {hotelData?.hotels.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Hotels Found
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? `No hotels match your search for "${searchQuery}"`
              : "No hotels are available for this provider"}
          </p>
        </div>
      )}

      {/* Export Modal */}
      <ExportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        provider={providerName}
        title={`Export ${providerName} Hotels`}
      />
    </div>
  );
}
