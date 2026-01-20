/**
 * Export Issues Component
 * Export issues to CSV or JSON
 */

"use client";

import React from "react";
import { Button } from "@/lib/components/ui/button";
import type { Issue } from "@/lib/types/issue";
import { Download, FileJson, FileSpreadsheet } from "lucide-react";

interface ExportIssuesProps {
  issues: Issue[];
}

export function ExportIssues({ issues }: ExportIssuesProps) {
  const exportToJSON = () => {
    const dataStr = JSON.stringify(issues, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `issues_${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = () => {
    // CSV headers
    const headers = [
      "ID",
      "Title",
      "Description",
      "Category",
      "Priority",
      "Status",
      "Created At",
      "Updated At",
      "User Email"
    ];

    // Convert issues to CSV rows
    const rows = issues.map((issue) => [
      issue.id,
      `"${issue.title.replace(/"/g, '""')}"`,
      `"${issue.description.replace(/"/g, '""')}"`,
      issue.category,
      issue.priority,
      issue.status,
      new Date(issue.createdAt).toISOString(),
      new Date(issue.updatedAt).toISOString(),
      issue.userEmail || "",
    ]);

    // Combine headers and rows
    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    // Download
    const dataBlob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `issues_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-[rgb(var(--text-secondary))]">Export:</span>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToJSON}
        leftIcon={<FileJson className="w-4 h-4" />}
        disabled={issues.length === 0}
      >
        JSON
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={exportToCSV}
        leftIcon={<FileSpreadsheet className="w-4 h-4" />}
        disabled={issues.length === 0}
      >
        CSV
      </Button>
    </div>
  );
}
