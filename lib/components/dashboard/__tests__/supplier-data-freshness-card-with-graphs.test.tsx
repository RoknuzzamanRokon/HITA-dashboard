/**
 * Tests for Supplier Data Freshness Card With Graphs Component
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { SupplierDataFreshnessCardWithGraphs } from "../supplier-data-freshness-card-with-graphs";

// Mock the API module
jest.mock("@/lib/api/supplier-freshness", () => ({
  fetchSupplierFreshness: jest.fn(),
  formatLastUpdated: jest.fn((date) => "2h ago"),
}));

const mockData = {
  suppliers: [
    {
      supplier: "Expedia",
      lastUpdated: "2023-12-29T10:00:00Z",
      hoursAgo: 2,
      status: "fresh" as const,
      recordCount: 15420,
      errorCount: 0,
    },
    {
      supplier: "Booking.com",
      lastUpdated: "2023-12-29T08:00:00Z",
      hoursAgo: 4,
      status: "fresh" as const,
      recordCount: 23150,
      errorCount: 0,
    },
    {
      supplier: "Agoda",
      lastUpdated: "2023-12-29T04:00:00Z",
      hoursAgo: 8,
      status: "stale" as const,
      recordCount: 18750,
      errorCount: 2,
    },
    {
      supplier: "Hotels.com",
      lastUpdated: "2023-12-28T18:00:00Z",
      hoursAgo: 18,
      status: "stale" as const,
      recordCount: 12300,
      errorCount: 1,
    },
    {
      supplier: "Restel",
      lastUpdated: "2023-12-28T04:00:00Z",
      hoursAgo: 32,
      status: "outdated" as const,
      recordCount: 8900,
      errorCount: 5,
    },
  ],
  summary: {
    totalSuppliers: 5,
    freshCount: 2,
    staleCount: 2,
    outdatedCount: 1,
    lastGlobalUpdate: "2023-12-29T12:00:00Z",
  },
  thresholds: {
    freshHours: 6,
    staleHours: 24,
  },
};

describe("SupplierDataFreshnessCardWithGraphs", () => {
  beforeEach(() => {
    const { fetchSupplierFreshness } = require("@/lib/api/supplier-freshness");
    fetchSupplierFreshness.mockResolvedValue({
      success: true,
      data: mockData,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders the component with title", async () => {
    render(<SupplierDataFreshnessCardWithGraphs />);

    await waitFor(() => {
      expect(screen.getByText("Supplier Data Freshness")).toBeInTheDocument();
    });
  });

  it("displays loading state initially", () => {
    render(<SupplierDataFreshnessCardWithGraphs loading={true} />);

    // Should show skeleton loading
    expect(document.querySelector(".animate-pulse")).toBeInTheDocument();
  });

  it("displays all three sections with correct counts", async () => {
    render(<SupplierDataFreshnessCardWithGraphs />);

    await waitFor(() => {
      expect(screen.getByText("Fresh Data")).toBeInTheDocument();
      expect(screen.getByText("Stale Data")).toBeInTheDocument();
      expect(screen.getByText("Outdated Data")).toBeInTheDocument();
    });

    // Check counts - use getAllByText for multiple matches
    const supplierTexts = screen.getAllByText("2 suppliers");
    expect(supplierTexts).toHaveLength(2); // Fresh and Stale both have 2
    expect(screen.getByText("1 supplier")).toBeInTheDocument(); // Outdated
  });

  it("shows graph when section is clicked", async () => {
    render(<SupplierDataFreshnessCardWithGraphs />);

    await waitFor(() => {
      expect(screen.getByText("Fresh Data")).toBeInTheDocument();
    });

    // Click on Fresh Data section
    fireEvent.click(screen.getByText("Fresh Data"));

    await waitFor(() => {
      expect(
        screen.getByText("Fresh Data - Data Visualization")
      ).toBeInTheDocument();
    });
  });

  it("switches between different graph types", async () => {
    render(<SupplierDataFreshnessCardWithGraphs />);

    await waitFor(() => {
      expect(screen.getByText("Fresh Data")).toBeInTheDocument();
    });

    // Click on Fresh Data section to show graph
    fireEvent.click(screen.getByText("Fresh Data"));

    await waitFor(() => {
      expect(
        screen.getByText("Fresh Data - Data Visualization")
      ).toBeInTheDocument();
    });

    // Find graph type buttons by their titles
    const barChartButton = screen.getByTitle("Bar Chart");
    const pieChartButton = screen.getByTitle("Pie Chart");
    const lineChartButton = screen.getByTitle("Line Chart");

    expect(barChartButton).toBeInTheDocument();
    expect(pieChartButton).toBeInTheDocument();
    expect(lineChartButton).toBeInTheDocument();

    // Test switching to pie chart
    fireEvent.click(pieChartButton);

    // Test switching to line chart
    fireEvent.click(lineChartButton);

    // Test switching back to bar chart
    fireEvent.click(barChartButton);
  });

  it("collapses graph when section is clicked again", async () => {
    render(<SupplierDataFreshnessCardWithGraphs />);

    await waitFor(() => {
      expect(screen.getByText("Fresh Data")).toBeInTheDocument();
    });

    // Click to expand
    fireEvent.click(screen.getByText("Fresh Data"));

    await waitFor(() => {
      expect(
        screen.getByText("Fresh Data - Data Visualization")
      ).toBeInTheDocument();
    });

    // Click to collapse
    fireEvent.click(screen.getByText("Fresh Data"));

    await waitFor(() => {
      expect(
        screen.queryByText("Fresh Data - Data Visualization")
      ).not.toBeInTheDocument();
    });
  });

  it("shows different data for different sections", async () => {
    render(<SupplierDataFreshnessCardWithGraphs />);

    await waitFor(() => {
      expect(screen.getByText("Stale Data")).toBeInTheDocument();
    });

    // Click on Stale Data section
    fireEvent.click(screen.getByText("Stale Data"));

    await waitFor(() => {
      expect(
        screen.getByText("Stale Data - Data Visualization")
      ).toBeInTheDocument();
      // Should show info about stale suppliers
      expect(screen.getByText(/Showing 2 stale suppliers/)).toBeInTheDocument();
    });
  });

  it("handles error state correctly", async () => {
    const { fetchSupplierFreshness } = require("@/lib/api/supplier-freshness");
    fetchSupplierFreshness.mockRejectedValue(new Error("Network error"));

    render(<SupplierDataFreshnessCardWithGraphs />);

    await waitFor(() => {
      expect(screen.getByText("Unable to Load Data")).toBeInTheDocument();
      expect(screen.getByText("Network error")).toBeInTheDocument();
      expect(screen.getByText("Retry")).toBeInTheDocument();
    });
  });

  it("shows empty state when no suppliers in selected section", async () => {
    const emptyData = {
      ...mockData,
      suppliers: [],
      summary: {
        ...mockData.summary,
        freshCount: 0,
        staleCount: 0,
        outdatedCount: 0,
      },
    };

    const { fetchSupplierFreshness } = require("@/lib/api/supplier-freshness");
    fetchSupplierFreshness.mockResolvedValue({
      success: true,
      data: emptyData,
    });

    render(<SupplierDataFreshnessCardWithGraphs />);

    await waitFor(() => {
      expect(screen.getByText("Fresh Data")).toBeInTheDocument();
    });

    // Click on Fresh Data section (which has 0 suppliers)
    fireEvent.click(screen.getByText("Fresh Data"));

    await waitFor(() => {
      expect(screen.getByText("No fresh suppliers found")).toBeInTheDocument();
    });
  });

  it("displays chart statistics correctly", async () => {
    render(<SupplierDataFreshnessCardWithGraphs />);

    await waitFor(() => {
      expect(screen.getByText("Fresh Data")).toBeInTheDocument();
    });

    // Click on Fresh Data section
    fireEvent.click(screen.getByText("Fresh Data"));

    await waitFor(() => {
      // Should show statistics for fresh suppliers
      expect(screen.getByText(/Total Records: 38,570/)).toBeInTheDocument(); // 15420 + 23150
      expect(screen.getByText(/Total Errors: 0/)).toBeInTheDocument();
    });
  });
});
