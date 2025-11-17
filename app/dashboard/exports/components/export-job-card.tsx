"use client";

import React, { useState } from "react";
import { ExportJob } from "@/lib/types/exports";
import { Badge } from "@/lib/components/ui/badge";
import { Button } from "@/lib/components/ui/button";
import { cn, formatDateTime, formatNumber, truncate } from "@/lib/utils";
import {
  Download,
  RefreshCw,
  Trash2,
  Copy,
  Check,
  FileJson,
  FileSpreadsheet,
  AlertCircle,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

export interface ExportJobCardProps {
  job: ExportJob;
  onRefresh: () => Promise<void>;
  onDownload: () => Promise<void>;
  onDelete: () => void;
  onCreateNew?: () => void;
}

export function ExportJobCard({
  job,
  onRefresh,
  onDownload,
  onDelete,
  onCreateNew,
}: ExportJobCardProps) {
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

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

  // Get export type badge
  const exportTypeConfig = {
    hotel: {
      label: "Hotel Export",
      icon: <FileJson className="w-3 h-3" />,
    },
    mapping: {
      label: "Mapping Export",
      icon: <FileSpreadsheet className="w-3 h-3" />,
    },
  };

  const typeConfig = exportTypeConfig[job.exportType];

  // Check if download is available
  // Download is only available for completed jobs that haven't expired
  const canDownload =
    job.status === "completed" &&
    job.expiresAt &&
    new Date(job.expiresAt) >= new Date();

  // Check if job is expired
  function isExpired(): boolean {
    if (!job.expiresAt) return false;
    return new Date(job.expiresAt) < new Date();
  }

  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 p-5 hover:shadow-lg transition-shadow duration-200">
      {/* Header: Job ID, Type, Status */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          {/* Job ID with copy button */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-mono text-gray-500">
              {truncate(job.jobId, 20)}
            </span>
            <button
              onClick={handleCopyJobId}
              className="p-2 min-w-[32px] min-h-[32px] hover:bg-gray-100 rounded transition-colors flex items-center justify-center"
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

          {/* Export Type Badge */}
          <div className="flex items-center gap-2">
            <Badge variant="default" size="sm">
              <span className="flex items-center gap-1">
                {typeConfig.icon}
                {typeConfig.label}
              </span>
            </Badge>
          </div>
        </div>

        {/* Status Badge */}
        <Badge variant={statusConfig.variant} size="md">
          <span className="flex items-center gap-1.5">
            {statusConfig.icon}
            {statusConfig.label}
          </span>
        </Badge>
      </div>

      {/* Progress Bar (for processing jobs) */}
      {job.status === "processing" && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-600">Progress</span>
            <span className="text-xs font-semibold text-blue-600">
              {job.progress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-linear-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${job.progress}%` }}
            >
              <div className="h-full w-full bg-linear-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            </div>
          </div>
        </div>
      )}

      {/* Records Count */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Records:</span>
          <span className="font-semibold text-gray-900">
            {formatNumber(job.processedRecords)} /{" "}
            {formatNumber(job.totalRecords)}
          </span>
        </div>
      </div>

      {/* Timestamps */}
      <div className="space-y-2 mb-4 text-xs">
        <div className="flex items-center gap-2 text-gray-600">
          <Calendar className="w-3 h-3" />
          <span>Created:</span>
          <span className="font-medium text-gray-900">
            {formatDateTime(job.createdAt)}
          </span>
        </div>

        {job.startedAt && (
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-3 h-3" />
            <span>Started:</span>
            <span className="font-medium text-gray-900">
              {formatDateTime(job.startedAt)}
            </span>
          </div>
        )}

        {job.completedAt && (
          <div className="flex items-center gap-2 text-gray-600">
            <CheckCircle className="w-3 h-3" />
            <span>Completed:</span>
            <span className="font-medium text-gray-900">
              {formatDateTime(job.completedAt)}
            </span>
          </div>
        )}

        {job.expiresAt &&
          (job.status === "completed" || job.status === "expired") && (
            <div
              className={cn(
                "flex items-center gap-2",
                job.status === "expired" || isExpired()
                  ? "text-red-600"
                  : "text-gray-600"
              )}
            >
              <AlertCircle className="w-3 h-3" />
              <span>{job.status === "expired" ? "Expired:" : "Expires:"}</span>
              <span className="font-medium">
                {formatDateTime(job.expiresAt)}
              </span>
            </div>
          )}
      </div>

      {/* Error Message (for failed jobs) */}
      {job.status === "failed" && job.errorMessage && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-red-900 mb-1">Error</p>
              <p className="text-xs text-red-700 wrap-break-word">
                {job.errorMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Expiration Warning (for expired jobs) */}
      {job.status === "expired" && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-yellow-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-yellow-900 mb-1">
                Download Expired
              </p>
              <p className="text-xs text-yellow-700 wrap-break-word">
                This export has expired and is no longer available for download.
                Please create a new export with the same filters if you still
                need this data.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
        {/* Refresh Button (not shown for expired jobs) */}
        {job.status !== "expired" && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            leftIcon={
              <RefreshCw
                className={cn("w-4 h-4", isRefreshing && "animate-spin")}
              />
            }
            className="flex-1 min-h-[44px] md:min-h-0"
          >
            Refresh
          </Button>
        )}

        {/* Download Button (only for completed jobs that haven't expired) */}
        {canDownload && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            disabled={isDownloading}
            loading={isDownloading}
            leftIcon={<Download className="w-4 h-4" />}
            className="flex-1 min-h-[44px] md:min-h-0"
          >
            Download
          </Button>
        )}

        {/* Create New Export Button (only for expired jobs) */}
        {job.status === "expired" && onCreateNew && (
          <Button
            variant="primary"
            size="sm"
            onClick={onCreateNew}
            leftIcon={<FileJson className="w-4 h-4" />}
            className="flex-1 min-h-[44px] md:min-h-0"
          >
            Create New Export
          </Button>
        )}

        {/* Delete Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 hover:bg-red-50 min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0"
          title="Delete Job"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
