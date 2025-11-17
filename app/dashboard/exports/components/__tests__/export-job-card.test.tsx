import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportJobCard } from "../export-job-card";
import { ExportJob } from "@/lib/types/exports";

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe("ExportJobCard", () => {
  const mockOnRefresh = jest.fn();
  const mockOnDownload = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnCreateNew = jest.fn();

  const baseJob: ExportJob = {
    jobId: "exp_1234567890abcdef",
    exportType: "hotel",
    status: "processing",
    progress: 50,
    processedRecords: 500,
    totalRecords: 1000,
    createdAt: new Date("2024-01-15T10:00:00Z"),
    startedAt: new Date("2024-01-15T10:01:00Z"),
    completedAt: null,
    expiresAt: null,
    errorMessage: null,
    downloadUrl: null,
    filters: {
      filters: {
        suppliers: ["expedia"],
        country_codes: "All",
        min_rating: 0,
        max_rating: 5,
        date_from: "",
        date_to: "",
        ittids: "All",
        property_types: [],
        page: 1,
        page_size: 100,
        max_records: 1000,
      },
      format: "json",
      include_locations: true,
      include_contacts: true,
      include_mappings: true,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnRefresh.mockResolvedValue(undefined);
    mockOnDownload.mockResolvedValue(undefined);
  });

  describe("Status Display", () => {
    it("should display processing status with progress bar", () => {
      render(
        <ExportJobCard
          job={baseJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("Processing")).toBeInTheDocument();
      expect(screen.getByText("50%")).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("should display completed status", () => {
      const completedJob: ExportJob = {
        ...baseJob,
        status: "completed",
        progress: 100,
        processedRecords: 1000,
        completedAt: new Date("2024-01-15T10:30:00Z"),
        expiresAt: new Date("2024-01-16T10:30:00Z"),
        downloadUrl: "https://example.com/download/exp_123",
      };

      render(
        <ExportJobCard
          job={completedJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("Completed")).toBeInTheDocument();
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("should display failed status with error message", () => {
      const failedJob: ExportJob = {
        ...baseJob,
        status: "failed",
        errorMessage: "Database connection timeout",
        completedAt: new Date("2024-01-15T10:15:00Z"),
      };

      render(
        <ExportJobCard
          job={failedJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("Failed")).toBeInTheDocument();
      expect(
        screen.getByText("Database connection timeout")
      ).toBeInTheDocument();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("should display expired status with warning", () => {
      const expiredJob: ExportJob = {
        ...baseJob,
        status: "expired",
        progress: 100,
        processedRecords: 1000,
        completedAt: new Date("2024-01-15T10:30:00Z"),
        expiresAt: new Date("2024-01-15T11:30:00Z"),
      };

      render(
        <ExportJobCard
          job={expiredJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
          onCreateNew={mockOnCreateNew}
        />
      );

      expect(screen.getByText("Expired")).toBeInTheDocument();
      expect(screen.getByText(/download expired/i)).toBeInTheDocument();
    });
  });

  describe("Job Information Display", () => {
    it("should display job ID with truncation", () => {
      render(
        <ExportJobCard
          job={baseJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/exp_1234567890abcdef/i)).toBeInTheDocument();
    });

    it("should display export type badge", () => {
      render(
        <ExportJobCard
          job={baseJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("Hotel Export")).toBeInTheDocument();
    });

    it("should display mapping export type", () => {
      const mappingJob: ExportJob = {
        ...baseJob,
        exportType: "mapping",
      };

      render(
        <ExportJobCard
          job={mappingJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText("Mapping Export")).toBeInTheDocument();
    });

    it("should display records count", () => {
      render(
        <ExportJobCard
          job={baseJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/500/)).toBeInTheDocument();
      expect(screen.getByText(/1,000/)).toBeInTheDocument();
    });

    it("should display timestamps", () => {
      render(
        <ExportJobCard
          job={baseJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByText(/created:/i)).toBeInTheDocument();
      expect(screen.getByText(/started:/i)).toBeInTheDocument();
    });
  });

  describe("Button Interactions", () => {
    it("should call onRefresh when refresh button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <ExportJobCard
          job={baseJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      const refreshButton = screen.getByRole("button", { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(mockOnRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it("should show loading state during refresh", async () => {
      const user = userEvent.setup();
      let resolveRefresh: () => void;
      const refreshPromise = new Promise<void>((resolve) => {
        resolveRefresh = resolve;
      });
      mockOnRefresh.mockReturnValue(refreshPromise);

      render(
        <ExportJobCard
          job={baseJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      const refreshButton = screen.getByRole("button", { name: /refresh/i });
      await user.click(refreshButton);

      expect(
        screen.getByLabelText(/refreshing job status/i)
      ).toBeInTheDocument();

      resolveRefresh!();
      await waitFor(() => {
        expect(
          screen.getByLabelText(/refresh job status/i)
        ).toBeInTheDocument();
      });
    });

    it("should call onDownload when download button is clicked", async () => {
      const user = userEvent.setup();
      const completedJob: ExportJob = {
        ...baseJob,
        status: "completed",
        progress: 100,
        completedAt: new Date("2024-01-15T10:30:00Z"),
        expiresAt: new Date("2024-01-16T10:30:00Z"),
        downloadUrl: "https://example.com/download/exp_123",
      };

      render(
        <ExportJobCard
          job={completedJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      const downloadButton = screen.getByRole("button", { name: /download/i });
      await user.click(downloadButton);

      await waitFor(() => {
        expect(mockOnDownload).toHaveBeenCalledTimes(1);
      });
    });

    it("should not show download button for processing jobs", () => {
      render(
        <ExportJobCard
          job={baseJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      expect(
        screen.queryByRole("button", { name: /download/i })
      ).not.toBeInTheDocument();
    });

    it("should not show download button for expired jobs", () => {
      const expiredJob: ExportJob = {
        ...baseJob,
        status: "expired",
        progress: 100,
        completedAt: new Date("2024-01-15T10:30:00Z"),
        expiresAt: new Date("2024-01-15T11:30:00Z"),
      };

      render(
        <ExportJobCard
          job={expiredJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
          onCreateNew={mockOnCreateNew}
        />
      );

      expect(
        screen.queryByRole("button", { name: /download/i })
      ).not.toBeInTheDocument();
    });

    it("should call onDelete when delete button is clicked", async () => {
      const user = userEvent.setup();
      render(
        <ExportJobCard
          job={baseJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      const deleteButton = screen.getByRole("button", { name: /delete job/i });
      await user.click(deleteButton);

      expect(mockOnDelete).toHaveBeenCalledTimes(1);
    });

    it("should call onCreateNew for expired jobs", async () => {
      const user = userEvent.setup();
      const expiredJob: ExportJob = {
        ...baseJob,
        status: "expired",
        progress: 100,
        completedAt: new Date("2024-01-15T10:30:00Z"),
        expiresAt: new Date("2024-01-15T11:30:00Z"),
      };

      render(
        <ExportJobCard
          job={expiredJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
          onCreateNew={mockOnCreateNew}
        />
      );

      const createNewButton = screen.getByRole("button", {
        name: /create new export/i,
      });
      await user.click(createNewButton);

      expect(mockOnCreateNew).toHaveBeenCalledTimes(1);
    });

    it("should not show refresh button for expired jobs", () => {
      const expiredJob: ExportJob = {
        ...baseJob,
        status: "expired",
        progress: 100,
        completedAt: new Date("2024-01-15T10:30:00Z"),
        expiresAt: new Date("2024-01-15T11:30:00Z"),
      };

      render(
        <ExportJobCard
          job={expiredJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
          onCreateNew={mockOnCreateNew}
        />
      );

      expect(
        screen.queryByRole("button", { name: /refresh/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Copy Job ID", () => {
    it("should copy job ID to clipboard", async () => {
      const user = userEvent.setup();
      render(
        <ExportJobCard
          job={baseJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      const copyButton = screen.getByRole("button", { name: /copy job id/i });
      await user.click(copyButton);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        "exp_1234567890abcdef"
      );
    });

    it("should show copied feedback", async () => {
      const user = userEvent.setup();
      render(
        <ExportJobCard
          job={baseJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      const copyButton = screen.getByRole("button", { name: /copy job id/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/job id copied/i)).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(
        <ExportJobCard
          job={baseJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      expect(screen.getByRole("article")).toHaveAttribute(
        "aria-label",
        expect.stringContaining("hotel export job")
      );
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-label",
        expect.stringContaining("50%")
      );
    });

    it("should have proper role for error messages", () => {
      const failedJob: ExportJob = {
        ...baseJob,
        status: "failed",
        errorMessage: "Database connection timeout",
      };

      render(
        <ExportJobCard
          job={failedJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveAttribute("aria-live", "assertive");
    });

    it("should meet touch target size requirements", () => {
      render(
        <ExportJobCard
          job={baseJob}
          onRefresh={mockOnRefresh}
          onDownload={mockOnDownload}
          onDelete={mockOnDelete}
        />
      );

      const refreshButton = screen.getByRole("button", { name: /refresh/i });
      const deleteButton = screen.getByRole("button", { name: /delete/i });

      // Buttons should have min-h-[44px] class for mobile
      expect(refreshButton).toHaveClass("min-h-[44px]");
      expect(deleteButton).toHaveClass("min-h-[44px]");
    });
  });
});
