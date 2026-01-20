"use client";

import React, { useState, memo, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { Select, SelectOption } from "@/lib/components/ui/select";
import { RadioGroup, RadioOption } from "@/lib/components/ui/radio-group";
import { HotelExportFilters, ExportFilters } from "@/lib/types/exports";
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
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { clsx } from "clsx";
import { TokenStorage } from "@/lib/auth/token-storage";

// Lazy load FilterPresetsManager for better code splitting
const FilterPresetsManager = dynamic(
  () =>
    import("./filter-presets-manager").then((mod) => ({
      default: mod.FilterPresetsManager,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex gap-2">
        <div className="h-10 w-32 bg-[rgb(var(--bg-secondary))] animate-pulse rounded-lg" />
        <div className="h-10 w-32 bg-[rgb(var(--bg-secondary))] animate-pulse rounded-lg" />
      </div>
    ),
  }
);

export interface ExportFilterPanelProps {
  onExportCreate: (filters: HotelExportFilters) => Promise<void>;
  isLoading: boolean;
}

// Property type options
const PROPERTY_TYPE_OPTIONS = [
  { value: "hotel", label: "Hotel" },
  { value: "resort", label: "Resort" },
  { value: "apartment", label: "Apartment" },
  { value: "villa", label: "Villa" },
  { value: "hostel", label: "Hostel" },
  { value: "guesthouse", label: "Guest House" },
];

export const ExportFilterPanel = memo(function ExportFilterPanel({
  onExportCreate,
  isLoading,
}: ExportFilterPanelProps) {
  // Supplier options state (fetched from API)
  const [supplierOptions, setSupplierOptions] = useState<SelectOption[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  // Form state
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [countryCodes, setCountryCodes] = useState<string>("All");
  const [minRating, setMinRating] = useState<number>(0);
  const [maxRating, setMaxRating] = useState<number>(5);
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [ittids, setIttids] = useState<string>("All");
  const [propertyTypes, setPropertyTypes] = useState<string[]>([]);
  const [format, setFormat] = useState<"json" | "csv" | "excel">("json");
  const [includeLocations, setIncludeLocations] = useState<boolean>(true);
  const [includeContacts, setIncludeContacts] = useState<boolean>(true);
  const [includeMappings, setIncludeMappings] = useState<boolean>(true);

  // Multi-select state for suppliers
  const [selectedSupplierValues, setSelectedSupplierValues] = useState<
    Set<string>
  >(new Set());

  // Validation errors state
  const [errors, setErrors] = useState<{
    suppliers?: string;
    dateRange?: string;
    ratingRange?: string;
  }>({});

  // Preset loaded feedback state
  const [presetLoaded, setPresetLoaded] = useState(false);

  // Debounce timers for text inputs
  const countryCodesDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const ittidsDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch active suppliers on mount
  useEffect(() => {
    const fetchActiveSuppliers = async () => {
      setLoadingSuppliers(true);
      try {
        const token = TokenStorage.getToken();
        if (!token) {
          console.error("No authentication token found");
          setLoadingSuppliers(false);
          return;
        }

        console.log("Fetching active suppliers...");
        const response = await fetch(
          "http://127.0.0.1:8001/v1.0/user/check-active-my-supplier",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log("Supplier data received:", data);

          // Convert on_supplier_list to SelectOption format
          if (data.on_supplier_list && Array.isArray(data.on_supplier_list)) {
            const options: SelectOption[] = data.on_supplier_list.map(
              (supplier: string) => ({
                value: supplier,
                label: supplier.charAt(0).toUpperCase() + supplier.slice(1),
              })
            );
            console.log("Supplier options:", options);
            setSupplierOptions(options);
          } else {
            console.error("Invalid data format:", data);
          }
        } else {
          const errorText = await response.text();
          console.error(
            "Failed to fetch suppliers:",
            response.status,
            errorText
          );
        }
      } catch (error) {
        console.error("Error fetching active suppliers:", error);
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchActiveSuppliers();
  }, []);

  // Cleanup debounce timers on unmount
  useEffect(() => {
    return () => {
      if (countryCodesDebounceRef.current) {
        clearTimeout(countryCodesDebounceRef.current);
      }
      if (ittidsDebounceRef.current) {
        clearTimeout(ittidsDebounceRef.current);
      }
    };
  }, []);

  // Debounced handler for country codes input (300ms delay)
  const handleCountryCodesChange = useCallback((value: string) => {
    if (countryCodesDebounceRef.current) {
      clearTimeout(countryCodesDebounceRef.current);
    }
    countryCodesDebounceRef.current = setTimeout(() => {
      setCountryCodes(value);
    }, 300);
  }, []);

  // Debounced handler for ITT IDs input (300ms delay)
  const handleIttidsChange = useCallback((value: string) => {
    if (ittidsDebounceRef.current) {
      clearTimeout(ittidsDebounceRef.current);
    }
    ittidsDebounceRef.current = setTimeout(() => {
      setIttids(value);
    }, 300);
  }, []);

  // Reset filters to default values
  const resetFilters = useCallback(() => {
    setSuppliers([]);
    setSelectedSupplierValues(new Set());
    setCountryCodes("All");
    setMinRating(0);
    setMaxRating(5);
    setDateFrom("");
    setDateTo("");
    setIttids("All");
    setPropertyTypes([]);
    setFormat("json");
    setIncludeLocations(true);
    setIncludeContacts(true);
    setIncludeMappings(true);

    // Clear any validation errors
    setErrors({});
  }, []);

  const handleSupplierToggle = useCallback(
    (value: string) => {
      const newSet = new Set(selectedSupplierValues);
      if (newSet.has(value)) {
        newSet.delete(value);
      } else {
        newSet.add(value);
      }
      setSelectedSupplierValues(newSet);
      const newSuppliers = Array.from(newSet);
      setSuppliers(newSuppliers);

      // Clear supplier error when at least one is selected
      if (newSuppliers.length > 0 && errors.suppliers) {
        setErrors((prev) => ({ ...prev, suppliers: undefined }));
      }
    },
    [selectedSupplierValues, errors.suppliers]
  );

  const handlePropertyTypeToggle = useCallback((value: string) => {
    setPropertyTypes((prev) =>
      prev.includes(value) ? prev.filter((t) => t !== value) : [...prev, value]
    );
  }, []);

  // Handle loading a preset
  const handleLoadPreset = useCallback((filters: HotelExportFilters) => {
    // Update all form fields with preset values
    setSuppliers(filters.filters.suppliers);
    setSelectedSupplierValues(new Set(filters.filters.suppliers));
    setCountryCodes(filters.filters.country_codes);
    setMinRating(filters.filters.min_rating);
    setMaxRating(filters.filters.max_rating);

    // Convert ISO 8601 dates back to date input format (YYYY-MM-DD)
    if (filters.filters.date_from) {
      const fromDate = filters.filters.date_from.substring(0, 10);
      setDateFrom(fromDate);
    }
    if (filters.filters.date_to) {
      const toDate = filters.filters.date_to.substring(0, 10);
      setDateTo(toDate);
    }

    setIttids(filters.filters.ittids);
    setPropertyTypes(
      filters.filters.property_types === "All"
        ? PROPERTY_TYPE_OPTIONS.map((opt) => opt.value)
        : filters.filters.property_types
    );
    setFormat(filters.format);
    setIncludeLocations(filters.include_locations);
    setIncludeContacts(filters.include_contacts);
    setIncludeMappings(filters.include_mappings);

    // Clear any validation errors
    setErrors({});

    // Show visual feedback
    setPresetLoaded(true);
    setTimeout(() => setPresetLoaded(false), 3000);
  }, []);

  // Get current filters for preset saving
  const getCurrentFilters = useCallback((): HotelExportFilters => {
    return {
      filters: {
        suppliers,
        country_codes: countryCodes,
        min_rating: minRating,
        max_rating: maxRating,
        date_from: formatDateToISO8601(dateFrom),
        date_to: formatDateToISO8601(dateTo),
        ittids,
        property_types: propertyTypes,
      },
      format,
      include_locations: includeLocations,
      include_contacts: includeContacts,
      include_mappings: includeMappings,
    };
  }, [
    suppliers,
    countryCodes,
    minRating,
    maxRating,
    dateFrom,
    dateTo,
    ittids,
    propertyTypes,
    format,
    includeLocations,
    includeContacts,
    includeMappings,
  ]);

  // Validation function
  const validateForm = useCallback((): boolean => {
    const newErrors: typeof errors = {};

    // Validate required fields - at least one supplier
    if (suppliers.length === 0) {
      newErrors.suppliers = "At least one supplier must be selected";
    }

    // Validate date range (from < to)
    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      if (fromDate >= toDate) {
        newErrors.dateRange = "Date From must be before Date To";
      }
    }

    // Validate star rating range (min <= max)
    if (minRating > maxRating) {
      newErrors.ratingRange =
        "Min Rating must be less than or equal to Max Rating";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [
    suppliers,
    dateFrom,
    dateTo,
    minRating,
    maxRating,
  ]);

  // Format date to ISO 8601 format (YYYY-MM-DDTHH:mm:ss)
  const formatDateToISO8601 = useCallback((dateString: string): string => {
    if (!dateString) return "";

    const date = new Date(dateString);
    // Ensure valid date
    if (isNaN(date.getTime())) return "";

    // Format to ISO 8601 with time: YYYY-MM-DDTHH:mm:ss
    // toISOString() returns YYYY-MM-DDTHH:mm:ss.sssZ, we need to remove milliseconds and Z
    const isoString = date.toISOString();
    return isoString.substring(0, 19); // Returns YYYY-MM-DDTHH:mm:ss
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form before submission
      if (!validateForm()) {
        return;
      }

      try {
        // Build HotelExportFilters object matching API schema
        const filters: HotelExportFilters = {
          filters: {
            suppliers,
            country_codes: countryCodes,
            min_rating: minRating,
            max_rating: maxRating,
            date_from: formatDateToISO8601(dateFrom),
            date_to: formatDateToISO8601(dateTo),
            ittids,
            property_types:
              propertyTypes.length === 0 ||
              propertyTypes.length === PROPERTY_TYPE_OPTIONS.length
                ? "All"
                : propertyTypes,
          },
          format,
          include_locations: includeLocations,
          include_contacts: includeContacts,
          include_mappings: includeMappings,
        };

        // Call onExportCreate prop with formatted filters
        await onExportCreate(filters);
      } catch (error) {
        // Handle submission errors
        console.error("Export creation failed:", error);

        // Set a general error message
        setErrors((prev) => ({
          ...prev,
          suppliers:
            error instanceof Error
              ? error.message
              : "Failed to create export. Please try again.",
        }));
      }
    },
    [
      suppliers,
      countryCodes,
      minRating,
      maxRating,
      dateFrom,
      dateTo,
      ittids,
      propertyTypes,
      format,
      includeLocations,
      includeContacts,
      includeMappings,
      validateForm,
      formatDateToISO8601,
      onExportCreate,
    ]
  );

  // Check if form is valid for disabling submit button
  const isFormValid =
    suppliers.length > 0 &&
    (dateFrom && dateTo ? new Date(dateFrom) < new Date(dateTo) : true) &&
    minRating <= maxRating;

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
    {
      value: "excel",
      label: "Excel",
      description: "Microsoft Excel Format",
      icon: <FileSpreadsheet className="w-4 h-4" />,
    },
  ];

  return (
    <section
      className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-6"
      aria-labelledby="hotel-export-filters-heading"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 bg-primary-color/10 rounded-xl flex items-center justify-center active:brightness-110"
            aria-hidden="true"
          >
            <Filter className="w-5 h-5 text-primary-color" />
          </div>
          <h2
            id="hotel-export-filters-heading"
            className="text-xl font-bold text-[rgb(var(--text-primary))]"
          >
            Export Filters
          </h2>
        </div>

        {/* Filter Presets Manager */}
        <FilterPresetsManager
          exportType="hotel"
          currentFilters={getCurrentFilters()}
          onLoadPreset={handleLoadPreset as (filters: ExportFilters) => void}
        />
      </div>

      {/* Preset Loaded Feedback */}
      {presetLoaded && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 animate-fade-in"
        >
          <CheckCircle className="w-5 h-5 text-green-600" aria-hidden="true" />
          <span className="text-sm font-medium text-green-800">
            Preset loaded successfully!
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        aria-label="Hotel export filter form"
      >
        {/* Suppliers Multi-Select */}
        <fieldset>
          <legend className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
            Suppliers{" "}
            <span className="text-red-500" aria-label="required">
              *
            </span>
          </legend>
          <div
            className="grid grid-cols-2 md:grid-cols-3 gap-2"
            role="group"
            aria-labelledby="suppliers-label"
            aria-describedby={errors.suppliers ? "suppliers-error" : undefined}
          >
            {loadingSuppliers ? (
              <div className="col-span-full flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color"></div>
                <span className="ml-2 text-[rgb(var(--text-secondary))]">
                  Loading suppliers...
                </span>
              </div>
            ) : supplierOptions.length === 0 ? (
              <div className="col-span-full text-center py-4 text-[rgb(var(--text-secondary))]">
                No active suppliers found
              </div>
            ) : (
              <>
                {/* All Option */}
                <label
                  className={clsx(
                    "flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    selectedSupplierValues.size === supplierOptions.length
                      ? "border-green-500 bg-green-50"
                      : "border-[rgb(var(--border-primary))] hover:border-green-400"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={
                      selectedSupplierValues.size === supplierOptions.length
                    }
                    onChange={() => {
                      if (
                        selectedSupplierValues.size === supplierOptions.length
                      ) {
                        // Deselect all
                        setSelectedSupplierValues(new Set());
                        setSuppliers([]);
                      } else {
                        // Select all
                        const allValues = new Set(
                          supplierOptions.map((opt) => opt.value.toString())
                        );
                        setSelectedSupplierValues(allValues);
                        setSuppliers(Array.from(allValues));
                        // Clear supplier error when all selected
                        if (errors.suppliers) {
                          setErrors((prev) => ({
                            ...prev,
                            suppliers: undefined,
                          }));
                        }
                      }
                    }}
                    className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                    aria-label="Select all suppliers"
                  />
                  <span className="text-sm font-bold text-green-600">All</span>
                </label>

                {/* Individual Suppliers */}
                {supplierOptions.map((option) => (
                  <label
                    key={option.value}
                    className={clsx(
                      "flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                      selectedSupplierValues.has(option.value.toString())
                        ? "border-blue-500 bg-blue-50"
                        : errors.suppliers
                        ? "border-red-300 hover:border-red-400"
                        : "border-[rgb(var(--border-primary))] hover:border-[rgb(var(--border-primary))]"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={selectedSupplierValues.has(
                        option.value.toString()
                      )}
                      onChange={() =>
                        handleSupplierToggle(option.value.toString())
                      }
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      aria-label={`Select ${option.label} supplier`}
                    />
                    <span className="text-sm font-medium text-[rgb(var(--text-primary))]">
                      {option.label}
                    </span>
                  </label>
                ))}
              </>
            )}
          </div>
          {errors.suppliers && (
            <p
              id="suppliers-error"
              className="mt-2 text-sm text-red-600"
              role="alert"
            >
              {errors.suppliers}
            </p>
          )}
        </fieldset>

        {/* Country Codes */}
        <Input
          label="Country Codes"
          placeholder='Enter country codes (e.g., "US,UK,CA") or "All"'
          defaultValue={countryCodes}
          onChange={(e) => handleCountryCodesChange(e.target.value)}
          leftIcon={<Globe className="w-4 h-4" />}
          helperText='Use "All" for all countries or comma-separated codes'
        />

        {/* Star Rating Range */}
        <fieldset
          aria-describedby={errors.ratingRange ? "rating-error" : undefined}
        >
          <legend className="sr-only">Star rating range</legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="min-rating"
                className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2"
              >
                Min Rating
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="min-rating"
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={minRating}
                  onChange={(e) => {
                    setMinRating(parseFloat(e.target.value));
                    // Clear rating error when valid
                    if (
                      parseFloat(e.target.value) <= maxRating &&
                      errors.ratingRange
                    ) {
                      setErrors((prev) => ({
                        ...prev,
                        ratingRange: undefined,
                      }));
                    }
                  }}
                  className="flex-1 h-2 bg-[rgb(var(--bg-secondary))] rounded-lg appearance-none cursor-pointer"
                  aria-label={`Minimum star rating: ${minRating} stars`}
                  aria-valuemin={0}
                  aria-valuemax={5}
                  aria-valuenow={minRating}
                />
                <div
                  className="flex items-center gap-1 min-w-[60px]"
                  aria-hidden="true"
                >
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                    {minRating}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <label
                htmlFor="max-rating"
                className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2"
              >
                Max Rating
              </label>
              <div className="flex items-center gap-2">
                <input
                  id="max-rating"
                  type="range"
                  min="0"
                  max="5"
                  step="0.5"
                  value={maxRating}
                  onChange={(e) => {
                    setMaxRating(parseFloat(e.target.value));
                    // Clear rating error when valid
                    if (
                      minRating <= parseFloat(e.target.value) &&
                      errors.ratingRange
                    ) {
                      setErrors((prev) => ({
                        ...prev,
                        ratingRange: undefined,
                      }));
                    }
                  }}
                  className="flex-1 h-2 bg-[rgb(var(--bg-secondary))] rounded-lg appearance-none cursor-pointer"
                  aria-label={`Maximum star rating: ${maxRating} stars`}
                  aria-valuemin={0}
                  aria-valuemax={5}
                  aria-valuenow={maxRating}
                />
                <div
                  className="flex items-center gap-1 min-w-[60px]"
                  aria-hidden="true"
                >
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-sm font-semibold text-[rgb(var(--text-primary))]">
                    {maxRating}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {errors.ratingRange && (
            <p
              id="rating-error"
              className="mt-2 text-sm text-red-600"
              role="alert"
            >
              {errors.ratingRange}
            </p>
          )}
        </fieldset>

        {/* Date Range */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Date From"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                // Clear date error when valid
                if (
                  e.target.value &&
                  dateTo &&
                  new Date(e.target.value) < new Date(dateTo) &&
                  errors.dateRange
                ) {
                  setErrors((prev) => ({ ...prev, dateRange: undefined }));
                }
              }}
              leftIcon={<Calendar className="w-4 h-4" />}
              error={errors.dateRange}
            />
            <Input
              type="date"
              label="Date To"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                // Clear date error when valid
                if (
                  dateFrom &&
                  e.target.value &&
                  new Date(dateFrom) < new Date(e.target.value) &&
                  errors.dateRange
                ) {
                  setErrors((prev) => ({ ...prev, dateRange: undefined }));
                }
              }}
              leftIcon={<Calendar className="w-4 h-4" />}
              error={errors.dateRange}
            />
          </div>
          {errors.dateRange && (
            <p className="mt-2 text-sm text-red-600">{errors.dateRange}</p>
          )}
        </div>

        {/* ITT IDs */}
        <Input
          label="ITT IDs"
          placeholder='Enter ITT IDs (comma-separated) or "All"'
          defaultValue={ittids}
          onChange={(e) => handleIttidsChange(e.target.value)}
          leftIcon={<Hash className="w-4 h-4" />}
          helperText='Use "All" for all ITT IDs or comma-separated values'
        />

        {/* Property Types */}
        <fieldset>
          <legend className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
            Property Types
          </legend>
          <div
            className="grid grid-cols-2 md:grid-cols-3 gap-2"
            role="group"
            aria-label="Property types"
          >
            {/* All Option */}
            <label
              className={clsx(
                "flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                propertyTypes.length === PROPERTY_TYPE_OPTIONS.length
                  ? "border-green-500 bg-green-50"
                  : "border-[rgb(var(--border-primary))] hover:border-green-400"
              )}
            >
              <input
                type="checkbox"
                checked={propertyTypes.length === PROPERTY_TYPE_OPTIONS.length}
                onChange={() => {
                  if (propertyTypes.length === PROPERTY_TYPE_OPTIONS.length) {
                    // Deselect all
                    setPropertyTypes([]);
                  } else {
                    // Select all
                    setPropertyTypes(
                      PROPERTY_TYPE_OPTIONS.map((opt) => opt.value)
                    );
                  }
                }}
                className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                aria-label="Select all property types"
              />
              <Building className="w-4 h-4 text-green-600" aria-hidden="true" />
              <span className="text-sm font-bold text-green-600">All</span>
            </label>

            {/* Individual Property Types */}
            {PROPERTY_TYPE_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={clsx(
                  "flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  propertyTypes.includes(option.value)
                    ? "border-blue-500 bg-blue-50"
                    : "border-[rgb(var(--border-primary))] hover:border-[rgb(var(--border-primary))]"
                )}
              >
                <input
                  type="checkbox"
                  checked={propertyTypes.includes(option.value)}
                  onChange={() => handlePropertyTypeToggle(option.value)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  aria-label={`Select ${option.label} property type`}
                />
                <Building
                  className="w-4 h-4 text-[rgb(var(--text-tertiary))]"
                  aria-hidden="true"
                />
                <span className="text-sm font-medium text-[rgb(var(--text-primary))]">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Export Format */}
        <RadioGroup
          label="Export Format"
          name="format"
          value={format}
          onChange={(value) => setFormat(value as "json" | "csv" | "excel")}
          options={formatOptions}
          orientation="horizontal"
        />

        {/* Include Options */}
        <fieldset>
          <legend className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-3">
            Include Additional Data
          </legend>
          <div
            className="space-y-2"
            role="group"
            aria-label="Additional data options"
          >
            <label className="flex items-center gap-2 p-3 rounded-lg border border-[rgb(var(--border-primary))] hover:bg-[rgb(var(--bg-secondary))] cursor-pointer">
              <input
                type="checkbox"
                checked={includeLocations}
                onChange={(e) => setIncludeLocations(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                aria-label="Include location data in export"
              />
              <span className="text-sm font-medium text-[rgb(var(--text-primary))]">
                Include Locations
              </span>
            </label>
            <label className="flex items-center gap-2 p-3 rounded-lg border border-[rgb(var(--border-primary))] hover:bg-[rgb(var(--bg-secondary))] cursor-pointer">
              <input
                type="checkbox"
                checked={includeContacts}
                onChange={(e) => setIncludeContacts(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                aria-label="Include contact data in export"
              />
              <span className="text-sm font-medium text-[rgb(var(--text-primary))]">
                Include Contacts
              </span>
            </label>
            <label className="flex items-center gap-2 p-3 rounded-lg border border-[rgb(var(--border-primary))] hover:bg-[rgb(var(--bg-secondary))] cursor-pointer">
              <input
                type="checkbox"
                checked={includeMappings}
                onChange={(e) => setIncludeMappings(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                aria-label="Include mapping data in export"
              />
              <span className="text-sm font-medium text-[rgb(var(--text-primary))]">
                Include Mappings
              </span>
            </label>
          </div>
        </fieldset>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-[rgb(var(--border-primary))] flex gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={resetFilters}
            disabled={isLoading}
            leftIcon={<RotateCcw className="w-5 h-5" />}
            className="flex-1"
          >
            Reset Filters
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isLoading}
            disabled={!isFormValid || isLoading}
            leftIcon={<Download className="w-5 h-5" />}
            className="flex-2"
          >
            {isLoading ? "Creating Export..." : "Create Export"}
          </Button>
        </div>
      </form>
    </section>
  );
});
