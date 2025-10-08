/**
 * Hotel Search Page
 * Main page for hotel search and management
 */

"use client";

import React, { useState } from "react";
import { Search, Grid, List, Download, Filter } from "lucide-react";
import { Button } from "@/lib/components/ui/button";
import { Card, CardContent, CardHeader } from "@/lib/components/ui/card";
import { HotelSearch } from "@/lib/components/hotels/hotel-search";
import { HotelCardGrid } from "@/lib/components/hotels/hotel-card";
import type { Hotel } from "@/lib/types/hotel";

type ViewMode = "table" | "grid";

export default function HotelsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  const handleHotelSelect = (hotel: Hotel) => {
    setSelectedHotel(hotel);
    // Navigate to hotel details page
    window.location.href = `/dashboard/hotels/${hotel.ittid}`;
  };

  const handleViewDetails = (hotel: Hotel) => {
    // Navigate to hotel details page
    window.location.href = `/dashboard/hotels/${hotel.ittid}`;
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export hotels");
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotel Management</h1>
          <p className="text-gray-600 mt-1">
            Search and manage hotel information, provider mappings, and content
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <Button
              variant={viewMode === "table" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="px-3"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="px-3"
            >
              <Grid className="h-4 w-4" />
            </Button>
          </div>

          {/* Management Button */}
          <Button
            variant="outline"
            onClick={() => (window.location.href = "/dashboard/hotels/manage")}
          >
            <Filter className="h-4 w-4 mr-2" />
            Manage Data
          </Button>

          {/* Export Button */}
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Search Interface */}
      {viewMode === "table" ? (
        <HotelSearch onHotelSelect={handleHotelSelect} />
      ) : (
        <div className="space-y-6">
          {/* Search Controls for Grid View */}
          <Card>
            <CardHeader
              title="Search Hotels"
              subtitle="Find hotels by name, location, or other criteria"
            />
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>Grid view with search controls will be implemented here</p>
                <p className="text-sm mt-2">
                  Switch to table view to use the full search interface
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  Total Hotels
                </p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
              <Search className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  Mapped Hotels
                </p>
                <p className="text-2xl font-bold text-green-600">-</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  Unmapped Hotels
                </p>
                <p className="text-2xl font-bold text-yellow-600">-</p>
              </div>
              <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600">
                  Recent Updates
                </p>
                <p className="text-2xl font-bold text-blue-600">-</p>
              </div>
              <Filter className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
