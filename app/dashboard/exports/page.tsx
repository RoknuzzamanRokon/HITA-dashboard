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

import React, { useState, useRef, useCallback, useMemo } from "react";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { useAuth } from "@/lib/contexts/auth-context";
import { useExportJobs } from "@/lib/hooks/use-export-jobs";
import { useExportPolling } from "@/lib/hooks/use-export-polling";
import { useExportNotifications } from "@/lib/hooks/use-export-notifications";
import { useRetryManager } from "@/lib/hooks/use-retry-manager";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";
import { useNotification } from "@/lib/components/notifications/notification-provider";
import { PermissionGuard } from "@/lib/components/auth/permission-guard";
import { Permission } from "@/lib/utils/rbac";
import { SkipLink } from "@/lib/components/ui/skip-link";
import { TokenStorage } from "@/lib/auth/token-storage";
import { ExportFilterPanel } from "./components/export-filter-panel";
import { MappingExportPanel } from "./components/mapping-export-panel";
import { ExportJobsList } from "./components/export-jobs-list";
import { ConfirmationDialog } from "@/lib/components/ui/confirmation-dialog";
import { exportAPI } from "@/lib/api/exports";
import { UserRole } from "@/lib/types/auth";
import type {
  HotelExportFilters,
  MappingExportFilters,
  ExportJobStatus,
  ExportJob,
} from "@/lib/types/exports";
import { FileDown, Map } from "lucide-react";
import { clsx } from "clsx";

type ExportTab = "hotel" | "mapping";

type ConfirmationDialogState = {
  isOpen: boolean;
  type: "delete" | "clearCompleted" | null;
  jobId?: string;
};

