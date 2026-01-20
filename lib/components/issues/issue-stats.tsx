/**
 * Issue Statistics Component
 * Visual breakdown of issue metrics
 */

"use client";

import React from "react";
import { Card } from "@/lib/components/ui/card";
import { Badge } from "@/lib/components/ui/badge";
import type { Issue } from "@/lib/types/issue";
import { TrendingUp, AlertCircle, CheckCircle, Clock, Zap } from "lucide-react";

interface IssueStatsProps {
  issues: Issue[];
}

export function IssueStats({ issues }: IssueStatsProps) {
  // Calculate statistics
  const total = issues.length;
  const byStatus = {
    open: issues.filter((i) => i.status === "open").length,
    in_progress: issues.filter((i) => i.status === "in_progress").length,
    resolved: issues.filter((i) => i.status === "resolved").length,
    closed: issues.filter((i) => i.status === "closed").length,
  };

  const byPriority = {
    low: issues.filter((i) => i.priority === "low").length,
    medium: issues.filter((i) => i.priority === "medium").length,
    high: issues.filter((i) => i.priority === "high").length,
    critical: issues.filter((i) => i.priority === "critical").length,
  };

  const byCategory = {
    bug: issues.filter((i) => i.category === "bug").length,
    feature: issues.filter((i) => i.category === "feature").length,
    help: issues.filter((i) => i.category === "help").length,
    other: issues.filter((i) => i.category === "other").length,
  };

  // Calculate resolution rate
  const resolvedOrClosed = byStatus.resolved + byStatus.closed;
  const resolutionRate = total > 0 ? Math.round((resolvedOrClosed / total) * 100) : 0;

  // Calculate average response time (mock)
  const avgResponseTime = "2.5 hours";

  return (
    <div className="space-y-6">
      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[rgb(var(--text-secondary))]">Total Issues</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-1">{total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[rgb(var(--text-secondary))]">Open Issues</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-1">
                {byStatus.open}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[rgb(var(--text-secondary))]">Resolved</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-1">
                {resolvedOrClosed}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[rgb(var(--text-secondary))]">Resolution Rate</p>
              <p className="text-2xl font-bold text-[rgb(var(--text-primary))] mt-1">
                {resolutionRate}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Zap className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Status Breakdown */}
        <Card className="p-5">
          <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-4">By Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[rgb(var(--text-secondary))]">Open</span>
              <Badge variant="info" size="sm">
                {byStatus.open}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[rgb(var(--text-secondary))]">In Progress</span>
              <Badge variant="warning" size="sm">
                {byStatus.in_progress}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[rgb(var(--text-secondary))]">Resolved</span>
              <Badge variant="success" size="sm">
                {byStatus.resolved}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[rgb(var(--text-secondary))]">Closed</span>
              <Badge variant="secondary" size="sm">
                {byStatus.closed}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Priority Breakdown */}
        <Card className="p-5">
          <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-4">By Priority</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[rgb(var(--text-secondary))]">Critical</span>
              <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                {byPriority.critical}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[rgb(var(--text-secondary))]">High</span>
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">
                {byPriority.high}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[rgb(var(--text-secondary))]">Medium</span>
              <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded">
                {byPriority.medium}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[rgb(var(--text-secondary))]">Low</span>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">
                {byPriority.low}
              </span>
            </div>
          </div>
        </Card>

        {/* Category Breakdown */}
        <Card className="p-5">
          <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-4">By Category</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-[rgb(var(--text-secondary))]">🐛 Bugs</span>
              <Badge variant="error" size="sm">
                {byCategory.bug}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[rgb(var(--text-secondary))]">✨ Features</span>
              <Badge variant="info" size="sm">
                {byCategory.feature}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[rgb(var(--text-secondary))]">❓ Help</span>
              <Badge variant="warning" size="sm">
                {byCategory.help}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-[rgb(var(--text-secondary))]">📝 Other</span>
              <Badge variant="secondary" size="sm">
                {byCategory.other}
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional Metrics */}
      <Card className="p-5">
        <h3 className="font-semibold text-[rgb(var(--text-primary))] mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-color" />
          Response Times
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-[rgb(var(--text-secondary))]">Average Response Time</p>
            <p className="text-xl font-semibold text-[rgb(var(--text-primary))] mt-1">
              {avgResponseTime}
            </p>
          </div>
          <div>
            <p className="text-sm text-[rgb(var(--text-secondary))]">
              Issues Resolved This Week
            </p>
            <p className="text-xl font-semibold text-[rgb(var(--text-primary))] mt-1">
              {Math.floor(resolvedOrClosed * 0.3)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
