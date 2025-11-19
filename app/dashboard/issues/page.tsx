/**
 * Enhanced Issues & Support Page
 * Located at /dashboard/issues with comprehensive features
 */

"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { IssueForm } from "@/lib/components/issues/issue-form";
import { IssueList } from "@/lib/components/issues/issue-list";
import { IssueFilters, IssueFilterOptions } from "@/lib/components/issues/issue-filters";
import { IssueStats } from "@/lib/components/issues/issue-stats";
import { ExportIssues } from "@/lib/components/issues/export-issues";
import { WhatsAppButton, WhatsAppFloatingButton } from "@/lib/components/issues/whatsapp-button";
import { Card } from "@/lib/components/ui/card";
import type { Issue, CreateIssueInput } from "@/lib/types/issue";
import { MessageCircle, BarChart3 } from "lucide-react";

// LocalStorage key for issues
const ISSUES_STORAGE_KEY = "user_issues";

type TabType = "issues" | "statistics";

export default function IssuesPage() {
  const { user } = useAuth();
  const [issues, setIssues] = useState<Issue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("issues");

  // Filtering state
  const [filters, setFilters] = useState<IssueFilterOptions>({
    searchTerm: "",
    status: "all",
    priority: "all",
    category: "all",
  });

  // Load issues from localStorage on mount
  useEffect(() => {
    const loadIssues = () => {
      try {
        const stored = localStorage.getItem(ISSUES_STORAGE_KEY);
        if (stored) {
          const parsedIssues = JSON.parse(stored);
          const issuesWithDates = parsedIssues.map((issue: any) => ({
            ...issue,
            createdAt: new Date(issue.createdAt),
            updatedAt: new Date(issue.updatedAt),
            respondedAt: issue.respondedAt ? new Date(issue.respondedAt) : undefined,
          }));

          const userIssues = user
            ? issuesWithDates.filter((i: Issue) => i.userId === user.id)
            : issuesWithDates;

          setIssues(userIssues);
        }
      } catch (error) {
        console.error("Failed to load issues:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadIssues();
  }, [user]);

  // Filter issues based on current filters
  const filteredIssues = useMemo(() => {
    return issues.filter((issue) => {
      // Search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesSearch =
          issue.title.toLowerCase().includes(searchLower) ||
          issue.description.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status !== "all" && issue.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== "all" && issue.priority !== filters.priority) {
        return false;
      }

      // Category filter
      if (filters.category !== "all" && issue.category !== filters.category) {
        return false;
      }

      return true;
    });
  }, [issues, filters]);

  const saveIssues = (newIssues: Issue[]) => {
    try {
      localStorage.setItem(ISSUES_STORAGE_KEY, JSON.stringify(newIssues));
    } catch (error) {
      console.error("Failed to save issues:", error);
    }
  };

  const handleSubmitIssue = async (input: CreateIssueInput) => {
    setIsSubmitting(true);

    try {
      const newIssue: Issue = {
        id: `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...input,
        status: "open",
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user?.id || "anonymous",
      };

      const updatedIssues = [newIssue, ...issues];
      setIssues(updatedIssues);

      const allIssues = JSON.parse(localStorage.getItem(ISSUES_STORAGE_KEY) || "[]");
      const allUpdated = [newIssue, ...allIssues];
      saveIssues(allUpdated);

    } catch (error) {
      console.error("Failed to submit issue:", error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-primary-color" />
          Issues & Support
        </h1>
        <p className="text-[rgb(var(--text-secondary))] mt-2">
          Report issues and track their status
        </p>
      </div>

      {/* Quick Contact Banner */}
      <Card className="p-6 mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-600" />
              Need Immediate Help?
            </h2>
            <p className="text-sm text-gray-700 mt-1">
              Chat with our support team directly on WhatsApp
            </p>
          </div>
          <WhatsAppButton message="Hello! I need assistance with the platform." size="lg" />
        </div>
      </Card>

      {/* Tab Navigation */}
      <div className="border-b border-[rgb(var(--border-primary))] mb-6">
        <nav className="flex gap-1">
          <button
            onClick={() => setActiveTab("issues")}
            className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${
              activeTab === "issues"
                ? "border-b-2 border-primary-color text-primary-color"
                : "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
            }`}
          >
            <MessageCircle className="w-4 h-4" />
            Issues
          </button>
          <button
            onClick={() => setActiveTab("statistics")}
            className={`px-6 py-3 font-medium transition-all flex items-center gap-2 ${
              activeTab === "statistics"
                ? "border-b-2 border-primary-color text-primary-color"
                : "text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Statistics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "issues" && (
        <div className="space-y-6">
          {/* Filters */}
          <IssueFilters
            filters={filters}
            onFilterChange={setFilters}
            resultCount={filteredIssues.length}
          />

          {/* Export Button */}
          <div className="flex justify-end">
            <ExportIssues issues={filteredIssues} />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Submit Issue Form */}
            <div>
              <IssueForm onSubmit={handleSubmitIssue} isSubmitting={isSubmitting} />
            </div>

            {/* Right Column - Issue List */}
            <div>
              <IssueList issues={filteredIssues} loading={isLoading} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "statistics" && (
        <div>
          <IssueStats issues={issues} />
        </div>
      )}

      {/* Floating WhatsApp Button */}
      <WhatsAppFloatingButton message="Hello! I need assistance with the platform." />
    </div>
  );
}
