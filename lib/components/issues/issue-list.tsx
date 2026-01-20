/**
 * Issue List Component
 */

"use client";

import React, { useState } from "react";
import { Card } from "@/lib/components/ui/card";
import { Badge } from "@/lib/components/ui/badge";
import type { Issue, IssueStatus } from "@/lib/types/issue";
import { Clock, CheckCircle, XCircle, AlertCircle, Loader } from "lucide-react";

interface IssueListProps {
  issues: Issue[];
  loading?: boolean;
}

const statusConfig: Record<IssueStatus, { label: string; variant: "success" | "error" | "warning" | "info"; icon: React.ReactNode }> = {
  open: {
    label: "Open",
    variant: "info",
    icon: <AlertCircle className="w-3 h-3" />,
  },
  in_progress: {
    label: "In Progress",
    variant: "warning",
    icon: <Loader className="w-3 h-3" />,
  },
  resolved: {
    label: "Resolved",
    variant: "success",
    icon: <CheckCircle className="w-3 h-3" />,
  },
  closed: {
    label: "Closed",
    variant: "error",
    icon: <XCircle className="w-3 h-3" />,
  },
};

const categoryEmoji: Record<string, string> = {
  bug: "🐛",
  feature: "✨",
  help: "❓",
  other: "📝",
};

const priorityColors: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  high: "bg-orange-100 text-orange-800 border-orange-200",
  critical: "bg-red-100 text-red-800 border-red-200",
};

export function IssueList({ issues, loading = false }: IssueListProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-color mx-auto mb-4" />
            <p className="text-sm text-[rgb(var(--text-secondary))]">Loading your issues...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (issues.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-12">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[rgb(var(--text-tertiary))]" />
          <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-2">
            No Issues Yet
          </h3>
          <p className="text-sm text-[rgb(var(--text-secondary))]">
            When you submit an issue, it will appear here
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-[rgb(var(--text-primary))]">
          Your Issues ({issues.length})
        </h2>
        <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">
          Track the status of your submitted issues
        </p>
      </div>

      <div className="space-y-3">
        {issues.map((issue) => {
          const statusInfo = statusConfig[issue.status];
          const isExpanded = expandedId === issue.id;

          return (
            <div
              key={issue.id}
              className="border border-[rgb(var(--border-primary))] rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : issue.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{categoryEmoji[issue.category]}</span>
                    <h3 className="font-semibold text-[rgb(var(--text-primary))] truncate">
                      {issue.title}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <Badge
                      variant={statusInfo.variant}
                      size="sm"
                      className="flex items-center gap-1"
                    >
                      {statusInfo.icon}
                      {statusInfo.label}
                    </Badge>
                    
                    <span className={`text-xs px-2 py-1 rounded border ${priorityColors[issue.priority]}`}>
                      {issue.priority.charAt(0).toUpperCase() + issue.priority.slice(1)}
                    </span>
                    
                    <div className="flex items-center gap-1 text-xs text-[rgb(var(--text-tertiary))]">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-[rgb(var(--border-primary))] animate-fade-in">
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-[rgb(var(--text-secondary))] mb-1">
                          Description
                        </h4>
                        <p className="text-sm text-[rgb(var(--text-primary))] whitespace-pre-wrap">
                          {issue.description}
                        </p>
                      </div>

                      {issue.response && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-green-900 mb-1 flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Support Response
                          </h4>
                          <p className="text-sm text-green-800">{issue.response}</p>
                          {issue.respondedAt && (
                            <p className="text-xs text-green-600 mt-1">
                              Responded on {new Date(issue.respondedAt).toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}

                      {issue.userEmail && (
                        <p className="text-xs text-[rgb(var(--text-tertiary))] mt-3">
                          Updates will be sent to: {issue.userEmail}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <button
                  className="text-primary-color hover:text-primary-hover flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedId(isExpanded ? null : issue.id);
                  }}
                >
                  <svg
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
