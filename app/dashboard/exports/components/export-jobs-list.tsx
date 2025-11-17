"use client";

/**
 * Export Jobs List Component
 *
 * Displays export jobs with responsive layout:
 * - Desktop (1024px+): Table layout with all columns visible
 * - Tablet (768px-1023px): 2-column card grid layout
 * - Mobile (<768px): Single-column card layout, stacked vertically
 *
 * All interactive elements meet WCAG touch target size requirements (min 44x44px on mobile)
 */

import React, { useMemo } from "react";
import { ExportJob } from "@/lib/types/exports";
import { ExportJobCard } from "./export-job-card";
import { Button } from "@/lib/components/ui/button";
import { Badge } from "@/lib/components/ui/badge";
import { cn, formatDateTime, formatNumber, truncate } from "@/lib/utils";
import {
  Download,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  FileJson,
  FileSpreadsheet,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Inbox,
  Trash,
} from "lucide-react";

export interface ExportJobsListProps {
  jobs: ExportJob[];
  onRefreshJob: (jobId: string) => Promise<void>;
  onDownload: (jobId: string) => Promise<void>;
  onDeleteJob: (jobId: string) => void;
  onClearCompleted: () => void;
  isRefreshing?: boolean;
}

export function ExportJobsList({
  jobs,
  onRefreshJob,
  onDownload,
  onDeleteJob,
  onClearCompleted,
  isRefreshing = false,
}: ExportJobsListProps) {
  // Sort jobs by created_at descending (newest first)
  const sortedJobs = useMemo(() => {
    return [...jobs].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [jobs]);

  // Count completed/failed jobs for clear button
  const completedJobsCount = useMemo(() => {
    return jobs.filter(
      (job) =>
        job.status === "completed" ||
        job.status === "failed" ||
        job.status === "expired"
    ).length;
  }, [jobs]);

  // Empty state
  if (jobs.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-md border border-slate-200 p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No export jobs yet
          </h3>
          <p className="text-sm text-gray-600 max-w-md">
            Create your first export job using the filter panel above. Your
            export jobs will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Clear Completed button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Export Jobs ({jobs.length})
          </h2>
          {isRefreshing && (
            <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          )}
        </div>
        {completedJobsCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearCompleted}
            leftIcon={<Trash className="w-4 h-4" />}
          >
            Clear Completed ({completedJobsCount})
          </Button>
        )}
      </div>

      {/* Desktop: Table View */}
      <div className="hidden lg:block bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Job ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Progress
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Records
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Created
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedJobs.map((job) => (
                <ExportJobTableRow
                  key={job.jobId}
                  job={job}
                  onRefresh={() => onRefreshJob(job.jobId)}
                  onDownload={() => onDownload(job.jobId)}
                  onDelete={() => onDeleteJob(job.jobId)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet: 2-column Card Grid */}
      <div className="hidden md:grid lg:hidden grid-cols-2 gap-4">
        {sortedJobs.map((job) => (
          <ExportJobCard
            key={job.jobId}
            job={job}
            onRefresh={() => onRefreshJob(job.jobId)}
            onDownload={() => onDownload(job.jobId)}
            onDelete={() => onDeleteJob(job.jobId)}
          />
        ))}
      </div>

      {/* Mobile: Single-column Card Grid */}
      <div className="grid md:hidden grid-cols-1 gap-4">
        {sortedJobs.map((job) => (
          <ExportJobCard
            key={job.jobId}
            job={job}
            onRefresh={() => onRefreshJob(job.jobId)}
            onDownload={() => onDownload(job.jobId)}
            onDelete={() => onDeleteJob(job.jobId)}
          />
        ))}
      </div>
    </div>
  );
}

// Table Row Component for Desktop View
interface ExportJobTableRowProps {
  job: ExportJob;
  onRefresh: () => Promise<void>;
  onDownload: () => Promise<void>;
  onDelete: () => void;
}

function ExportJobTableRow({
  job,
  onRefresh,
  onDownload,
  onDelete,
}: ExportJobTableRowProps) {
  const [copied, setCopied] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isDownloading, setIsDownloading] = React.useState(false);

  // Copy job ID to clipboard
  const handleCopyJobId = async () => {
    try {
      await navigator.clipboard.writeText(job.jobId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy job ID:", error);
    }
  };

  // Handle refresh with loading state
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle download with loading state
  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload();
    } finally {
      setIsDownloading(false);
    }
  };

  // Get status badge variant and icon
  const getStatusConfig = () => {
    switch (job.status) {
      case "processing":
        return {
          variant: "info" as const,
          icon: <Loader2 className="w-3 h-3 animate-spin" />,
          label: "Processing",
        };
      case "completed":
        return {
          variant: "success" as const,
          icon: <CheckCircle className="w-3 h-3" />,
          label: "Completed",
        };
      case "failed":
        return {
          variant: "error" as const,
          icon: <XCircle className="w-3 h-3" />,
          label: "Failed",
        };
      case "expired":
        return {
          variant: "warning" as const,
          icon: <Clock className="w-3 h-3" />,
          label: "Expired",
        };
      default:
        return {
          variant: "default" as const,
          icon: null,
          label: job.status,
        };
    }
  };

  const statusConfig = getStatusConfig();

  // Get export type config
  const exportTypeConfig = {
    hotel: {
      label: "Hotel",
      icon: <FileJson className="w-3 h-3" />,
    },
    mapping: {
      label: "Mapping",
      icon: <FileSpreadsheet className="w-3 h-3" />,
    },
  };

  const typeConfig = exportTypeConfig[job.exportType];

  // Check if download is available
  const canDownload = job.status === "completed" && !isExpired();

  // Check if job is expired
  function isExpired(): boolean {
    if (!job.expiresAt) return false;
    return new Date(job.expiresAt) < new Date();
  }

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Job ID */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-600">
            {truncate(job.jobId, 16)}
          </span>
          <button
            onClick={handleCopyJobId}
            className="p-1.5 min-w-[28px] min-h-[28px] hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
            title="Copy Job ID"
            aria-label="Copy job ID to clipboard"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3 text-gray-400" />
            )}
          </button>
        </div>
      </td>

      {/* Type */}
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant="default" size="sm">
          <span className="flex items-center gap-1">
            {typeConfig.icon}
            {typeConfig.label}
          </span>
        </Badge>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap">
        <Badge variant={statusConfig.variant} size="sm">
          <span className="flex items-center gap-1.5">
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </Badge>
      </td>

      {/* Progress */}
      <td className="px-6 py-4 whitespace-nowrap">
        {job.status === "processing" ? (
          <div className="w-32">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-blue-600">
                {job.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-linear-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-500">—</span>
        )}
      </td>

      {/* Records */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">
          {formatNumber(job.processedRecords)} /{" "}
          {formatNumber(job.totalRecords)}
        </div>
      </td>

      {/* Created */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-600">
          {formatDateTime(job.createdAt)}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          {/* Refresh Button */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 min-w-[40px] min-h-[40px] hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
            title="Refresh Status"
            aria-label="Refresh job status"
          >
            <RefreshCw
              className={cn(
                "w-4 h-4 text-gray-600",
                isRefreshing && "animate-spin"
              )}
            />
          </button>

          {/* Download Button */}
          {canDownload && (
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="p-2 min-w-[40px] min-h-[40px] hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              title="Download Export"
              aria-label="Download export file"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              ) : (
                <Download className="w-4 h-4 text-blue-600" />
              )}
            </button>
          )}

          {/* Delete Button */}
          <button
            onClick={onDelete}
            className="p-2 min-w-[40px] min-h-[40px] hover:bg-red-50 rounded-lg transition-colors flex items-center justify-center"
            title="Delete Job"
            aria-label="Delete job"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </td>
    </tr>
  );
}
