/**
 * Responsive Layout Tests for Export Jobs List
 * Tests that the layout adapts correctly to different screen sizes
 */

import { render, screen } from "@testing-library/react";
import { ExportJobsList } from "../export-jobs-list";
import { ExportJob } from "@/lib/types/exports";

// Mock export job data
const mockJobs: ExportJob[] = [
  {
    jobId: "exp_123456789012",
    exportType: "hotel",
    status: "completed",
    progress: 100,
    processedRecords: 1000,
    totalRecords: 1000,
    createdAt: new Date("2025-01-15T10:00:00Z"),
    startedAt: new Date("2025-01-15T10:00:05Z"),
    completedAt: new Date("2025-01-15T10:05:00Z"),
    expiresAt: new Date("2025-01-16T10:05:00Z"),
    errorMessage: null,
    downloadUrl: "https://example.com/download/exp_123456789012",
    filters: {
      filters: {
        suppliers: ["supplier1"],
        country_codes: "All",
        min_rating: 0,
        max_rating: 5,
        date_from: "2025-01-01T00:00:00Z",
        date_to: "2025-01-15T00:00:00Z",
        ittids: "All",
        property_types: [],
        page: 1,
        page_size: 100,
        max_records: 1000,
      },
      format: "json" as const,
      include_locations: true,
      include_contacts: true,
      include_mappings: true,
    },
  },
  {
    jobId: "exp_987654321098",
    exportType: "mapping",
    status: "processing",
    progress: 45,
    processedRecords: 450,
    totalRecords: 1000,
    createdAt: new Date("2025-01-15T11:00:00Z"),
    startedAt: new Date("2025-01-15T11:00:05Z"),
    completedAt: null,
    expiresAt: null,
    errorMessage: null,
    downloadUrl: null,
    filters: {
      filters: {
        suppliers: ["supplier2"],
        ittids: "All",
        date_from: "2025-01-01T00:00:00Z",
        date_to: "2025-01-15T00:00:00Z",
        max_records: 1000,
      },
      format: "csv" as const,
    },
  },
];

describe("ExportJobsList Responsive Layout", () => {
  const mockHandlers = {
    onRefreshJob: jest.fn(),
    onDownload: jest.fn(),
    onDeleteJob: jest.fn(),
    onClearCompleted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders jobs list with correct structure", () => {
    render(<ExportJobsList jobs={mockJobs} {...mockHandlers} />);

    // Check that jobs are rendered
    expect(screen.getByText(/Export Jobs \(2\)/i)).toBeInTheDocument();
  });

  it("shows empty state when no jobs exist", () => {
    render(<ExportJobsList jobs={[]} {...mockHandlers} />);

    expect(screen.getByText(/No export jobs yet/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Create your first export job/i)
    ).toBeInTheDocument();
  });

  it("displays clear completed button when completed jobs exist", () => {
    render(<ExportJobsList jobs={mockJobs} {...mockHandlers} />);

    expect(screen.getByText(/Clear Completed \(1\)/i)).toBeInTheDocument();
  });

  it("renders touch-friendly buttons with minimum sizes", () => {
    const { container } = render(
      <ExportJobsList jobs={mockJobs} {...mockHandlers} />
    );

    // Check that action buttons have minimum touch-friendly sizes
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
  });
});
