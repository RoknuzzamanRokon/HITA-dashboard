/**
 * Hotel Management Dashboard
 * Professional interface for hotel data management with permission-based access
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Building2,
  MapPin,
  Users,
  Database,
  Filter,
  Download,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  BarChart3,
  Star,
} from "lucide-react";
import { Button } from "@/lib/components/ui/button";
import { Card, CardContent, CardHeader } from "@/lib/components/ui/card";
import { HotelSearchCompact } from "@/lib/components/hotels/hotel-search-compact";
import { apiClient } from "@/lib/api/client";
import { TokenStorage } from "@/lib/auth/token-storage";
import { HotelService } from "@/lib/api/hotels";
import type { Hotel, HotelStats } from "@/lib/types/hotel";

export default function HotelsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<HotelStats | null>(null);
  const [recentHotels, setRecentHotels] = useState<Hotel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [accessibleSuppliers, setAccessibleSuppliers] = useState<
    Array<{
      supplier_name: string;
      total_hotels: number;
      access_type: string;
    }>
  >([]);
  const [userRole, setUserRole] = useState<string>("");

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
    if (!isAuthenticated) return;

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
    } finally {
      setIsLoading(false);
    }
  };

  // Check authentication and load data
  useEffect(() => {
    const checkAuth = () => {
      const token = TokenStorage.getToken();
      const authenticated = !!token;
      setIsAuthenticated(authenticated);

      if (authenticated) {
        loadDashboardData();
      } else {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (!isAuthenticated) {
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

              {/* Advanced Search Button */}
              <button
                onClick={() =>
                  (window.location.href = "/dashboard/hotels/manage")
                }
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <Filter className="h-4 w-4 mr-2" />
                <span>Advanced Search</span>
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
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => loadDashboardData()}
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Hotels
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {isLoading
                      ? "..."
                      : stats?.totalHotels?.toLocaleString() || "N/A"}
                  </p>
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
                    Mapped Hotels
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {isLoading
                      ? "..."
                      : stats?.mappedHotels?.toLocaleString() || "N/A"}
                  </p>
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
                    Unmapped Hotels
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {isLoading
                      ? "..."
                      : stats?.unmappedHotels?.toLocaleString() || "N/A"}
                  </p>
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
                    Active Providers
                  </p>
                  <p className="text-2xl font-bold text-purple-600">
                    {isLoading
                      ? "..."
                      : Object.keys(stats?.hotelsByPropertyType || {}).length ||
                        "N/A"}
                  </p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Supplier Permissions Section */}
        {accessibleSuppliers.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Accessible Suppliers
                  </h2>
                  <p className="text-sm text-gray-600">
                    Suppliers you have permission to access ({userRole})
                  </p>
                </div>
                <Users className="h-5 w-5 text-gray-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {accessibleSuppliers.map((supplier) => (
                  <div
                    key={supplier.supplier_name}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors cursor-pointer"
                    onClick={() => {
                      // TODO: Navigate to supplier-specific view or show supplier details
                      console.log("Selected supplier:", supplier.supplier_name);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 truncate">
                        {supplier.supplier_name}
                      </h3>
                      <div
                        className={`px-2 py-1 rounded-full text-xs ${
                          supplier.access_type === "full_access"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {supplier.access_type === "full_access"
                          ? "Full"
                          : "Limited"}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Building2 className="h-4 w-4" />
                      <span>
                        {supplier.total_hotels.toLocaleString()} hotels
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {userRole === "general_user" &&
                accessibleSuppliers.length === 0 && (
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

          {/* Recent Activity */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Recent Updates
                    </h2>
                    <p className="text-sm text-gray-600">
                      Latest hotel modifications
                    </p>
                  </div>
                  <BarChart3 className="h-5 w-5 text-gray-400" />
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentHotels.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-gray-500">
                        Showing {Math.min(recentHotels.length, 6)} recent hotels
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => loadDashboardData()}
                        className="text-xs"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                    </div>

                    <div className="space-y-2 max-h-80 overflow-y-auto">
                      {recentHotels.slice(0, 6).map((hotel, index) => {
                        const getStatusBadge = (status: string) => {
                          switch (status?.toLowerCase()) {
                            case "mapped":
                              return (
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              );
                            case "unmapped":
                              return (
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              );
                            case "pending":
                              return (
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                              );
                            default:
                              return (
                                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                              );
                          }
                        };

                        const formatTimeAgo = (dateString: string) => {
                          const date = new Date(dateString);
                          const now = new Date();
                          const diffInHours = Math.floor(
                            (now.getTime() - date.getTime()) / (1000 * 60 * 60)
                          );

                          if (diffInHours < 1) return "Just now";
                          if (diffInHours < 24) return `${diffInHours}h ago`;
                          const diffInDays = Math.floor(diffInHours / 24);
                          if (diffInDays < 7) return `${diffInDays}d ago`;
                          return date.toLocaleDateString();
                        };

                        return (
                          <div
                            key={hotel.ittid}
                            className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-100 transition-colors"
                            onClick={() => handleHotelSelect(hotel)}
                          >
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-5 w-5 text-blue-600" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  {hotel.name}
                                </p>
                                {getStatusBadge(hotel.mapStatus || "")}
                              </div>

                              <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                                <span className="font-mono bg-gray-100 px-1 rounded">
                                  {hotel.ittid}
                                </span>
                                {hotel.rating && (
                                  <div className="flex items-center space-x-1">
                                    <span>★</span>
                                    <span>{hotel.rating}</span>
                                  </div>
                                )}
                              </div>

                              {hotel.addressLine1 && (
                                <div className="flex items-center space-x-1 text-xs text-gray-500">
                                  <MapPin className="h-3 w-3 flex-shrink-0" />
                                  <span className="truncate">
                                    {hotel.addressLine1}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-col items-end text-xs text-gray-400">
                              <span>{formatTimeAgo(hotel.updatedAt)}</span>
                              {hotel.mapStatus && (
                                <span className="text-xs capitalize mt-1 px-2 py-1 bg-gray-100 rounded">
                                  {hotel.mapStatus}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {recentHotels.length > 6 && (
                      <div className="pt-3 border-t border-gray-200">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            (window.location.href = "/dashboard/hotels/manage")
                          }
                          className="w-full text-xs"
                        >
                          View All Recent Updates ({recentHotels.length})
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Building2 className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium text-gray-600 mb-1">
                      No Recent Updates
                    </p>
                    <p className="text-xs text-gray-500 mb-4">
                      Hotel modifications will appear here
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadDashboardData()}
                      className="text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Check for Updates
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
