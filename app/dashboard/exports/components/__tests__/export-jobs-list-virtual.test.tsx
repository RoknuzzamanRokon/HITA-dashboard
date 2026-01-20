/**
 * Virtual Scrolling Test for Export Jobs List
 *
 * Tests that virtual scrolling is enabled for 100+ jobs
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { ExportJobsList } from "../export-jobs-list";
import { ExportJob } from "@/lib/types/exports";

// Mock react-window
jest.mock("react-window", () => ({
  FixedSizeList: ({ children, itemCount, itemData }: any) => {
    const Row = children;
    return (
      <div data-testid="virtual-list" data-item-count={itemCount}>
        {/* Render first 10 items for testing */}
        {Array.from({ length: Math.min(10, itemCount) }).map((_, index) => (
          <Row key={index} index={index} style={{}} data={itemData} />
        ))}
      </div>
    );
  },
}));

// Helper to generate mock jobs
function generateMockJobs(count: number): ExportJob[] {
  return Array.from({ length: count }, (_, i) => ({
    jobId: `exp_${String(i).padStart(12, "0")}`,
    exportType: i % 2 === 0 ? ("hotel" as const) : ("mapping" as const),
    status: "processing" as const,
    progress: Math.floor(Math.random() * 100),
    processedRecords: Math.floor(Math.random() * 1000),
    totalRecords: 1000,
    createdAt: new Date(Date.now() - i * 60000),
    startedAt: new Date(Date.now() - i * 60000 + 5000),
    completedAt: null,
    expiresAt: null,
    errorMessage: null,
    downloadUrl: null,
    filters: {
      filters: {
        suppliers: ["supplier1"],
        country_codes: "All",
        min_rating: 0,
        max_rating: 5,
        date_from: "2024-01-01T00:00:00",
        date_to: "2024-12-31T23:59:59",
        ittids: "All",
        property_types: [],
        page: 1,
        page_size: 100,
        max_records: 1000,
      },
      format: "json" as const,
      include_locations: false,
      include_contacts: false,
      include_mappings: false,
    },
  }));
}

describe("ExportJobsList Virtual Scrolling", () => {
  const mockHandlers = {
    onRefreshJob: jest.fn().mockResolvedValue(undefined),
    onDownload: jest.fn().mockResolvedValue(undefined),
    onDeleteJob: jest.fn(),
    onClearCompleted: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should NOT use virtual scrolling for less than 100 jobs", () => {
    const jobs = generateMockJobs(50);
    render(<ExportJobsList jobs={jobs} {...mockHandlers} />);

    // Virtual list should not be present
    expect(screen.queryByTestId("virtual-list")).not.toBeInTheDocument();
  });

  it("should use virtual scrolling for 100+ jobs", () => {
    const jobs = generateMockJobs(150);
    render(<ExportJobsList jobs={jobs} {...mockHandlers} />);

    // Virtual list should be present
    const virtualLists = screen.getAllByTestId("virtual-list");
    expect(virtualLists.length).toBeGreaterThan(0);
  });

  it("should render correct item count in virtual list", () => {
    const jobs = generateMockJobs(200);
    render(<ExportJobsList jobs={jobs} {...mockHandlers} />);

    const virtualList = screen.getAllByTestId("virtual-list")[0];
    expect(virtualList).toHaveAttribute("data-item-count", "200");
  });

  it("should handle empty jobs list", () => {
    render(<ExportJobsList jobs={[]} {...mockHandlers} />);

    expect(screen.getByText("No export jobs yet")).toBeInTheDocument();
  });

  it("should display jobs count in header", () => {
    const jobs = generateMockJobs(150);
    render(<ExportJobsList jobs={jobs} {...mockHandlers} />);

    expect(screen.getByText("Export Jobs (150)")).toBeInTheDocument();
  });
});