export default function ExportsPage() {
  // Authentication check
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { user } = useAuth();

  // Check if user is general user (needs API key validation)
  const isGeneralUser =
    user?.role === UserRole.GENERAL_USER || user?.role === UserRole.USER;

  // API Key validation state
  const [showApiKeyModal, setShowApiKeyModal] = useState(isGeneralUser);
  const [apiKey, setApiKey] = useState("");
  const [apiKeyError, setApiKeyError] = useState<string | null>(null);
  const [isValidatingApiKey, setIsValidatingApiKey] = useState(false);
  const [isApiKeyValid, setIsApiKeyValid] = useState(!isGeneralUser); // Auto-valid for admin/super admin
  const [apiKeyUserInfo, setApiKeyUserInfo] = useState<any>(null);

  // Tab state for switching between export types
  const [activeTab, setActiveTab] = useState<ExportTab>("hotel");

  // Loading state for initial jobs load
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Confirmation dialog state
  const [confirmDialog, setConfirmDialog] = useState<ConfirmationDialogState>({
    isOpen: false,
    type: null,
  });

  // Refs for keyboard navigation
  const filterPanelRef = useRef<HTMLDivElement>(null);
  const jobsListRef = useRef<HTMLDivElement>(null);

  // Initialize notification system
  const { addNotification } = useNotification();

  // Initialize retry manager for failed operations
  const retryManager = useRetryManager();

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
  const handleStatusUpdate = useCallback(
    (jobId: string, status: ExportJobStatus) => {
      // The status update is handled internally by refreshJobStatus
      // This callback is used by the polling hook to trigger updates
      refreshJobStatus(jobId).catch((error) => {
        console.error(`Failed to update status for job ${jobId}:`, error);
      });
    },
    [refreshJobStatus]
  );

  /**
   * Handler for downloading completed export files
   * Triggers browser download with appropriate filename based on job type and format
   */
  const handleDownload = useCallback(
    async (jobId: string): Promise<void> => {
      const operationType = "download";
      const operationId = jobId;

      try {
        // Find the job to get its details
        const job = jobs.find((j) => j.jobId === jobId);
        if (!job) {
          throw new Error("Export job not found");
        }

        // Check if job is completed
        if (job.status !== "completed" && job.status !== "expired") {
          addNotification({
            type: "warning",
            title: "Download Not Available",
            message: "Export must be completed before downloading",
            autoDismiss: true,
            duration: 5000,
          });
          return;
        }

        // Check if download has expired
        if (
          job.status === "expired" ||
          (job.expiresAt && new Date(job.expiresAt) < new Date())
        ) {
          addNotification({
            type: "warning",
            title: "Download Expired",
            message: "This export has expired. Please create a new export.",
            action: {
              label: "Create New",
              onClick: () => handleCreateNewFromExpired(job),
            },
            autoDismiss: false,
          });
          return;
        }

        // Display info notification that download is starting
        addNotification({
          type: "info",
          title: "Download Starting",
          message: `Preparing ${job.exportType} export file...`,
          autoDismiss: true,
          duration: 3000,
        });

        // Call the API to download the export file
        const blob = await exportAPI.downloadExport(jobId);

        // Generate appropriate filename based on job type and format
        const timestamp = new Date()
          .toISOString()
          .split("T")[0]
          .replace(/-/g, "");
        const format = job.filters.format || "json";
        const filename = `${job.exportType}_export_${timestamp}.${format}`;

        // Create a temporary URL for the blob
        const blobUrl = URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger download
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        link.style.display = "none";

        // Append to body, click, and remove
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up the blob URL after a short delay to ensure download starts
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 100);

        // Reset retry count on success
        retryManager.resetRetry(operationType, operationId);

        // Display success notification
        addNotification({
          type: "success",
          title: "Download Complete",
          message: `${filename} has been downloaded successfully`,
          autoDismiss: true,
          duration: 5000,
        });

        console.log(`✅ Export downloaded successfully: ${filename}`);
      } catch (error) {
        // Handle download errors with retry functionality
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to download export file. Please try again.";

        const retryCount = retryManager.getRetryCount(
          operationType,
          operationId
        );
        const canRetry = retryManager.canRetry(operationType, operationId);

        if (canRetry) {
          // Show error with retry button
          addNotification({
            type: "error",
            title: "Download Failed",
            message: `${errorMessage}${
              retryCount > 0 ? ` (Attempt ${retryCount + 1}/3)` : ""
            }`,
            action: {
              label: "Retry",
              onClick: () => {
                retryManager.incrementRetry(operationType, operationId);
                handleDownload(jobId);
              },
            },
            autoDismiss: false,
          });
        } else {
          // Max retries reached
          addNotification({
            type: "error",
            title: "Download Failed",
            message: `${errorMessage} Maximum retry attempts reached. Please try again later or contact support.`,
            autoDismiss: false,
          });
        }

        console.error("Download error:", error);
      }
    },
    [jobs, addNotification, retryManager]
  );

  /**
   * Handler for creating hotel export jobs
   * Wraps the createHotelExport function with error handling and notifications
   */
  const handleCreateHotelExport = useCallback(
    async (filters: HotelExportFilters): Promise<void> => {
      const operationType = "createHotelExport";
      const operationId = JSON.stringify(filters); // Use filters as unique ID

      try {
        await createHotelExport(filters);
        // Reset retry count on success
        retryManager.resetRetry(operationType, operationId);
        // Success notification is handled by useExportNotifications hook
      } catch (error) {
        // Display error notification with retry functionality
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create hotel export. Please try again.";

        const retryCount = retryManager.getRetryCount(
          operationType,
          operationId
        );
        const canRetry = retryManager.canRetry(operationType, operationId);

        if (canRetry) {
          // Show error with retry button
          addNotification({
            type: "error",
            title: "Export Creation Failed",
            message: `${errorMessage}${
              retryCount > 0 ? ` (Attempt ${retryCount + 1}/3)` : ""
            }`,
            action: {
              label: "Retry",
              onClick: () => {
                retryManager.incrementRetry(operationType, operationId);
                handleCreateHotelExport(filters);
              },
            },
            autoDismiss: false,
          });
        } else {
          // Max retries reached
          addNotification({
            type: "error",
            title: "Export Creation Failed",
            message: `${errorMessage} Maximum retry attempts reached. Please check your filters and try again later.`,
            autoDismiss: false,
          });
        }

        console.error("Hotel export creation error:", error);
        throw error; // Re-throw to allow filter panel to handle it
      }
    },
    [createHotelExport, addNotification, retryManager]
  );

  /**
   * Handler for creating mapping export jobs
   * Wraps the createMappingExport function with error handling and notifications
   */
  const handleCreateMappingExport = useCallback(
    async (filters: MappingExportFilters): Promise<void> => {
      const operationType = "createMappingExport";
      const operationId = JSON.stringify(filters); // Use filters as unique ID

      try {
        await createMappingExport(filters);
        // Reset retry count on success
        retryManager.resetRetry(operationType, operationId);
        // Success notification is handled by useExportNotifications hook
      } catch (error) {
        // Display error notification with retry functionality
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to create mapping export. Please try again.";

        const retryCount = retryManager.getRetryCount(
          operationType,
          operationId
        );
        const canRetry = retryManager.canRetry(operationType, operationId);

        if (canRetry) {
          // Show error with retry button
          addNotification({
            type: "error",
            title: "Mapping Export Creation Failed",
            message: `${errorMessage}${
              retryCount > 0 ? ` (Attempt ${retryCount + 1}/3)` : ""
            }`,
            action: {
              label: "Retry",
              onClick: () => {
                retryManager.incrementRetry(operationType, operationId);
                handleCreateMappingExport(filters);
              },
            },
            autoDismiss: false,
          });
        } else {
          // Max retries reached
          addNotification({
            type: "error",
            title: "Mapping Export Creation Failed",
            message: `${errorMessage} Maximum retry attempts reached. Please check your filters and try again later.`,
            autoDismiss: false,
          });
        }

        console.error("Mapping export creation error:", error);
        throw error; // Re-throw to allow filter panel to handle it
      }
    },
    [createMappingExport, addNotification, retryManager]
  );

  /**
   * Handler for refreshing individual job status
   * Manually triggers a status update for a specific job
   */
  const handleRefreshJob = useCallback(
    async (jobId: string): Promise<void> => {
      const operationType = "refreshJob";
      const operationId = jobId;

      try {
        await refreshJobStatus(jobId);
        // Reset retry count on success
        retryManager.resetRetry(operationType, operationId);
        console.log(`✅ Job status refreshed: ${jobId}`);
      } catch (error) {
        // Display error notification with retry functionality
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to refresh job status. Please try again.";

        const retryCount = retryManager.getRetryCount(
          operationType,
          operationId
        );
        const canRetry = retryManager.canRetry(operationType, operationId);

        if (canRetry) {
          // Show error with retry button
          addNotification({
            type: "error",
            title: "Refresh Failed",
            message: `${errorMessage}${
              retryCount > 0 ? ` (Attempt ${retryCount + 1}/3)` : ""
            }`,
            action: {
              label: "Retry",
              onClick: () => {
                retryManager.incrementRetry(operationType, operationId);
                handleRefreshJob(jobId);
              },
            },
            autoDismiss: false,
          });
        } else {
          // Max retries reached
          addNotification({
            type: "error",
            title: "Refresh Failed",
            message: `${errorMessage} Maximum retry attempts reached. The job status may be temporarily unavailable.`,
            autoDismiss: false,
          });
        }

        console.error("Job refresh error:", error);
      }
    },
    [refreshJobStatus, addNotification, retryManager]
  );

  /**
   * Handler for deleting a job
   * Shows confirmation dialog before deleting
   */
  const handleDeleteJob = useCallback((jobId: string): void => {
    setConfirmDialog({
      isOpen: true,
      type: "delete",
      jobId,
    });
  }, []);

  /**
   * Handler for clearing all completed jobs
   * Shows confirmation dialog before clearing
   */
  const handleClearCompleted = useCallback((): void => {
    setConfirmDialog({
      isOpen: true,
      type: "clearCompleted",
    });
  }, []);

  /**
   * Handler for creating a new export from an expired job
   * Switches to the appropriate tab and pre-fills filters
   */
  const handleCreateNewFromExpired = useCallback(
    (job: ExportJob): void => {
      // Switch to the appropriate tab
      setActiveTab(job.exportType);

      // Show notification to guide user
      addNotification({
        type: "info",
        title: "Create New Export",
        message: `Switched to ${job.exportType} exports tab. The previous filters are ready to use. Click "Create Export" to generate a new export.`,
        autoDismiss: true,
        duration: 8000,
      });

      // Note: The filter panel components maintain their own state with presets
      // The user can manually load the filters or adjust them as needed
      console.log(`Creating new export from expired job: ${job.jobId}`);
    },
    [addNotification]
  );

  /**
   * Confirmation handler for dialog actions
   * Executes the appropriate action based on dialog type
   */
  const handleConfirmAction = useCallback((): void => {
    if (confirmDialog.type === "delete" && confirmDialog.jobId) {
      // Delete single job
      deleteJob(confirmDialog.jobId);

      addNotification({
        type: "success",
        title: "Job Deleted",
        message: `Export job has been removed from the list`,
        autoDismiss: true,
        duration: 3000,
      });

      console.log(`✅ Job deleted: ${confirmDialog.jobId}`);
    } else if (confirmDialog.type === "clearCompleted") {
      // Clear all completed jobs
      const completedCount = jobs.filter(
        (job) =>
          job.status === "completed" ||
          job.status === "failed" ||
          job.status === "expired"
      ).length;

      clearCompletedJobs();

      addNotification({
        type: "success",
        title: "Jobs Cleared",
        message: `${completedCount} completed job${
          completedCount !== 1 ? "s" : ""
        } removed from the list`,
        autoDismiss: true,
        duration: 3000,
      });

      console.log(`✅ Cleared ${completedCount} completed jobs`);
    }

    // Close dialog
    setConfirmDialog({
      isOpen: false,
      type: null,
    });
  }, [confirmDialog, jobs, deleteJob, clearCompletedJobs, addNotification]);

  /**
   * Handler for validating API key
   */
  const handleValidateApiKey = async () => {
    if (!apiKey.trim()) {
      setApiKeyError("Please enter an API key");
      return;
    }

    setIsValidatingApiKey(true);
    setApiKeyError(null);

    try {
      const token = TokenStorage.getToken();
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        "http://127.0.0.1:8001/v1.0/export/my-validation",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-API-Key": apiKey.trim(),
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Invalid API key");
      }

      const data = await response.json();

      if (data.valid && data.access?.export_endpoints) {
        setIsApiKeyValid(true);
        setApiKeyUserInfo(data.user);
        setShowApiKeyModal(false);

        addNotification({
          type: "success",
          title: "API Key Validated",
          message: `Welcome ${data.user?.username}! You have access to export endpoints.`,
          autoDismiss: true,
          duration: 5000,
        });
      } else {
        throw new Error(
          data.message || "API key is not valid for export endpoints"
        );
      }
    } catch (error) {
      console.error("API key validation error:", error);
      setApiKeyError(
        error instanceof Error
          ? error.message
          : "Failed to validate API key. Please try again."
      );
    } finally {
      setIsValidatingApiKey(false);
    }
  };

  /**
   * Check user role on mount (only for admin and super admin bypass)
   */
  React.useEffect(() => {
    // Skip API key validation for admin and super admin
    if (!isGeneralUser && isAuthenticated) {
      setIsApiKeyValid(true);
      setShowApiKeyModal(false);
    }
  }, [isAuthenticated, isGeneralUser]);

  /**
   * Handler for closing confirmation dialog
   */
  const handleCloseDialog = useCallback((): void => {
    setConfirmDialog({
      isOpen: false,
      type: null,
    });
  }, []);

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

  // Set loading to false after jobs are loaded (on mount)
  React.useEffect(() => {
    // Simulate initial load time for jobs from localStorage
    const timer = setTimeout(() => {
      setIsLoadingJobs(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useKeyboardShortcuts([
    {
      key: "e",
      ctrlKey: true,
      callback: () => {
        // Focus on the filter panel to create export
        if (filterPanelRef.current) {
          const submitButton = filterPanelRef.current.querySelector(
            'button[type="submit"]'
          ) as HTMLButtonElement;
          if (submitButton && !submitButton.disabled) {
            submitButton.focus();
            addNotification({
              type: "info",
              title: "Keyboard Shortcut",
              message: "Press Enter to create export",
              autoDismiss: true,
              duration: 2000,
            });
          }
        }
      },
      description: "Focus on create export button",
    },
    {
      key: "r",
      ctrlKey: true,
      callback: () => {
        // Refresh all processing jobs
        const processingJobs = jobs.filter(
          (job) => job.status === "processing"
        );
        if (processingJobs.length > 0) {
          processingJobs.forEach((job) => {
            handleRefreshJob(job.jobId);
          });
          addNotification({
            type: "info",
            title: "Refreshing Jobs",
            message: `Refreshing ${processingJobs.length} processing job${
              processingJobs.length !== 1 ? "s" : ""
            }`,
            autoDismiss: true,
            duration: 3000,
          });
        } else {
          addNotification({
            type: "info",
            title: "No Jobs to Refresh",
            message: "There are no processing jobs to refresh",
            autoDismiss: true,
            duration: 2000,
          });
        }
      },
      description: "Refresh all processing jobs",
    },
  ]);

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

  // Check if user has access (either has permission OR is general user with valid API key)
  const hasAccess = !isGeneralUser || isApiKeyValid;

  return (
    <>
      {/* Skip Link for Screen Readers */}
      <SkipLink href="#main-content">Skip to main content</SkipLink>

      {/* API Key Validation Modal - Only for General Users */}
      {isGeneralUser && showApiKeyModal && !isApiKeyValid && (
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-2xl max-w-md w-full border border-[rgb(var(--border-primary))]">
            {/* Modal Header */}
            <div className="border-b border-[rgb(var(--border-primary))] p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-color rounded-lg flex items-center justify-center">
                    <FileDown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">
                      API Key Required
                    </h2>
                    <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                      Enter your API key to access export features
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowApiKeyModal(false);
                    window.history.back();
                  }}
                  className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-colors p-2 hover:bg-[rgb(var(--bg-secondary))] rounded-lg"
                  title="Close and go back"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              <div>
                <label
                  htmlFor="api-key-input"
                  className="block text-sm font-medium text-[rgb(var(--text-secondary))] mb-2"
                >
                  API Key
                </label>
                <input
                  id="api-key-input"
                  type="text"
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setApiKeyError(null);
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleValidateApiKey();
                    }
                  }}
                  placeholder="Enter your API key (e.g., ak_...)"
                  className="w-full px-4 py-2 border border-[rgb(var(--border-primary))] rounded-md bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] focus:ring-2 focus:ring-primary-color focus:border-transparent"
                  disabled={isValidatingApiKey}
                />
              </div>

              {apiKeyError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-red-700">{apiKeyError}</p>
                </div>
              )}

              <div className="p-3 bg-[rgb(var(--bg-secondary))] border border-[rgb(var(--border-primary))] rounded-md">
                <p className="text-xs text-[rgb(var(--text-secondary))]">
                  <strong className="text-[rgb(var(--text-primary))]">
                    Note:
                  </strong>{" "}
                  Your API key is required to validate access to export
                  endpoints. It will be stored securely for this session only.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-[rgb(var(--border-primary))] p-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowApiKeyModal(false);
                  window.history.back();
                }}
                disabled={isValidatingApiKey}
                className="px-6 py-2 border border-[rgb(var(--border-primary))] text-[rgb(var(--text-primary))] rounded-md hover:bg-[rgb(var(--bg-secondary))] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleValidateApiKey}
                disabled={isValidatingApiKey || !apiKey.trim()}
                className="px-6 py-2 bg-primary-color text-white rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all duration-200 font-medium hover:shadow-lg hover:scale-105 active:scale-95 active:brightness-110"
              >
                {isValidatingApiKey ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Validating...
                  </>
                ) : (
                  <>
                    <FileDown className="w-5 h-5" />
                    Validate & Continue
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto relative">
        {isApiKeyValid ? (
          <div className="space-y-6">
            {/* Page Header */}
            <header className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-color rounded-xl flex items-center justify-center shadow-lg">
                  <FileDown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                    Data Exports
                  </h1>
                  <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                    Create and manage hotel and mapping data exports
                  </p>
                </div>
              </div>
            </header>

            {/* Tab Navigation */}
            <nav
              className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-2"
              role="tablist"
              aria-label="Export type selection"
            >
              <div className="flex gap-2">
                <button
                  role="tab"
                  aria-selected={activeTab === "hotel"}
                  aria-controls="hotel-panel"
                  id="hotel-tab"
                  onClick={() => setActiveTab("hotel")}
                  aria-label="Hotel exports tab"
                  style={
                    activeTab === "hotel"
                      ? { color: "white !important" }
                      : undefined
                  }
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all relative",
                    "focus:outline-none focus:ring-2 focus:ring-primary-color",
                    "active:scale-95 active:opacity-90",
                    activeTab === "hotel"
                      ? "bg-primary-color !text-white shadow-md"
                      : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-secondary))] active:bg-[rgb(var(--bg-secondary))]"
                  )}
                >
                  <FileDown
                    className="w-5 h-5 relative z-10"
                    aria-hidden="true"
                  />
                  <span className="relative z-10">Hotel Exports</span>
                </button>
                <button
                  role="tab"
                  aria-selected={activeTab === "mapping"}
                  aria-controls="mapping-panel"
                  id="mapping-tab"
                  onClick={() => setActiveTab("mapping")}
                  aria-label="Mapping exports tab"
                  style={
                    activeTab === "mapping"
                      ? { color: "white !important" }
                      : undefined
                  }
                  className={clsx(
                    "flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all relative",
                    "focus:outline-none focus:ring-2 focus:ring-primary-color",
                    "active:scale-95 active:opacity-90",
                    activeTab === "mapping"
                      ? "bg-primary-color !text-white shadow-md"
                      : "text-[rgb(var(--text-secondary))] hover:bg-[rgb(var(--bg-secondary))] active:bg-[rgb(var(--bg-secondary))]"
                  )}
                >
                  <Map className="w-5 h-5 relative z-10" aria-hidden="true" />
                  <span className="relative z-10">Mapping Exports</span>
                </button>
              </div>
            </nav>

            {/* Filter Panel - Conditionally render based on active tab */}
            <main id="main-content" ref={filterPanelRef}>
              {activeTab === "hotel" ? (
                <div
                  role="tabpanel"
                  id="hotel-panel"
                  aria-labelledby="hotel-tab"
                  tabIndex={0}
                >
                  <ExportFilterPanel
                    onExportCreate={handleCreateHotelExport}
                    isLoading={isCreating}
                  />
                </div>
              ) : (
                <div
                  role="tabpanel"
                  id="mapping-panel"
                  aria-labelledby="mapping-tab"
                  tabIndex={0}
                >
                  <MappingExportPanel
                    onExportCreate={handleCreateMappingExport}
                    isLoading={isCreating}
                  />
                </div>
              )}
            </main>

            {/* Display error if job creation failed */}
            {jobsError && (
              <div
                role="alert"
                aria-live="assertive"
                className="bg-red-50 border border-red-200 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                    <span
                      className="text-red-600 text-sm font-bold"
                      aria-hidden="true"
                    >
                      !
                    </span>
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
            <section ref={jobsListRef} aria-label="Export jobs">
              <ExportJobsList
                jobs={jobs}
                onRefreshJob={handleRefreshJob}
                onDownload={handleDownload}
                onDeleteJob={handleDeleteJob}
                onClearCompleted={handleClearCompleted}
                onCreateNew={handleCreateNewFromExpired}
                isRefreshing={false}
                isLoading={isLoadingJobs}
              />
            </section>

            {/* Confirmation Dialog */}
            <ConfirmationDialog
              isOpen={confirmDialog.isOpen}
              onClose={handleCloseDialog}
              onConfirm={handleConfirmAction}
              title={
                confirmDialog.type === "delete"
                  ? "Delete Export Job?"
                  : "Clear Completed Jobs?"
              }
              message={
                confirmDialog.type === "delete"
                  ? "Are you sure you want to delete this export job? This will remove it from your list."
                  : "Are you sure you want to clear all completed, failed, and expired jobs? This will remove them from your list."
              }
              confirmText={
                confirmDialog.type === "delete" ? "Delete" : "Clear All"
              }
              cancelText="Cancel"
              variant="danger"
            />
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-color/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileDown className="w-8 h-8 text-primary-color" />
              </div>
              <h2 className="text-xl font-semibold text-[rgb(var(--text-primary))] mb-2">
                API Key Required
              </h2>
              <p className="text-[rgb(var(--text-secondary))]">
                Please enter your API key to access export features.
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
