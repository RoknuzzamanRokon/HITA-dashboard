"use client";

import React, { useState } from "react";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { Select, SelectOption } from "@/lib/components/ui/select";
import { RadioGroup, RadioOption } from "@/lib/components/ui/radio-group";
import { HotelExportFilters } from "@/lib/types/exports";
import {
  Download,
  Filter,
  Calendar,
  Star,
  Building,
  Globe,
  Hash,
  FileJson,
  FileSpreadsheet,
} from "lucide-react";
import { clsx } from "clsx";

export interface ExportFilterPanelProps {
  onExportCreate: (filters: HotelExportFilters) => Promise<void>;
  isLoading: boolean;
}

// Common supplier options (can be fetched from API in real implementation)
const SUPPLIER_OPTIONS: SelectOption[] = [
  { value: "expedia", label: "Expedia" },
  { value: "booking", label: "Booking.com" },
  { value: "agoda", label: "Agoda" },
  { value: "hotels", label: "Hotels.com" },
  { value: "airbnb", label: "Airbnb" },
];

// Property type options
const PROPERTY_TYPE_OPTIONS = [
  { value: "hotel", label: "Hotel" },
  { value: "resort", label: "Resort" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "hostel", label: "Hostel" },
  { value: "guesthouse", label: "Guest House" },
];

export function ExportFilterPanel({
  onExportCreate,
  isLoading,
}: ExportFilterPanelProps) {
  // Form state
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [countryCodes, setCountryCodes] = useState<string>("All");
  const [minRating, setMinRating] = useState<number>(0);
  const [maxRating, setMaxRating] = useState<number>(5);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [ittids, setIttids] = useState<string>("All");
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(100);
  const [maxRecords, setMaxRecords] = useState<number>(1000);
  const [format, setFormat] = useState<"json" | "csv">("json");
  const [includeLocations, setIncludeLocations] = useState<boolean>(true);
  const [includeContacts, setIncludeContacts] = useState<boolean>(true);
  const [includeMappings, setIncludeMappings] = useState<boolean>(true);

  // Multi-select state for suppliers
  const [selectedSupplierValues, setSelectedSupplierValues] = useState<
    Set<string>
  >(new Set());

  const handleSupplierToggle = (value: string) => {
    const newSet = new Set(selectedSupplierValues);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }
    setSelectedSupplierValues(newSet);
    setSuppliers(Array.from(newSet));
  };

  const handlePropertyTypeToggle = (value: string) => {
    setPropertyTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const filters: HotelExportFilters = {
      filters: {
        suppliers,
        country_codes: countryCodes,
        min_rating: minRating,
        max_rating: maxRating,
        date_from: dateFrom ? new Date(dateFrom).toISOString() : "",
        date_to: dateTo ? new Date(dateTo).toISOString() : "",
        ittids,
        property_types: propertyTypes,
        page,
        page_size: pageSize,
        max_records: maxRecords,
      },
      format,
      include_locations: includeLocations,
      include_contacts: includeContacts,
      include_mappings: includeMappings,
    };

    await onExportCreate(filters);
  };

  const formatOptions: RadioOption[] = [
    {
      value: "json",
      label: "JSON",
      description: "JavaScript Object Notation",
      icon: <FileJson className="w-4 h-4" />,
    },
    {
      value: "csv",
      label: "CSV",
      description: "Comma-Separated Values",
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <Filter className="w-5 h-5 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Export Filters</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Suppliers Multi-Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Suppliers <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {SUPPLIER_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={clsx(
                  "flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  selectedSupplierValues.has(option.value.toString())
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedSupplierValues.has(option.value.toString())}
                  onChange={() => handleSupplierToggle(option.value.toString())}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Country Codes */}
        <Input
          label="Country Codes"
          placeholder='Enter country codes (e.g., "US,UK,CA") or "All"'
          value={countryCodes}
          onChange={(e) => setCountryCodes(e.target.value)}
          leftIcon={<Globe className="w-4 h-4" />}
          helperText='Use "All" for all countries or comma-separated codes'
        />

        {/* Star Rating Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Min Rating
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex items-center gap-1 min-w-[60px]">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold">{minRating}</span>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Rating
            </label>
            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="5"
                step="0.5"
                value={maxRating}
                onChange={(e) => setMaxRating(parseFloat(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex items-center gap-1 min-w-[60px]">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-semibold">{maxRating}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="Date From"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <Input
            type="date"
            label="Date To"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
        </div>

        {/* ITT IDs */}
        <Input
          label="ITT IDs"
          placeholder='Enter ITT IDs (comma-separated) or "All"'
          value={ittids}
          onChange={(e) => setIttids(e.target.value)}
          leftIcon={<Hash className="w-4 h-4" />}
          helperText='Use "All" for all ITT IDs or comma-separated values'
        />

        {/* Property Types */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Property Types
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {PROPERTY_TYPE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={clsx(
                  "flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  propertyTypes.includes(option.value)
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                )}
              >
                <input
                  type="checkbox"
                  checked={propertyTypes.includes(option.value)}
                  onChange={() => handlePropertyTypeToggle(option.value)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <Building className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Pagination and Limits */}
        <div className="grid grid-cols-3 gap-4">
          <Input
            type="number"
            label="Page"
            value={page}
            onChange={(e) => setPage(parseInt(e.target.value) || 1)}
            min="1"
          />
          <Input
            type="number"
            label="Page Size"
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value) || 100)}
            min="1"
            max="1000"
          />
          <Input
            type="number"
            label="Max Records"
            value={maxRecords}
            onChange={(e) => setMaxRecords(parseInt(e.target.value) || 1000)}
            min="1"
          />
        </div>

        {/* Export Format */}
        <RadioGroup
          label="Export Format"
          name="format"
          value={format}
          onChange={(value) => setFormat(value as "json" | "csv")}
          options={formatOptions}
          orientation="horizontal"
        />

        {/* Include Options */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Include Additional Data
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={includeLocations}
                onChange={(e) => setIncludeLocations(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Include Locations</span>
            </label>
            <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={includeContacts}
                onChange={(e) => setIncludeContacts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Include Contacts</span>
            </label>
            <label className="flex items-center gap-2 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={includeMappings}
                onChange={(e) => setIncludeMappings(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium">Include Mappings</span>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            disabled={suppliers.length === 0 || isLoading}
            leftIcon={<Download className="w-5 h-5" />}
            className="w-full"
          >
            {isLoading ? "Creating Export..." : "Create Export"}
          </Button>
        </div>
      </form>
    </div>
  );
}
