/**
 * Issue Filters Component
 * Advanced filtering and search for issues
 */

"use client";

import React from "react";
import { Input } from "@/lib/components/ui/input";
import { Select, SelectOption } from "@/lib/components/ui/select";
import { Search, Filter, X } from "lucide-react";
import type { IssueStatus, IssuePriority, IssueCategory } from "@/lib/types/issue";

export interface IssueFilterOptions {
  searchTerm: string;
  status: IssueStatus | "all";
  priority: IssuePriority | "all";
  category: IssueCategory | "all";
}

interface IssueFiltersProps {
  filters: IssueFilterOptions;
  onFilterChange: (filters: IssueFilterOptions) => void;
  resultCount: number;
}

const statusOptions: SelectOption[] = [
  { value: "all", label: "All Statuses" },
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "closed", label: "Closed" },
];

const priorityOptions: SelectOption[] = [
  { value: "all", label: "All Priorities" },
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const categoryOptions: SelectOption[] = [
  { value: "all", label: "All Categories" },
  { value: "bug", label: "🐛 Bug" },
  { value: "feature", label: "✨ Feature" },
  { value: "help", label: "❓ Help" },
  { value: "other", label: "📝 Other" },
];

export function IssueFilters({ filters, onFilterChange, resultCount }: IssueFiltersProps) {
  const hasActiveFilters =
    filters.searchTerm ||
    filters.status !== "all" ||
    filters.priority !== "all" ||
    filters.category !== "all";

  const handleReset = () => {
    onFilterChange({
      searchTerm: "",
      status: "all",
      priority: "all",
      category: "all",
    });
  };

  return (
    <div className="bg-[rgb(var(--bg-primary))] border border-[rgb(var(--border-primary))] rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-primary-color" />
          <h3 className="font-semibold text-[rgb(var(--text-primary))]">Filters</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="text-sm text-primary-color hover:text-primary-hover flex items-center gap-1 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            placeholder="Search issues..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>

        {/* Status Filter */}
        <Select
          placeholder="Filter by status"
          value={filters.status}
          onChange={(value) =>
            onFilterChange({ ...filters, status: value as IssueStatus | "all" })
          }
          options={statusOptions}
        />

        {/* Priority Filter */}
        <Select
          placeholder="Filter by priority"
          value={filters.priority}
          onChange={(value) =>
            onFilterChange({ ...filters, priority: value as IssuePriority | "all" })
          }
          options={priorityOptions}
        />

        {/* Category Filter - Moved to second row for better spacing */}
        <div className="md:col-span-2 lg:col-span-1">
          <Select
            placeholder="Filter by category"
            value={filters.category}
            onChange={(value) =>
              onFilterChange({ ...filters, category: value as IssueCategory | "all" })
            }
            options={categoryOptions}
          />
        </div>

        {/* Result Count */}
        <div className="md:col-span-2 lg:col-span-3 flex items-center text-sm text-[rgb(var(--text-secondary))]">
          <span>
            Showing <span className="font-semibold text-primary-color">{resultCount}</span>{" "}
            {resultCount === 1 ? "issue" : "issues"}
          </span>
        </div>
      </div>
    </div>
  );
}
