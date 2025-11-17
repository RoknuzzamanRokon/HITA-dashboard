"use client";

import React, { useState, memo, useCallback, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { RadioGroup, RadioOption } from "@/lib/components/ui/radio-group";
import { MappingExportFilters, ExportFilters } from "@/lib/types/exports";
import {
  Download,
  Filter,
  Calendar,
  Hash,
  FileJson,
  FileSpreadsheet,
  CheckCircle,
  RotateCcw,
} from "lucide-react";
import { clsx } from "clsx";

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
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 animate-pulse rounded-lg" />
      </div>
    ),
  }
);

export interface MappingExportPanelProps {
  onExportCreate: (filters: MappingExportFilters) => Promise<void>;
  isLoading: boolean;
}

// Common supplier options (can be fetched from API in real implementation)
const SUPPLIER_OPTIONS = [
  { value: "expedia", label: "Expedia" },
  { value: "booking", label: "Booking.com" },
  { value: "agoda", label: "Agoda" },
  { value: "hotels", label: "Hotels.com" },
  { value: "airbnb", label: "Airbnb" },
];

export const MappingExportPanel = memo(function MappingExportPanel({
  onExportCreate,
  isLoading,
}: MappingExportPanelProps) {
  // Form state
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [ittids, setIttids] = useState<string>("All");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [maxRecords, setMaxRecords] = useState<number>(1000);
  const [format, setFormat] = useState<"json" | "csv">("json");

  // Multi-select state for suppliers
  const [selectedSupplierValues, setSelectedSupplierValues] = useState<
    Set<string>
  >(new Set());

  // Validation errors state
  const [errors, setErrors] = useState<{
    suppliers?: string;
    dateRange?: string;
    maxRecords?: string;
  }>({});

  // Preset loaded feedback state
  const [presetLoaded, setPresetLoaded] = useState(false);

  // Debounce timer for ITT IDs input
  const ittidsDebounceRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (ittidsDebounceRef.current) {
        clearTimeout(ittidsDebounceRef.current);
      }
    };
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
    setIttids("All");
    setDateFrom("");
    setDateTo("");
    setMaxRecords(1000);
    setFormat("json");

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

  // Handle loading a preset
  const handleLoadPreset = useCallback((filters: MappingExportFilters) => {
    // Update all form fields with preset values
    setSuppliers(filters.filters.suppliers);
    setSelectedSupplierValues(new Set(filters.filters.suppliers));

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
    setMaxRecords(filters.filters.max_records);
    setFormat(filters.format);

    // Clear any validation errors
    setErrors({});

    // Show visual feedback
    setPresetLoaded(true);
    setTimeout(() => setPresetLoaded(false), 3000);
  }, []);

  // Get current filters for preset saving
  const getCurrentFilters = useCallback((): MappingExportFilters => {
    return {
      filters: {
        suppliers,
        ittids,
        date_from: formatDateToISO8601(dateFrom),
        date_to: formatDateToISO8601(dateTo),
        max_records: maxRecords,
      },
      format,
    };
  }, [suppliers, ittids, dateFrom, dateTo, maxRecords, format]);

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

    // Validate positive integers
    if (maxRecords < 1) {
      newErrors.maxRecords = "Max Records must be a positive integer";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [suppliers, dateFrom, dateTo, maxRecords]);

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
        // Build MappingExportFilters object matching API schema
        const filters: MappingExportFilters = {
          filters: {
            suppliers,
            ittids,
            date_from: formatDateToISO8601(dateFrom),
            date_to: formatDateToISO8601(dateTo),
            max_records: maxRecords,
          },
          format,
        };

        // Call onExportCreate prop with formatted filters
        await onExportCreate(filters);
      } catch (error) {
        // Handle submission errors
        console.error("Mapping export creation failed:", error);

        // Set a general error message
        setErrors((prev) => ({
          ...prev,
          suppliers:
            error instanceof Error
              ? error.message
              : "Failed to create mapping export. Please try again.",
        }));
      }
    },
    [
      suppliers,
      ittids,
      dateFrom,
      dateTo,
      maxRecords,
      format,
      validateForm,
      formatDateToISO8601,
      onExportCreate,
    ]
  );

  // Check if form is valid for disabling submit button
  const isFormValid =
    suppliers.length > 0 &&
    (dateFrom && dateTo ? new Date(dateFrom) < new Date(dateTo) : true) &&
    maxRecords >= 1;

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
    <section
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-slate-200 dark:border-gray-700 p-6"
      aria-labelledby="mapping-export-filters-heading"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-xl flex items-center justify-center"
            aria-hidden="true"
          >
            <Filter className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <h2
            id="mapping-export-filters-heading"
            className="text-xl font-bold text-slate-900 dark:text-gray-100"
          >
            Mapping Export Filters
          </h2>
        </div>

        {/* Filter Presets Manager */}
        <FilterPresetsManager
          exportType="mapping"
          currentFilters={getCurrentFilters()}
          onLoadPreset={handleLoadPreset as (filters: ExportFilters) => void}
        />
      </div>

      {/* Preset Loaded Feedback */}
      {presetLoaded && (
        <div
          role="status"
          aria-live="polite"
          className="mb-4 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg flex items-center gap-2 animate-fade-in"
        >
          <CheckCircle
            className="w-5 h-5 text-green-600 dark:text-green-400"
            aria-hidden="true"
          />
          <span className="text-sm font-medium text-green-800 dark:text-green-200">
            Preset loaded successfully!
          </span>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        aria-label="Mapping export filter form"
      >
        {/* Suppliers Multi-Select */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Suppliers{" "}
            <span
              className="text-red-500 dark:text-red-400"
              aria-label="required"
            >
              *
            </span>
          </legend>
          <div
            className="grid grid-cols-2 md:grid-cols-3 gap-2"
            role="group"
            aria-labelledby="mapping-suppliers-label"
            aria-describedby={
              errors.suppliers ? "mapping-suppliers-error" : undefined
            }
          >
            {SUPPLIER_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={clsx(
                  "flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                  selectedSupplierValues.has(option.value)
                    ? "border-purple-500 bg-purple-50 dark:border-purple-400 dark:bg-purple-900/30"
                    : errors.suppliers
                    ? "border-red-300 hover:border-red-400 dark:border-red-600 dark:hover:border-red-500"
                    : "border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500"
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedSupplierValues.has(option.value)}
                  onChange={() => handleSupplierToggle(option.value)}
                  className="w-4 h-4 text-purple-600 dark:text-purple-400 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                  aria-label={`Select ${option.label} supplier`}
                />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
          {errors.suppliers && (
            <p
              id="mapping-suppliers-error"
              className="mt-2 text-sm text-red-600 dark:text-red-400"
              role="alert"
            >
              {errors.suppliers}
            </p>
          )}
        </fieldset>

        {/* ITT IDs */}
        <Input
          label="ITT IDs"
          placeholder='Enter ITT IDs (comma-separated) or "All"'
          defaultValue={ittids}
          onChange={(e) => handleIttidsChange(e.target.value)}
          leftIcon={<Hash className="w-4 h-4" />}
          helperText='Use "All" for all ITT IDs or comma-separated values'
        />

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
            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
              {errors.dateRange}
            </p>
          )}
        </div>

        {/* Max Records */}
        <Input
          type="number"
          label="Max Records"
          value={maxRecords}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 1000;
            setMaxRecords(val);
            // Clear maxRecords error when valid
            if (val >= 1 && errors.maxRecords) {
              setErrors((prev) => ({ ...prev, maxRecords: undefined }));
            }
          }}
          min="1"
          error={errors.maxRecords}
          helperText="Maximum number of mapping records to export"
        />

        {/* Export Format */}
        <RadioGroup
          label="Export Format"
          name="format"
          value={format}
          onChange={(value) => setFormat(value as "json" | "csv")}
          options={formatOptions}
          orientation="horizontal"
        />

        {/* Action Buttons */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex gap-3">
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
            {isLoading ? "Creating Mapping Export..." : "Create Mapping Export"}
          </Button>
        </div>
      </form>
    </section>
  );
});
