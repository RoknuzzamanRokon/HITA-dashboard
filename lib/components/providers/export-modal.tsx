/**
 * Export Modal Component
 * Provides interface for exporting provider content with options and progress tracking
 */

"use client";

import { useState, useEffect } from "react";
import {
  X,
  Download,
  FileText,
  Database,
  Calendar,
  CheckCircle,
  AlertCircle,
  Loader2,
  Settings,
} from "lucide-react";
import { ProvidersApi } from "@/lib/api/providers";
import type { ExportOptions, ExportProgress } from "@/lib/types/provider";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  provider?: string;
  title?: string;
}

export function ExportModal({
  isOpen,
  onClose,
  provider,
  title = "Export Content",
}: ExportModalProps) {
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: "json",
    provider,
    includeFields: ["ittid", "name", "providerId", "mappingStatus"],
    filters: {},
  });

  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(
    null
  );
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Available fields for export
  const availableFields = [
    { key: "ittid", label: "ITTID", description: "Internal hotel identifier" },
    { key: "name", label: "Hotel Name", description: "Hotel name" },
    {
      key: "providerId",
      label: "Provider ID",
      description: "Provider-specific identifier",
    },
    {
      key: "providerName",
      label: "Provider Name",
      description: "Name of the provider",
    },
    {
      key: "systemType",
      label: "System Type",
      description: "Provider system type",
    },
    {
      key: "mappingStatus",
      label: "Mapping Status",
      description: "Current mapping status",
    },
    { key: "rating", label: "Rating", description: "Hotel rating" },
    {
      key: "propertyType",
      label: "Property Type",
      description: "Type of property",
    },
    { key: "address", label: "Address", description: "Hotel address" },
    {
      key: "coordinates",
      label: "Coordinates",
      description: "Latitude and longitude",
    },
    {
      key: "vervotechId",
      label: "Vervotech ID",
      description: "Vervotech mapping ID",
    },
    {
      key: "giataCode",
      label: "Giata Code",
      description: "Giata mapping code",
    },
    {
      key: "lastUpdated",
      label: "Last Updated",
      description: "Last update timestamp",
    },
  ];

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setExportProgress(null);
      setIsExporting(false);
      setError(null);
      setExportOptions((prev) => ({
        ...prev,
        provider,
      }));
    }
  }, [isOpen, provider]);

  // Poll for export progress
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (exportProgress && exportProgress.status === "processing") {
      interval = setInterval(async () => {
        try {
          const response = await ProvidersApi.getExportProgress(
            exportProgress.id
          );
          if (response.success && response.data) {
            setExportProgress(response.data);

            if (
              response.data.status === "completed" ||
              response.data.status === "error"
            ) {
              clearInterval(interval);
              setIsExporting(false);
            }
          }
        } catch (err) {
          console.error("Failed to fetch export progress:", err);
          clearInterval(interval);
          setIsExporting(false);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [exportProgress]);

  const handleFieldToggle = (fieldKey: string) => {
    setExportOptions((prev) => ({
      ...prev,
      includeFields: prev.includeFields.includes(fieldKey)
        ? prev.includeFields.filter((f) => f !== fieldKey)
        : [...prev.includeFields, fieldKey],
    }));
  };

  const handleFilterChange = (filterType: string, value: any) => {
    setExportOptions((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterType]: value,
      },
    }));
  };

  const handleExport = async () => {
    if (exportOptions.includeFields.length === 0) {
      setError("Please select at least one field to export");
      return;
    }

    setIsExporting(true);
    setError(null);

    try {
      const response = await ProvidersApi.initiateExport(exportOptions);

      if (response.success && response.data) {
        // Start polling for progress
        const progressResponse = await ProvidersApi.getExportProgress(
          response.data.exportId
        );
        if (progressResponse.success && progressResponse.data) {
          setExportProgress(progressResponse.data);
        }
      } else {
        setError(response.error?.message || "Failed to start export");
        setIsExporting(false);
      }
    } catch (err) {
      setError("Failed to start export");
      setIsExporting(false);
      console.error("Export error:", err);
    }
  };

  const handleDownload = async () => {
    if (!exportProgress?.downloadUrl) return;

    try {
      const response = await ProvidersApi.downloadExport(exportProgress.id);

      if (response.success && response.data) {
        // Create download link
        const blob = response.data as Blob;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `export-${exportProgress.id}.${exportOptions.format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        // Close modal after successful download
        onClose();
      } else {
        setError("Failed to download export file");
      }
    } catch (err) {
      setError("Failed to download export file");
      console.error("Download error:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Export Progress */}
          {exportProgress && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Export Progress</h3>
                <div className="flex items-center">
                  {exportProgress.status === "processing" && (
                    <Loader2 className="h-4 w-4 text-blue-500 animate-spin mr-2" />
                  )}
                  {exportProgress.status === "completed" && (
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  )}
                  {exportProgress.status === "error" && (
                    <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                  )}
                  <span className="text-sm text-gray-600 capitalize">
                    {exportProgress.status}
                  </span>
                </div>
              </div>

              {exportProgress.status === "processing" && (
                <div className="mb-2">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{exportProgress.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${exportProgress.progress}%` }}
                    ></div>
                  </div>
                  {exportProgress.processedRecords &&
                    exportProgress.totalRecords && (
                      <div className="text-xs text-gray-500 mt-1">
                        {exportProgress.processedRecords.toLocaleString()} of{" "}
                        {exportProgress.totalRecords.toLocaleString()} records
                      </div>
                    )}
                </div>
              )}

              {exportProgress.status === "completed" && (
                <button
                  onClick={handleDownload}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download File
                </button>
              )}

              {exportProgress.status === "error" &&
                exportProgress.errorMessage && (
                  <div className="text-sm text-red-600">
                    Error: {exportProgress.errorMessage}
                  </div>
                )}
            </div>
          )}

          {/* Export Options */}
          {!exportProgress && (
            <div className="space-y-6">
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export Format
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "json", label: "JSON", icon: Database },
                    { value: "csv", label: "CSV", icon: FileText },
                    { value: "excel", label: "Excel", icon: FileText },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() =>
                        setExportOptions((prev) => ({
                          ...prev,
                          format: value as any,
                        }))
                      }
                      className={`flex items-center justify-center p-3 border rounded-lg ${
                        exportOptions.format === value
                          ? "border-blue-500 bg-blue-50 text-blue-700"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Field Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fields to Include
                </label>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                  {availableFields.map((field) => (
                    <label
                      key={field.key}
                      className="flex items-start space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={exportOptions.includeFields.includes(
                          field.key
                        )}
                        onChange={() => handleFieldToggle(field.key)}
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {field.label}
                        </div>
                        <div className="text-xs text-gray-500">
                          {field.description}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filters */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Filters (Optional)
                </label>
                <div className="space-y-3">
                  {/* Mapping Status Filter */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Mapping Status
                    </label>
                    <select
                      value={exportOptions.filters?.mappingStatus || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "mappingStatus",
                          e.target.value || undefined
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">All statuses</option>
                      <option value="mapped">Mapped</option>
                      <option value="unmapped">Unmapped</option>
                      <option value="partial">Partial</option>
                    </select>
                  </div>

                  {/* Search Filter */}
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Search Term
                    </label>
                    <input
                      type="text"
                      placeholder="Filter by hotel name..."
                      value={exportOptions.filters?.search || ""}
                      onChange={(e) =>
                        handleFilterChange(
                          "search",
                          e.target.value || undefined
                        )
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>

          {!exportProgress && (
            <button
              onClick={handleExport}
              disabled={isExporting || exportOptions.includeFields.length === 0}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              {isExporting ? "Starting Export..." : "Start Export"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
