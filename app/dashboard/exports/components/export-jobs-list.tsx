"use client";

/**
 * Export Jobs List Component
 *
 * Displays export jobs with responsive layout:
 * - Desktop (1024px+): Table layout with all columns visible (virtualized for 100+ jobs)
 * - Tablet (768px-1023px): 2-column card grid layout (virtualized for 100+ jobs)
 * - Mobile (<768px): Single-column card layout, stacked vertically (virtualized for 100+ jobs)
 *
 * All interactive elements meet WCAG touch target size requirements (min 44x44px on mobile)
 *
 * Virtual scrolling is enabled when there are 100+ jobs to improve performance.
 */

import React, { useMemo, useRef, useEffect, useState } from "react";
import { List as FixedSizeList } from "react-window";
import { ExportJob } from "@/lib/types/exports";
import { ExportJobCard } from "./export-job-card";
import { ExportJobsListSkeleton } from "./export-job-skeleton";
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

// Virtual scrolling configuration
const VIRTUAL_SCROLL_THRESHOLD = 100; // Enable virtual scrolling for 100+ jobs
const TABLE_ROW_HEIGHT = 73; // Height of each table row in pixels
const CARD_HEIGHT = 280; // Height of each card in pixels (approximate)
const CARD_GAP = 16; // Gap between cards in pixels

export interface ExportJobsListProps {
  jobs: ExportJob[];
  onRefreshJob: (jobId: string) => Promise<void>;
  onDownload: (jobId: string) => Promise<void>;
  onDeleteJob: (jobId: string) => void;
  onClearCompleted: () => void;
  onCreateNew?: (job: ExportJob) => void;
  isRefreshing?: boolean;
  isLoading?: boolean;
}

