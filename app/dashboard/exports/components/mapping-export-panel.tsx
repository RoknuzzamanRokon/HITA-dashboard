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
import { TokenStorage } from "@/lib/auth/token-storage";
import { SelectOption } from "@/lib/components/ui/select";

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

export interface MappingExportPanelProps {
  onExportCreate: (filters: MappingExportFilters) => Promise<void>;
  isLoading: boolean;
}

export const MappingExportPanel = memo(function MappingExportPanel({
  onExportCreate,
  isLoading,
}: MappingExportPanelProps) {
  // Supplier options state (fetched from API)
  const [supplierOptions, setSupplierOptions] = useState<SelectOption[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);

  // Form state
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [ittids, setIttids] = useState<string>("All");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [maxRecords, setMaxRecords] = useState<number | "All">(1000);
  const [format, setFormat] = useState<"json" | "csv" | "excel">("json");

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

        if (response.ok) {
          const data = await response.json();

          // Convert on_supplier_list to SelectOption format
          if (data.on_supplier_list && Array.isArray(data.on_supplier_list)) {
            const options: SelectOption[] = data.on_supplier_list.map(
              (supplier: string) => ({
                value: supplier,
                label: supplier.charAt(0).toUpperCase() + supplier.slice(1),
              })
            );
            setSupplierOptions(options);
          }
        } else {
          console.error("Failed to fetch suppliers:", response.status);
        }
      } catch (error) {
        console.error("Error fetching active suppliers:", error);
      } finally {
        setLoadingSuppliers(false);
      }
    };

    fetchActiveSuppliers();
  }, []);

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

    // Validate date range - both dates must be provided together or both empty
    if (dateFrom || dateTo) {
      // If one date is provided, both must be provided
      if (!dateFrom || !dateTo) {
        newErrors.dateRange = "Both Date From and Date To must be provided";
      } else {
        // Validate that from < to
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        if (fromDate >= toDate) {
          newErrors.dateRange = "Date From must be before Date To";
        }
      }
    }

    // Validate positive integers (only if not "All")
    if (maxRecords !== "All") {
      const numValue =
        typeof maxRecords === "string" ? parseInt(maxRecords) : maxRecords;
      if (isNaN(numValue) || numValue < 1) {
        newErrors.maxRecords =
          "Max Records must be a positive integer or 'All'";
      }
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

      console.log("📝 Form submitted");
      console.log("📝 Form data:", {
        suppliers,
        ittids,
        dateFrom,
        dateTo,
        maxRecords,
        format,
      });

      // Validate form before submission
      if (!validateForm()) {
        console.error("❌ Form validation failed");
        return;
      }

      console.log("✅ Form validation passed");

      try {
        // Normalize maxRecords value
        let normalizedMaxRecords: number | "All";
        if (
          typeof maxRecords === "string" &&
          maxRecords.toLowerCase() === "all"
        ) {
          normalizedMaxRecords = "All";
        } else if (typeof maxRecords === "number") {
          normalizedMaxRecords = maxRecords;
        } else {
          const parsed = parseInt(maxRecords.toString());
          normalizedMaxRecords = !isNaN(parsed) ? parsed : 1000;
        }

        // Build MappingExportFilters object matching API schema
        const filters: MappingExportFilters = {
          filters: {
            suppliers,
            ittids,
            date_from: formatDateToISO8601(dateFrom),
            date_to: formatDateToISO8601(dateTo),
            max_records: normalizedMaxRecords,
          },
          format,
        };

        console.log(
          "📤 Sending export request with filters:",
          JSON.stringify(filters, null, 2)
        );

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
    // Date validation: both provided and valid, or both empty
    ((dateFrom && dateTo && new Date(dateFrom) < new Date(dateTo)) ||
      (!dateFrom && !dateTo)) &&
    (maxRecords === "All" ||
      (typeof maxRecords === "number" && maxRecords >= 1) ||
      (!isNaN(parseInt(maxRecords.toString())) &&
        parseInt(maxRecords.toString()) >= 1));

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
      aria-labelledby="mapping-export-filters-heading"
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
            id="mapping-export-filters-heading"
            className="text-xl font-bold text-[rgb(var(--text-primary))]"
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
        aria-label="Mapping export filter form"
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
            aria-labelledby="mapping-suppliers-label"
            aria-describedby={
              errors.suppliers ? "mapping-suppliers-error" : undefined
            }
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
                        ? "border-purple-500 bg-purple-50"
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
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
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
              id="mapping-suppliers-error"
              className="mt-2 text-sm text-red-600"
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
          <label className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2">
            Date Range (Optional)
          </label>
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
          {errors.dateRange ? (
            <p className="mt-2 text-sm text-red-600">{errors.dateRange}</p>
          ) : (
            <p className="mt-2 text-sm text-[rgb(var(--text-tertiary))]">
              Leave empty to export all records, or specify a date range to
              filter
            </p>
          )}
        </div>

        {/* Max Records */}
        <Input
          type="text"
          label="Max Records"
          value={maxRecords.toString()}
          onChange={(e) => {
            const inputValue = e.target.value;

            // Allow any input while typing
            setMaxRecords(inputValue as any);

            // Clear errors if input becomes valid
            if (
              inputValue.toLowerCase() === "all" ||
              (!isNaN(parseInt(inputValue)) && parseInt(inputValue) >= 1)
            ) {
              if (errors.maxRecords) {
                setErrors((prev) => ({ ...prev, maxRecords: undefined }));
              }
            }
          }}
          onBlur={(e) => {
            const inputValue = e.target.value.trim();

            // Normalize "All" on blur (case-insensitive)
            if (inputValue.toLowerCase() === "all") {
              setMaxRecords("All");
            } else if (inputValue === "") {
              setMaxRecords(1000);
            } else {
              const val = parseInt(inputValue);
              if (!isNaN(val) && val >= 1) {
                setMaxRecords(val);
              } else {
                // Invalid input, reset to default
                setMaxRecords(1000);
              }
            }
          }}
          error={errors.maxRecords}
          helperText='Enter a number or "All" to export all records'
          placeholder='e.g., 1000 or "All"'
        />

        {/* Export Format */}
        <RadioGroup
          label="Export Format"
          name="format"
          value={format}
          onChange={(value) => setFormat(value as "json" | "csv" | "excel")}
          options={formatOptions}
          orientation="horizontal"
        />

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
            {isLoading ? "Creating Mapping Export..." : "Create Mapping Export"}
          </Button>
        </div>
      </form>
    </section>
  );
});
