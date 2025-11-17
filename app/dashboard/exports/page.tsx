"use client";

/**
 * Main Exports Page Component
 *
 * Provides interface for creating and managing hotel and mapping export jobs.
 * Features:
 * - Tab navigation between Hotel Exports and Mapping Exports
 * - Filter panels for configuring export criteria
 * - Real-time job status monitoring with automatic polling
 * - Toast notifications for job status changes
 * - Export jobs list with download capabilities
 */

import React, { useState } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { useExportJobs } from "@/lib/hooks/use-export-jobs";
import { useExportPolling } from "@/lib/hooks/use-export-polling";
import { useExportNotifications } from "@/lib/hooks/use-export-notifications";
import { useNotification } from "@/lib/components/notifications/notification-provider";
import { ExportFilterPanel } from "./components/export-filter-panel";
import { MappingExportPanel } from "./components/mapping-export-panel";
import { ExportJobsList } from "./components/export-jobs-list";
import type {
  HotelExportFilters,
  MappingExportFilters,
  ExportJobStatus,
} from "@/lib/types/exports";
import { FileDown, Map } from "lucide-react";
import { clsx } from "clsx";

type ExportTab = "hotel" | "mapping";

export default function ExportsPage() {
  // Authentication check
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();

  // Tab state for switching between export types
  const [activeTab, setActiveTab] = useState<ExportTab>("hotel");

  // Initialize notification system
  const { addNotification } = useNotification();

  // Initialize export jobs state management
  const {
    jobs,
    createHotelExport,
    createMappingExport,
    refreshJobStatus,
    deleteJob,
    clearCompletedJobs,
    isCreating,
    error: jobsError,
  } = useExportJobs();

  // Status update handler for polling
  const handleStatusUpdate = (jobId: string, status: ExportJobStatus) => {
    // The status update is handled internally by refreshJobStatus
    // This callback is used by the polling hook to trigger updates
    refreshJobStatus(jobId).catch((error) => {
      console.error(`Failed to update status for job ${jobId}:`, error);
    });
  };

  // Download handler for notifications
  const handleDownload = (jobId: string) => {
    // This will be implemented in task 21
    console.log(`Download requested for job: ${jobId}`);
  };

  /**
   * Handler for creating hotel export jobs
   * Wraps the createHotelExport function with error handling and notifications
   */
  const handleCreateHotelExport = async (
    filters: HotelExportFilters
  ): Promise<void> => {
    try {
      await createHotelExport(filters);
      // Success notification is handled by useExportNotifications hook
    } catch (error) {
      // Display error notification
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create hotel export. Please try again.";

      addNotification({
        type: "error",
        title: "Export Creation Failed",
        message: errorMessage,
        autoDismiss: false, // Error notifications require manual dismiss
      });

      console.error("Hotel export creation error:", error);
      throw error; // Re-throw to allow filter panel to handle it
    }
  };

  /**
   * Handler for creating mapping export jobs
   * Wraps the createMappingExport function with error handling and notifications
   */
  const handleCreateMappingExport = async (
    filters: MappingExportFilters
  ): Promise<void> => {
    try {
      await createMappingExport(filters);
      // Success notification is handled by useExportNotifications hook
    } catch (error) {
      // Display error notification
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to create mapping export. Please try again.";

      addNotification({
        type: "error",
        title: "Mapping Export Creation Failed",
        message: errorMessage,
        autoDismiss: false, // Error notifications require manual dismiss
      });

      console.error("Mapping export creation error:", error);
      throw error; // Re-throw to allow filter panel to handle it
    }
  };

  // Initialize automatic status polling for processing jobs
  useExportPolling({
    jobs,
    onStatusUpdate: handleStatusUpdate,
    pollingInterval: 5000, // Poll every 5 seconds
  });

  // Initialize notification system for job status changes
  useExportNotifications({
    jobs,
    onDownload: handleDownload,
  });

  // Show loading state while authenticating
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated (useRequireAuth will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-linear-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <FileDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Data Exports
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                Create and manage hotel and mapping data exports
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-2">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("hotel")}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                activeTab === "hotel"
                  ? "bg-blue-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <FileDown className="w-5 h-5" />
              Hotel Exports
            </button>
            <button
              onClick={() => setActiveTab("mapping")}
              className={clsx(
                "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all",
                activeTab === "mapping"
                  ? "bg-purple-600 text-white shadow-md"
                  : "text-slate-600 hover:bg-slate-100"
              )}
            >
              <Map className="w-5 h-5" />
              Mapping Exports
            </button>
          </div>
        </div>

        {/* Filter Panel - Conditionally render based on active tab */}
        {activeTab === "hotel" ? (
          <ExportFilterPanel
            onExportCreate={handleCreateHotelExport}
            isLoading={isCreating}
          />
        ) : (
          <MappingExportPanel
            onExportCreate={handleCreateMappingExport}
            isLoading={isCreating}
          />
        )}

        {/* Display error if job creation failed */}
        {jobsError && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-600 text-sm font-bold">!</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-red-900 mb-1">
                  Export Creation Failed
                </h3>
                <p className="text-sm text-red-700">{jobsError}</p>
              </div>
            </div>
          </div>
        )}

        {/* Export Jobs List */}
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={refreshJobStatus}
          onDownload={handleDownload}
          onDeleteJob={deleteJob}
          onClearCompleted={clearCompletedJobs}
          isRefreshing={false}
        />
      </div>
    </div>
  );
}