export function ExportJobsList({
  jobs,
  onRefreshJob,
  onDownload,
  onDeleteJob,
  onClearCompleted,
  onCreateNew,
  isRefreshing = false,
  isLoading = false,
}: ExportJobsListProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

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

  // Determine if virtual scrolling should be enabled
  const useVirtualScrolling = sortedJobs.length >= VIRTUAL_SCROLL_THRESHOLD;

  // Track container width for responsive virtual scrolling
  useEffect(() => {
    if (!containerRef.current) return;

    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  // Loading state - show skeleton loaders
  if (isLoading) {
    return <ExportJobsListSkeleton count={3} />;
  }

  // Empty state
  if (jobs.length === 0) {
    return (
      <div className="bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] p-12">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 bg-[rgb(var(--bg-secondary))] rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-[rgb(var(--text-secondary))]" />
          </div>
          <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">
            No export jobs yet
          </h3>
          <p className="text-sm text-[rgb(var(--text-secondary))] max-w-md">
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
          <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">
            Export Jobs ({jobs.length})
          </h2>
          {isRefreshing && (
            <Loader2
              className="w-4 h-4 text-primary-color animate-spin"
              aria-label="Refreshing jobs"
            />
          )}
        </div>
        {completedJobsCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearCompleted}
            leftIcon={<Trash className="w-4 h-4" />}
            aria-label={`Clear ${completedJobsCount} completed job${
              completedJobsCount !== 1 ? "s" : ""
            }`}
          >
            Clear Completed ({completedJobsCount})
          </Button>
        )}
      </div>

      {/* Desktop: Table View */}
      <div
        ref={containerRef}
        className="hidden lg:block bg-[rgb(var(--bg-primary))] rounded-lg shadow-md border border-[rgb(var(--border-primary))] overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full" role="table" aria-label="Export jobs table">
            <thead className="bg-[rgb(var(--bg-secondary))] border-b border-[rgb(var(--border-primary))]">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] uppercase tracking-wider"
                >
                  Job ID
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] uppercase tracking-wider"
                >
                  Progress
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] uppercase tracking-wider"
                >
                  Records
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-semibold text-[rgb(var(--text-secondary))] uppercase tracking-wider"
                >
                  Created
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-semibold text-[rgb(var(--text-secondary))] uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {useVirtualScrolling ? (
                <tr>
                  <td colSpan={7} className="p-0">
                    <FixedSizeList
                      rowCount={sortedJobs.length}
                      rowHeight={TABLE_ROW_HEIGHT}
                      defaultHeight={Math.min(
                        600,
                        sortedJobs.length * TABLE_ROW_HEIGHT
                      )}
                      rowComponent={VirtualTableRow as any}
                      rowProps={
                        {
                          jobs: sortedJobs,
                          onRefreshJob,
                          onDownload,
                          onDeleteJob,
                          onCreateNew,
                        } as any
                      }
                    />
                  </td>
                </tr>
              ) : (
                sortedJobs.map((job) => (
                  <ExportJobTableRow
                    key={job.jobId}
                    job={job}
                    onRefresh={() => onRefreshJob(job.jobId)}
                    onDownload={() => onDownload(job.jobId)}
                    onDelete={() => onDeleteJob(job.jobId)}
                    onCreateNew={
                      onCreateNew ? () => onCreateNew(job) : undefined
                    }
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Tablet: 2-column Card Grid */}
      <div
        className="hidden md:block lg:hidden"
        role="list"
        aria-label="Export jobs cards"
      >
        {useVirtualScrolling ? (
          <FixedSizeList
            rowCount={Math.ceil(sortedJobs.length / 2)}
            rowHeight={CARD_HEIGHT + CARD_GAP}
            defaultHeight={Math.min(
              800,
              Math.ceil(sortedJobs.length / 2) * (CARD_HEIGHT + CARD_GAP)
            )}
            rowComponent={VirtualCardRow as any}
            rowProps={
              {
                jobs: sortedJobs,
                onRefreshJob,
                onDownload,
                onDeleteJob,
                onCreateNew,
                columns: 2,
              } as any
            }
          />
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {sortedJobs.map((job) => (
              <div key={job.jobId} role="listitem">
                <ExportJobCard
                  job={job}
                  onRefresh={() => onRefreshJob(job.jobId)}
                  onDownload={() => onDownload(job.jobId)}
                  onDelete={() => onDeleteJob(job.jobId)}
                  onCreateNew={onCreateNew ? () => onCreateNew(job) : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile: Single-column Card Grid */}
      <div
        className="block md:hidden"
        role="list"
        aria-label="Export jobs cards"
      >
        {useVirtualScrolling ? (
          <FixedSizeList
            rowCount={sortedJobs.length}
            rowHeight={CARD_HEIGHT + CARD_GAP}
            defaultHeight={Math.min(
              800,
              sortedJobs.length * (CARD_HEIGHT + CARD_GAP)
            )}
            rowComponent={VirtualCardRow as any}
            rowProps={
              {
                jobs: sortedJobs,
                onRefreshJob,
                onDownload,
                onDeleteJob,
                onCreateNew,
                columns: 1,
              } as any
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {sortedJobs.map((job) => (
              <div key={job.jobId} role="listitem">
                <ExportJobCard
                  job={job}
                  onRefresh={() => onRefreshJob(job.jobId)}
                  onDownload={() => onDownload(job.jobId)}
                  onDelete={() => onDeleteJob(job.jobId)}
                  onCreateNew={onCreateNew ? () => onCreateNew(job) : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Virtual Table Row Component for react-window
interface VirtualTableRowData {
  jobs: ExportJob[];
  onRefreshJob: (jobId: string) => Promise<void>;
  onDownload: (jobId: string) => Promise<void>;
  onDeleteJob: (jobId: string) => void;
  onCreateNew?: (job: ExportJob) => void;
}

const VirtualTableRow = React.memo(
  (
    props: {
      index: number;
      style: React.CSSProperties;
      ariaAttributes?: any;
    } & VirtualTableRowData
  ) => {
    const {
      index,
      style,
      jobs,
      onRefreshJob,
      onDownload,
      onDeleteJob,
      onCreateNew,
    } = props;
    const job = jobs[index];

    return (
      <div style={style}>
        <table className="w-full">
          <tbody>
            <ExportJobTableRow
              job={job}
              onRefresh={() => onRefreshJob(job.jobId)}
              onDownload={() => onDownload(job.jobId)}
              onDelete={() => onDeleteJob(job.jobId)}
              onCreateNew={onCreateNew ? () => onCreateNew(job) : undefined}
            />
          </tbody>
        </table>
      </div>
    );
  }
);

VirtualTableRow.displayName = "VirtualTableRow";

// Virtual Card Row Component for react-window (supports 1 or 2 columns)
interface VirtualCardRowData extends VirtualTableRowData {
  columns: 1 | 2;
}

const VirtualCardRow = React.memo(
  (
    props: {
      index: number;
      style: React.CSSProperties;
      ariaAttributes?: any;
    } & VirtualCardRowData
  ) => {
    const {
      index,
      style,
      jobs,
      onRefreshJob,
      onDownload,
      onDeleteJob,
      onCreateNew,
      columns,
    } = props;
    if (columns === 2) {
      // Two-column layout for tablet
      const leftIndex = index * 2;
      const rightIndex = leftIndex + 1;
      const leftJob = jobs[leftIndex];
      const rightJob = jobs[rightIndex];

      return (
        <div style={style} className="grid grid-cols-2 gap-4 px-1">
          {leftJob && (
            <ExportJobCard
              job={leftJob}
              onRefresh={() => onRefreshJob(leftJob.jobId)}
              onDownload={() => onDownload(leftJob.jobId)}
              onDelete={() => onDeleteJob(leftJob.jobId)}
              onCreateNew={onCreateNew ? () => onCreateNew(leftJob) : undefined}
            />
          )}
          {rightJob && (
            <ExportJobCard
              job={rightJob}
              onRefresh={() => onRefreshJob(rightJob.jobId)}
              onDownload={() => onDownload(rightJob.jobId)}
              onDelete={() => onDeleteJob(rightJob.jobId)}
              onCreateNew={
                onCreateNew ? () => onCreateNew(rightJob) : undefined
              }
            />
          )}
        </div>
      );
    } else {
      // Single-column layout for mobile
      const job = jobs[index];
      return (
        <div style={style} className="px-1">
          <ExportJobCard
            job={job}
            onRefresh={() => onRefreshJob(job.jobId)}
            onDownload={() => onDownload(job.jobId)}
            onDelete={() => onDeleteJob(job.jobId)}
            onCreateNew={onCreateNew ? () => onCreateNew(job) : undefined}
          />
        </div>
      );
    }
  }
);

VirtualCardRow.displayName = "VirtualCardRow";

// Table Row Component for Desktop View
interface ExportJobTableRowProps {
  job: ExportJob;
  onRefresh: () => Promise<void>;
  onDownload: () => Promise<void>;
  onDelete: () => void;
  onCreateNew?: () => void;
}

function ExportJobTableRow({
  job,
  onRefresh,
  onDownload,
  onDelete,
  onCreateNew,
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
    <tr className="hover:bg-[rgb(var(--bg-secondary))] transition-colors">
      {/* Job ID */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-[rgb(var(--text-secondary))]">
            {truncate(job.jobId, 16)}
          </span>
          <button
            onClick={handleCopyJobId}
            className="p-1.5 min-w-[28px] min-h-[28px] hover:bg-[rgb(var(--bg-secondary))] rounded transition-colors flex items-center justify-center"
            title="Copy Job ID"
            aria-label="Copy job ID to clipboard"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3 text-[rgb(var(--text-tertiary))]" />
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
            <div className="w-full bg-[rgb(var(--bg-secondary))] rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-linear-to-r from-blue-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${job.progress}%` }}
              />
            </div>
          </div>
        ) : (
          <span className="text-xs text-[rgb(var(--text-tertiary))]">—</span>
        )}
      </td>

      {/* Records */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-[rgb(var(--text-primary))]">
          {formatNumber(job.processedRecords)} /{" "}
          {formatNumber(job.totalRecords)}
        </div>
      </td>

      {/* Created */}
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-[rgb(var(--text-secondary))]">
          {formatDateTime(job.createdAt)}
        </div>
      </td>

      {/* Actions */}
      <td className="px-6 py-4 whitespace-nowrap text-right">
        <div className="flex items-center justify-end gap-2">
          {/* Refresh Button (not shown for expired jobs) */}
          {job.status !== "expired" && (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 min-w-[40px] min-h-[40px] hover:bg-[rgb(var(--bg-secondary))] rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
              title="Refresh Status"
              aria-label="Refresh job status"
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4 text-[rgb(var(--text-secondary))]",
                  isRefreshing && "animate-spin"
                )}
              />
            </button>
          )}

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

          {/* Create New Export Button (only for expired jobs) */}
          {job.status === "expired" && onCreateNew && (
            <button
              onClick={onCreateNew}
              className="p-2 min-w-[40px] min-h-[40px] hover:bg-blue-50 rounded-lg transition-colors flex items-center justify-center"
              title="Create New Export"
              aria-label="Create new export with same filters"
            >
              <FileJson className="w-4 h-4 text-blue-600" />
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
