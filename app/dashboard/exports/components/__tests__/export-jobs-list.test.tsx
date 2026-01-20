import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportJobsList } from "../export-jobs-list";
import { ExportJob } from "@/lib/types/exports";

// Mock react-window
jest.mock("react-window", () => ({
  List: ({ children, rowCount, rowComponent: RowComponent, rowProps }: any) => (
    <div data-testid="virtual-list">
      {Array.from({ length: Math.min(rowCount, 10) }).map((_, index) => (
        <div key={index}>
          <RowComponent index={index} style={{}} {...rowProps} />
        </div>
      ))}
    </div>
  ),
}));

describe("ExportJobsList", () => {
  const mockOnRefreshJob = jest.fn();
  const mockOnDownload = jest.fn();
  const mockOnDeleteJob = jest.fn();
  const mockOnClearCompleted = jest.fn();
  const mockOnCreateNew = jest.fn();

  const createMockJob = (overrides: Partial<ExportJob> = {}): ExportJob => ({
    jobId: `exp_${Math.random().toString(36).substr(2, 9)}`,
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
    ...overrides,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnRefreshJob.mockResolvedValue(undefined);
    mockOnDownload.mockResolvedValue(undefined);
  });

  describe("Empty State", () => {
    it("should display empty state when no jobs exist", () => {
      render(
        <ExportJobsList
          jobs={[]}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      expect(screen.getByText(/no export jobs yet/i)).toBeInTheDocument();
      expect(
        screen.getByText(/create your first export job/i)
      ).toBeInTheDocument();
    });

    it("should not show clear completed button when no jobs", () => {
      render(
        <ExportJobsList
          jobs={[]}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      expect(
        screen.queryByRole("button", { name: /clear completed/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should display skeleton loaders when loading", () => {
      render(
        <ExportJobsList
          jobs={[]}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
          isLoading={true}
        />
      );

      // Skeleton component should be rendered
      expect(screen.queryByText(/no export jobs yet/i)).not.toBeInTheDocument();
    });
  });

  describe("Job Rendering", () => {
    it("should render jobs list with correct count", () => {
      const jobs = [
        createMockJob({ jobId: "exp_1" }),
        createMockJob({ jobId: "exp_2" }),
        createMockJob({ jobId: "exp_3" }),
      ];

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      expect(screen.getByText(/export jobs \(3\)/i)).toBeInTheDocument();
    });

    it("should sort jobs by created date descending", () => {
      const jobs = [
        createMockJob({
          jobId: "exp_1",
          createdAt: new Date("2024-01-15T10:00:00Z"),
        }),
        createMockJob({
          jobId: "exp_2",
          createdAt: new Date("2024-01-15T12:00:00Z"),
        }),
        createMockJob({
          jobId: "exp_3",
          createdAt: new Date("2024-01-15T11:00:00Z"),
        }),
      ];

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      // Jobs should be sorted with newest first (exp_2, exp_3, exp_1)
      const jobElements = screen.getAllByText(/exp_/);
      expect(jobElements[0].textContent).toContain("exp_2");
    });

    it("should render different job statuses", () => {
      const jobs = [
        createMockJob({ status: "processing" }),
        createMockJob({ status: "completed", completedAt: new Date() }),
        createMockJob({ status: "failed", errorMessage: "Error" }),
      ];

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      expect(screen.getByText("Processing")).toBeInTheDocument();
      expect(screen.getByText("Completed")).toBeInTheDocument();
      expect(screen.getByText("Failed")).toBeInTheDocument();
    });
  });

  describe("Clear Completed Functionality", () => {
    it("should show clear completed button when completed jobs exist", () => {
      const jobs = [
        createMockJob({ status: "completed", completedAt: new Date() }),
        createMockJob({ status: "failed", errorMessage: "Error" }),
        createMockJob({ status: "processing" }),
      ];

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      expect(
        screen.getByRole("button", { name: /clear 2 completed jobs/i })
      ).toBeInTheDocument();
    });

    it("should call onClearCompleted when button is clicked", async () => {
      const user = userEvent.setup();
      const jobs = [
        createMockJob({ status: "completed", completedAt: new Date() }),
        createMockJob({ status: "processing" }),
      ];

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      const clearButton = screen.getByRole("button", {
        name: /clear 1 completed job/i,
      });
      await user.click(clearButton);

      expect(mockOnClearCompleted).toHaveBeenCalledTimes(1);
    });

    it("should count expired jobs as completed", () => {
      const jobs = [
        createMockJob({ status: "expired" }),
        createMockJob({ status: "completed", completedAt: new Date() }),
        createMockJob({ status: "processing" }),
      ];

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      expect(
        screen.getByRole("button", { name: /clear 2 completed jobs/i })
      ).toBeInTheDocument();
    });
  });

  describe("Job Actions", () => {
    it("should call onRefreshJob with correct job ID", async () => {
      const user = userEvent.setup();
      const jobs = [createMockJob({ jobId: "exp_test123" })];

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      const refreshButton = screen.getByRole("button", { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(mockOnRefreshJob).toHaveBeenCalledWith("exp_test123");
      });
    });

    it("should call onDownload with correct job ID", async () => {
      const user = userEvent.setup();
      const jobs = [
        createMockJob({
          jobId: "exp_test456",
          status: "completed",
          completedAt: new Date(),
          expiresAt: new Date(Date.now() + 86400000), // 24 hours from now
          downloadUrl: "https://example.com/download",
        }),
      ];

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      const downloadButton = screen.getByRole("button", { name: /download/i });
      await user.click(downloadButton);

      await waitFor(() => {
        expect(mockOnDownload).toHaveBeenCalledWith("exp_test456");
      });
    });

    it("should call onDeleteJob with correct job ID", async () => {
      const user = userEvent.setup();
      const jobs = [createMockJob({ jobId: "exp_test789" })];

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      const deleteButton = screen.getByRole("button", { name: /delete/i });
      await user.click(deleteButton);

      expect(mockOnDeleteJob).toHaveBeenCalledWith("exp_test789");
    });
  });

  describe("Refreshing Indicator", () => {
    it("should show refreshing indicator when isRefreshing is true", () => {
      const jobs = [createMockJob()];

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
          isRefreshing={true}
        />
      );

      expect(screen.getByLabelText(/refreshing jobs/i)).toBeInTheDocument();
    });

    it("should not show refreshing indicator when isRefreshing is false", () => {
      const jobs = [createMockJob()];

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
          isRefreshing={false}
        />
      );

      expect(
        screen.queryByLabelText(/refreshing jobs/i)
      ).not.toBeInTheDocument();
    });
  });

  describe("Virtual Scrolling", () => {
    it("should use virtual scrolling for large job lists", () => {
      // Create 150 jobs to trigger virtual scrolling (threshold is 100)
      const jobs = Array.from({ length: 150 }, (_, i) =>
        createMockJob({ jobId: `exp_${i}` })
      );

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      // Virtual list should be rendered
      expect(screen.getByTestId("virtual-list")).toBeInTheDocument();
    });

    it("should not use virtual scrolling for small job lists", () => {
      const jobs = Array.from({ length: 10 }, (_, i) =>
        createMockJob({ jobId: `exp_${i}` })
      );

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      // Virtual list should not be rendered for small lists
      expect(screen.queryByTestId("virtual-list")).not.toBeInTheDocument();
    });
  });

  describe("Responsive Layout", () => {
    it("should render table view on desktop", () => {
      const jobs = [createMockJob()];

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      // Table should be rendered (hidden on mobile/tablet)
      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("should have proper table headers", () => {
      const jobs = [createMockJob()];

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      expect(screen.getByText("Job ID")).toBeInTheDocument();
      expect(screen.getByText("Type")).toBeInTheDocument();
      expect(screen.getByText("Status")).toBeInTheDocument();
      expect(screen.getByText("Progress")).toBeInTheDocument();
      expect(screen.getByText("Records")).toBeInTheDocument();
      expect(screen.getByText("Created")).toBeInTheDocument();
      expect(screen.getByText("Actions")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      const jobs = [createMockJob()];

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      expect(screen.getByRole("table")).toHaveAttribute(
        "aria-label",
        "Export jobs table"
      );
    });

    it("should have proper list role for card views", () => {
      const jobs = [createMockJob()];

      render(
        <ExportJobsList
          jobs={jobs}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
        />
      );

      const lists = screen.getAllByRole("list");
      expect(lists.length).toBeGreaterThan(0);
    });
  });

  describe("Create New Export", () => {
    it("should call onCreateNew for expired jobs", async () => {
      const user = userEvent.setup();
      const expiredJob = createMockJob({
        status: "expired",
        completedAt: new Date(),
        expiresAt: new Date(Date.now() - 86400000), // 24 hours ago
      });

      render(
        <ExportJobsList
          jobs={[expiredJob]}
          onRefreshJob={mockOnRefreshJob}
          onDownload={mockOnDownload}
          onDeleteJob={mockOnDeleteJob}
          onClearCompleted={mockOnClearCompleted}
          onCreateNew={mockOnCreateNew}
        />
      );

      const createNewButton = screen.getByRole("button", {
        name: /create new export/i,
      });
      await user.click(createNewButton);

      expect(mockOnCreateNew).toHaveBeenCalledWith(expiredJob);
    });
  });
});
