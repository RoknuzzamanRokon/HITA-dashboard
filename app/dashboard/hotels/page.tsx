/**
 * Hotel Management Dashboard
 * Professional interface for hotel data management with permission-based access
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Building2,
  Users,
  Database,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
} from "lucide-react";
import { Button } from "@/lib/components/ui/button";
import { Card, CardContent, CardHeader } from "@/lib/components/ui/card";
import { HotelSearchCompact } from "@/lib/components/hotels/hotel-search-compact";

import { useAuth } from "@/lib/contexts/auth-context";
import { HotelService } from "@/lib/api/hotels";
import type { Hotel, HotelStats } from "@/lib/types/hotel";

export default function HotelsPage() {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false); // Start with false to show mock data immediately
  const [stats, setStats] = useState<HotelStats | null>(null);
  const [recentHotels, setRecentHotels] = useState<Hotel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hotelInfo, setHotelInfo] = useState<{
    totalHotels: number;
    activeHotels: number;
    pendingHotels: number;
    mappedHotels: number;
    recentUpdates: number;
    topSuppliers: Array<{
      name: string;
      hotelCount: number;
      status: string;
    }>;
    hotelsByRegion: Array<{
      region: string;
      count: number;
    }>;
    lastUpdated: string;
  } | null>(null);
  const [supplierFilter, setSupplierFilter] = useState<string>("");
  const [accessibleSuppliers, setAccessibleSuppliers] = useState<
    Array<{
      supplier_name: string;
      total_hotels: number;
      access_type: string;
    }>
  >([]);
  const [userRole, setUserRole] = useState<string>("");
  const [supplierInfo, setSupplierInfo] = useState<{
    userId: string;
    role: string;
    accessSummary: {
      totalSuppliersInSystem: number;
      accessibleSuppliersCount: number;
      permissionBased: boolean;
    };
    supplierAnalytics: {
      totalHotelsAccessible: number;
      activeSuppliers: number;
      inactiveSuppliers: number;
      accessCoveragePercentage: number;
    };
    accessibleSuppliers: Array<{
      supplierName: string;
      totalHotels: number;
      accessType: string;
      permissionGrantedAt: string | null;
      lastUpdated: string;
      availabilityStatus: string;
    }>;
  } | null>(null);

  const handleHotelSelect = (hotel: Hotel) => {
    window.location.href = `/dashboard/hotels/${hotel.ittid}`;
  };

  const handleExport = async () => {
    try {
      // TODO: Implement actual export functionality
      console.log("Exporting hotel data...");
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  const loadDashboardData = async () => {
    if (!isAuthenticated || !user) {
      console.log("⚠️ loadDashboardData called but user not authenticated");
      return;
    }

    console.log("🔄 Starting dashboard data load...");
    setIsLoading(true);
    setError(null);

    try {
      // Load recent hotels with better error handling
      console.log("Loading recent hotels...");
      const hotelsResponse = await HotelService.searchHotels({
        page: 1,
        limit: 15, // Get more hotels to ensure we have recent ones
        sortBy: "updatedAt",
        sortOrder: "desc",
      });

      if (hotelsResponse.success && hotelsResponse.data) {
        console.log("Loaded hotels:", hotelsResponse.data.hotels.length);
        setRecentHotels(hotelsResponse.data.hotels);

        // If we got hotels, clear any previous errors
        if (hotelsResponse.data.hotels.length > 0) {
          setError(null);
        }
      } else {
        console.error("Failed to load hotels:", hotelsResponse.error);
        // Try to load any hotels without sorting if the sorted request fails
        const fallbackResponse = await HotelService.searchHotels({
          page: 1,
          limit: 10,
        });

        if (fallbackResponse.success && fallbackResponse.data) {
          setRecentHotels(fallbackResponse.data.hotels);
        } else {
          setRecentHotels([]);
        }
      }

      // Load hotel info from the content endpoint
      try {
        console.log("Loading hotel info from content endpoint...");
        const hotelInfoResponse = await HotelService.getAllHotelInfo();
        if (hotelInfoResponse.success && hotelInfoResponse.data) {
          setHotelInfo(hotelInfoResponse.data);
          console.log("Hotel info loaded:", hotelInfoResponse.data);
        }
      } catch (hotelInfoError) {
        console.log("Hotel info not available:", hotelInfoError);
      }

      // Load stats if available
      try {
        const statsResponse = await HotelService.getHotelStats();
        if (statsResponse.success && statsResponse.data) {
          setStats(statsResponse.data);
        }
      } catch (statsError) {
        // Stats endpoint might not be available, continue without it
        console.log("Stats not available:", statsError);
      }
    } catch (error) {
      console.error("Dashboard data loading failed:", error);

      // Try a basic hotel search as fallback
      try {
        const fallbackResponse = await HotelService.searchHotels({
          page: 1,
          limit: 10,
        });

        if (fallbackResponse.success && fallbackResponse.data) {
          setRecentHotels(fallbackResponse.data.hotels);
          setError(null);
        } else {
          setError("Unable to load hotel data");
        }
      } catch (fallbackError) {
        setError("Failed to load dashboard data");
      }

      // Load accessible suppliers
      try {
        console.log("Loading accessible suppliers...");
        const suppliersResponse =
          await HotelService.getUserAccessibleSuppliers();
        if (suppliersResponse.success && suppliersResponse.data) {
          setAccessibleSuppliers(suppliersResponse.data.accessible_suppliers);
          setUserRole(suppliersResponse.data.user_role);
          console.log(
            "Loaded suppliers:",
            suppliersResponse.data.accessible_suppliers.length
          );
        }
      } catch (supplierError) {
        console.log("Suppliers not available:", supplierError);
      }

      // Load active suppliers info for statistics
      try {
        console.log("Loading active suppliers info...");
        const activeSupplierResponse =
          await HotelService.checkActiveSuppliers();
        if (activeSupplierResponse.success && activeSupplierResponse.data) {
          setSupplierInfo(activeSupplierResponse.data);
          console.log(
            "Loaded active suppliers info:",
            activeSupplierResponse.data
          );
        } else {
          console.error(
            "Active suppliers API failed:",
            activeSupplierResponse.error
          );
          setError(
            `Failed to load supplier info: ${
              activeSupplierResponse.error?.message || "Unknown error"
            }`
          );
        }
      } catch (supplierInfoError) {
        console.error("Active suppliers info error:", supplierInfoError);
        setError(
          `Supplier info error: ${
            supplierInfoError instanceof Error
              ? supplierInfoError.message
              : "Unknown error"
          }`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Load data when authentication is ready
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated && user) {
        console.log("✅ User authenticated, loading dashboard data...");
        loadDashboardData();
      } else {
        console.log("❌ User not authenticated");
        setIsLoading(false);
      }
    }
  }, [authLoading, isAuthenticated, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Loading...
            </h2>
            <p className="text-gray-600">
              Checking authentication and loading hotel data.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please sign in to access the hotel management system.
            </p>
            <Button
              onClick={() => (window.location.href = "/login")}
              className="w-full"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
                    Hotel Management
                  </h1>
                </div>
              </div>
              <p className="text-gray-600 text-base leading-relaxed max-w-2xl">
                Manage hotel information, provider mappings, and content updates
                with comprehensive search and filtering capabilities
              </p>

              {/* Status Indicators */}
              <div className="flex items-center space-x-4 mt-3">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-500 font-medium">
                    System Online
                  </span>
                </div>
                {recentHotels.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Database className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-500">
                      {recentHotels.length} hotels loaded
                    </span>
                  </div>
                )}
                {accessibleSuppliers.length > 0 && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Users className="h-3 w-3 text-gray-400" />
                    <span className="text-gray-500">
                      {accessibleSuppliers.length} suppliers accessible
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Refresh Button */}
              <button
                onClick={() => loadDashboardData()}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                <RefreshCw
                  className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>

              {/* Export Button */}
              <button
                onClick={handleExport}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <Download className="h-4 w-4 mr-2" />
                <span>Export Data</span>
              </button>
            </div>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <p className="text-sm text-red-700">{error}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadDashboardData()}
                    className="border-red-300 text-red-700 hover:bg-red-100"
                  >
                    Retry
                  </Button>
                  {process.env.NODE_ENV === "development" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        console.log("🔧 Manual refresh");
                        window.location.reload();
                      }}
                      className="border-blue-300 text-blue-700 hover:bg-blue-100"
                    >
                      Debug Refresh
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Hotel Info Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Hotels
                  </p>
                  <p className="text-2xl font-bold text-blue-600">
                    {isLoading
                      ? "..."
                      : hotelInfo?.totalHotels?.toLocaleString() ||
                        supplierInfo?.supplierAnalytics?.totalHotelsAccessible?.toLocaleString() ||
                        stats?.totalHotels?.toLocaleString() ||
                        "N/A"}
                  </p>
                  {hotelInfo && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last updated:{" "}
                      {new Date(hotelInfo.lastUpdated).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <Database className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Hotels
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {isLoading
                      ? "..."
                      : hotelInfo?.activeHotels?.toLocaleString() ||
                        supplierInfo?.supplierAnalytics?.activeSuppliers?.toString() ||
                        stats?.mappedHotels?.toLocaleString() ||
                        "N/A"}
                  </p>
                  {hotelInfo && (
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(
                        (hotelInfo.activeHotels / hotelInfo.totalHotels) * 100
                      )}
                      % of total
                    </p>
                  )}
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Hotels
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {isLoading
                      ? "..."
                      : hotelInfo?.pendingHotels?.toLocaleString() ||
                        supplierInfo?.supplierAnalytics?.inactiveSuppliers?.toString() ||
                        stats?.unmappedHotels?.toLocaleString() ||
                        "N/A"}
                  </p>
                  {hotelInfo && (
                    <p className="text-xs text-gray-500 mt-1">
                      Awaiting processing
                    </p>
                  )}
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Recent Updates
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {isLoading
                      ? "..."
                      : hotelInfo?.recentUpdates?.toLocaleString() ||
                        supplierInfo?.accessSummary?.accessibleSuppliersCount?.toString() ||
                        "N/A"}
                  </p>
                  {hotelInfo && (
                    <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                  )}
                </div>
                <RefreshCw className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Hotel Info Details Section */}
        {hotelInfo && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top Suppliers */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      All Suppliers
                    </h2>
                    <p className="text-sm text-gray-600">
                      {supplierFilter
                        ? `${
                            hotelInfo.topSuppliers.filter((supplier) =>
                              supplier.name
                                .toLowerCase()
                                .includes(supplierFilter.toLowerCase())
                            ).length
                          } of ${hotelInfo.topSuppliers.length} suppliers`
                        : `${hotelInfo.topSuppliers.length} suppliers sorted by hotel count`}
                    </p>
                  </div>
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                {/* Search Filter */}
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search suppliers..."
                      value={supplierFilter}
                      onChange={(e) => setSupplierFilter(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    {supplierFilter && (
                      <button
                        onClick={() => setSupplierFilter("")}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>

                {/* Suppliers List */}
                <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
                  {hotelInfo.topSuppliers
                    .filter((supplier) =>
                      supplier.name
                        .toLowerCase()
                        .includes(supplierFilter.toLowerCase())
                    )
                    .map((supplier, filteredIndex) => {
                      // Get the original index for ranking
                      const originalIndex = hotelInfo.topSuppliers.findIndex(
                        (s) => s.name === supplier.name
                      );
                      return (
                        <div
                          key={supplier.name}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-blue-600">
                                {originalIndex + 1}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-gray-900 truncate capitalize">
                                {supplier.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {supplier.hotelCount.toLocaleString()} hotels
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 flex-shrink-0">
                            <div
                              className={`px-2 py-1 rounded-full text-xs ${
                                supplier.status === "active"
                                  ? "bg-green-100 text-green-800"
                                  : "bg-gray-100 text-gray-800"
                              }`}
                            >
                              {supplier.status}
                            </div>
                            {originalIndex < 3 && (
                              <div
                                className="w-2 h-2 bg-yellow-400 rounded-full"
                                title="Top 3 Supplier"
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Scroll indicator and filter info */}
                <div className="mt-3 pt-3 border-t border-gray-200">
                  {supplierFilter ? (
                    <p className="text-xs text-gray-500 text-center">
                      Showing{" "}
                      {
                        hotelInfo.topSuppliers.filter((supplier) =>
                          supplier.name
                            .toLowerCase()
                            .includes(supplierFilter.toLowerCase())
                        ).length
                      }{" "}
                      suppliers matching "{supplierFilter}"
                    </p>
                  ) : (
                    <p className="text-xs text-gray-500 text-center">
                      Showing all {hotelInfo.topSuppliers.length} suppliers •
                      Scroll to see more
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Hotels by Region */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Hotels by Region
                    </h2>
                    <p className="text-sm text-gray-600">
                      Geographic distribution
                    </p>
                  </div>
                  <Database className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {hotelInfo.hotelsByRegion.map((region, index) => {
                    const percentage = Math.round(
                      (region.count / hotelInfo.totalHotels) * 100
                    );
                    return (
                      <div key={region.region} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-900">
                            {region.region}
                          </span>
                          <span className="text-sm text-gray-600">
                            {region.count.toLocaleString()} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Supplier Permissions Section */}
        {(supplierInfo?.accessibleSuppliers.length ||
          accessibleSuppliers.length) > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Accessible Suppliers
                  </h2>
                  <p className="text-sm text-gray-600">
                    Suppliers you have permission to access (
                    {supplierInfo?.role || userRole})
                  </p>
                </div>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {(
                  supplierInfo?.accessibleSuppliers ||
                  accessibleSuppliers.map((s) => ({
                    supplierName: s.supplier_name,
                    totalHotels: s.total_hotels,
                    accessType: s.access_type,
                    availabilityStatus: "active",
                    lastUpdated: new Date().toISOString(),
                    permissionGrantedAt: null,
                  }))
                ).map((supplier) => (
                  <div
                    key={supplier.supplierName}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => {
                      // TODO: Navigate to supplier-specific view or show supplier details
                      console.log("Selected supplier:", supplier.supplierName);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate capitalize">
                        {supplier.supplierName}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <div
                          className={`px-2 py-1 rounded-full text-xs ${
                            supplier.accessType === "fullAccess" ||
                            supplier.accessType === "full_access"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {supplier.accessType === "fullAccess" ||
                          supplier.accessType === "full_access"
                            ? "Full"
                            : "Limited"}
                        </div>
                        {supplier.availabilityStatus && (
                          <div
                            className={`w-2 h-2 rounded-full ${
                              supplier.availabilityStatus === "active"
                                ? "bg-green-500"
                                : "bg-gray-400"
                            }`}
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                      <Building2 className="h-4 w-4" />
                      <span>
                        {supplier.totalHotels.toLocaleString()} hotels
                      </span>
                    </div>
                    {supplier.lastUpdated && (
                      <div className="text-xs text-gray-500">
                        Updated:{" "}
                        {new Date(supplier.lastUpdated).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {(supplierInfo?.role || userRole) === "general_user" &&
                (supplierInfo?.accessibleSuppliers.length ||
                  accessibleSuppliers.length) === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      No Supplier Access
                    </p>
                    <p className="text-xs text-gray-500">
                      Contact your administrator to request supplier permissions
                    </p>
                  </div>
                )}
            </CardContent>
          </Card>
        )}

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Hotel Search */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Hotel Search
                    </h2>
                    <p className="text-sm text-gray-600">
                      Search and filter hotels by various criteria
                    </p>
                  </div>
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                <HotelSearchCompact
                  onHotelSelect={handleHotelSelect}
                  maxResults={8}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
