/**
 * Hotel Management Interface Component
 * Provides interface for managing hotel provider mappings, locations, and status tracking
 */

"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  MapPin,
  Activity,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Filter,
  Download,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/lib/components/ui/card";
import { Badge } from "@/lib/components/ui/badge";
import { Button } from "@/lib/components/ui/button";
import { DataTable, Column } from "@/lib/components/ui/data-table";
import { Modal } from "@/lib/components/ui/modal";
import { Input } from "@/lib/components/ui/input";
import { Select } from "@/lib/components/ui/select";
import { HotelService } from "@/lib/api/hotels";
import type {
  Hotel,
  HotelDetails,
  ProviderMapping,
  Location,
  Contact,
  HotelSearchParams,
} from "@/lib/types/hotel";

interface HotelManagementProps {
  className?: string;
}

interface MappingStats {
  totalMappings: number;
  activeMappings: number;
  pendingMappings: number;
  errorMappings: number;
}

export function HotelManagement({ className }: HotelManagementProps) {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<HotelDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMappingModal, setShowMappingModal] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [mappingStats, setMappingStats] = useState<MappingStats>({
    totalMappings: 0,
    activeMappings: 0,
    pendingMappings: 0,
    errorMappings: 0,
  });

  // Pagination and filtering
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0,
  });

  const [filters, setFilters] = useState({
    mapStatus: "",
    contentStatus: "",
    hasProviderMappings: "",
  });

  useEffect(() => {
    loadHotels();
  }, [pagination.page, pagination.pageSize, filters]);

  const loadHotels = async () => {
    setLoading(true);
    setError(null);

    try {
      const searchParams: HotelSearchParams = {
        page: pagination.page,
        limit: pagination.pageSize,
        mapStatus: filters.mapStatus || undefined,
        sortBy: "updatedAt",
        sortOrder: "desc",
      };

      const response = await HotelService.searchHotels(searchParams);

      if (response.success && response.data) {
        const data = response.data; // Extract data to help TypeScript understand it's not undefined
        setHotels(data.hotels);
        setPagination((prev) => ({
          ...prev,
          total: data.total,
        }));

        // Calculate mapping stats
        calculateMappingStats(data.hotels);
      } else {
        setError(response.error?.message || "Failed to load hotels");
      }
    } catch (error) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const calculateMappingStats = (hotelList: Hotel[]) => {
    // This would typically come from the API, but we'll simulate it
    const stats: MappingStats = {
      totalMappings: hotelList.length,
      activeMappings: hotelList.filter((h) => h.mapStatus === "mapped").length,
      pendingMappings: hotelList.filter((h) => h.mapStatus === "pending")
        .length,
      errorMappings: hotelList.filter((h) => h.mapStatus === "unmapped").length,
    };
    setMappingStats(stats);
  };

  const loadHotelDetails = async (ittid: string) => {
    try {
      const response = await HotelService.getHotelDetails(ittid);
      if (response.success && response.data) {
        setSelectedHotel(response.data);
      }
    } catch (error) {
      console.error("Failed to load hotel details:", error);
    }
  };

  const handleViewMappings = async (hotel: Hotel) => {
    await loadHotelDetails(hotel.ittid);
    setShowMappingModal(true);
  };

  const handleViewLocations = async (hotel: Hotel) => {
    await loadHotelDetails(hotel.ittid);
    setShowLocationModal(true);
  };

  const handleRefreshStatus = async (hotel: Hotel) => {
    // TODO: Implement status refresh
    console.log("Refresh status for hotel:", hotel.ittid);
  };

  const handleExportData = () => {
    // TODO: Implement data export
    console.log("Export hotel management data");
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case "mapped":
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "unmapped":
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "mapped":
      case "active":
        return "success";
      case "pending":
        return "warning";
      case "unmapped":
      case "error":
        return "error";
      default:
        return "secondary";
    }
  };

  // Hotel management table columns
  const columns: Column<Hotel>[] = [
    {
      key: "name",
      label: "Hotel",
      sortable: true,
      render: (value, hotel) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{value}</span>
          <span className="text-sm text-gray-500">ITTID: {hotel.ittid}</span>
        </div>
      ),
    },
    {
      key: "mapStatus",
      label: "Map Status",
      render: (value, hotel) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(value)}
          <Badge variant={getStatusColor(value)}>{value || "Unknown"}</Badge>
        </div>
      ),
    },
    {
      key: "contentUpdateStatus",
      label: "Content Status",
      render: (value) =>
        value ? (
          <Badge variant="secondary">{value}</Badge>
        ) : (
          <span className="text-gray-400 text-sm">No status</span>
        ),
    },
    {
      key: "updatedAt",
      label: "Last Updated",
      sortable: true,
      render: (value) => (
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Calendar className="h-4 w-4" />
          <span>{new Date(value).toLocaleDateString()}</span>
        </div>
      ),
    },
    {
      key: "ittid" as keyof Hotel, // Use a valid key but override the render
      label: "Actions",
      render: (_, hotel) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewMappings(hotel)}
            title="View Provider Mappings"
          >
            <Database className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleViewLocations(hotel)}
            title="View Location Information"
          >
            <MapPin className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRefreshStatus(hotel)}
            title="Refresh Status"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              window.open(`/dashboard/hotels/${hotel.ittid}`, "_blank")
            }
            title="View Details"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Provider mappings columns for modal
  const mappingColumns: Column<ProviderMapping>[] = [
    {
      key: "providerName",
      label: "Provider",
      render: (value) => (
        <div className="flex items-center space-x-2">
          <Database className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{value}</span>
        </div>
      ),
    },
    {
      key: "providerId",
      label: "Provider ID",
      render: (value) => (
        <code className="px-2 py-1 bg-gray-100 rounded text-sm">{value}</code>
      ),
    },
    {
      key: "systemType",
      label: "System Type",
      render: (value) => <Badge variant="secondary">{value}</Badge>,
    },
    {
      key: "id" as keyof ProviderMapping, // Use a valid key but override the render
      label: "Actions",
      render: (_, mapping) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" title="Edit Mapping">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Delete Mapping">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  // Location columns for modal
  const locationColumns: Column<Location>[] = [
    {
      key: "cityName",
      label: "City",
      render: (value) => value || "Unknown",
    },
    {
      key: "stateName",
      label: "State/Region",
      render: (value) => value || "N/A",
    },
    {
      key: "countryName",
      label: "Country",
      render: (value, location) => (
        <div className="flex items-center space-x-2">
          <span>{value || "Unknown"}</span>
          {location.countryCode && (
            <Badge variant="outline" size="sm">
              {location.countryCode}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: "id" as keyof Location, // Use a valid key but override the render
      label: "Actions",
      render: (_, location) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" title="Edit Location">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" title="Delete Location">
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Hotel Data Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage hotel provider mappings, location information, and status
            tracking
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button onClick={() => loadHotels()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  Total Hotels
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {mappingStats.totalMappings}
                </p>
              </div>
              <Database className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Mapped</p>
                <p className="text-2xl font-bold text-green-600">
                  {mappingStats.activeMappings}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {mappingStats.pendingMappings}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">Unmapped</p>
                <p className="text-2xl font-bold text-red-600">
                  {mappingStats.errorMappings}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader title="Filters" />
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              label="Map Status"
              value={filters.mapStatus}
              onChange={(value) => {
                const stringValue =
                  typeof value === "string"
                    ? value
                    : (value as any)?.target?.value || "";
                setFilters((prev) => ({ ...prev, mapStatus: stringValue }));
              }}
              options={[
                { value: "", label: "All Statuses" },
                { value: "mapped", label: "Mapped" },
                { value: "unmapped", label: "Unmapped" },
                { value: "pending", label: "Pending" },
              ]}
            />

            <Select
              label="Content Status"
              value={filters.contentStatus}
              onChange={(value) => {
                const stringValue =
                  typeof value === "string"
                    ? value
                    : (value as any)?.target?.value || "";
                setFilters((prev) => ({ ...prev, contentStatus: stringValue }));
              }}
              options={[
                { value: "", label: "All Content Statuses" },
                { value: "updated", label: "Updated" },
                { value: "pending", label: "Pending Update" },
                { value: "error", label: "Update Error" },
              ]}
            />

            <Select
              label="Provider Mappings"
              value={filters.hasProviderMappings}
              onChange={(value) => {
                const stringValue =
                  typeof value === "string"
                    ? value
                    : (value as any)?.target?.value || "";
                setFilters((prev) => ({
                  ...prev,
                  hasProviderMappings: stringValue,
                }));
              }}
              options={[
                { value: "", label: "All Hotels" },
                { value: "yes", label: "Has Mappings" },
                { value: "no", label: "No Mappings" },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Hotels Table */}
      <Card>
        <CardHeader title="Hotel Management" />
        <CardContent>
          <DataTable
            data={hotels}
            columns={columns}
            loading={loading}
            pagination={{
              page: pagination.page,
              pageSize: pagination.pageSize,
              total: pagination.total,
            }}
            onPageChange={(page) =>
              setPagination((prev) => ({ ...prev, page }))
            }
            onPageSizeChange={(pageSize) =>
              setPagination((prev) => ({ ...prev, pageSize, page: 1 }))
            }
            emptyMessage="No hotels found"
          />
        </CardContent>
      </Card>

      {/* Provider Mappings Modal */}
      <Modal
        isOpen={showMappingModal}
        onClose={() => setShowMappingModal(false)}
        title={`Provider Mappings - ${selectedHotel?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedHotel?.providerMappings.length || 0} provider mapping(s)
            </p>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Mapping
            </Button>
          </div>

          {selectedHotel?.providerMappings &&
          selectedHotel.providerMappings.length > 0 ? (
            <DataTable
              data={selectedHotel.providerMappings}
              columns={mappingColumns}
              emptyMessage="No provider mappings found"
            />
          ) : (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No provider mappings available</p>
            </div>
          )}
        </div>
      </Modal>

      {/* Location Information Modal */}
      <Modal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        title={`Location Information - ${selectedHotel?.name}`}
        size="lg"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedHotel?.locations.length || 0} location record(s)
            </p>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Location
            </Button>
          </div>

          {selectedHotel?.locations && selectedHotel.locations.length > 0 ? (
            <DataTable
              data={selectedHotel.locations}
              columns={locationColumns}
              emptyMessage="No location information found"
            />
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No location information available</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
