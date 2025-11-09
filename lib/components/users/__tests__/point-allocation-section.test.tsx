/**
 * Unit tests for PointAllocationSection component
 * Tests all allocation types, validation, and point allocation functionality
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PointAllocationSection } from "../point-allocation-section";
import { UserEditService } from "@/lib/api/user-edit";

// Mock dependencies
jest.mock("@/lib/api/user-edit");
jest.mock("@/lib/components/ui/toast", () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  }),
}));

describe("PointAllocationSection", () => {
  const mockOnAllocationComplete = jest.fn();
  const mockOnOptimisticUpdate = jest.fn();

  const defaultProps = {
    userId: "user-123",
    userEmail: "test@example.com",
    currentPoints: 500,
    onAllocationComplete: mockOnAllocationComplete,
    onOptimisticUpdate: mockOnOptimisticUpdate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render point allocation section", () => {
      render(<PointAllocationSection {...defaultProps} />);

      expect(screen.getByText("Point Allocation")).toBeInTheDocument();
      expect(screen.getByText("Current Points")).toBeInTheDocument();
      expect(screen.getByText("500")).toBeInTheDocument();
    });

    it("should render allocation type selector with all options", () => {
      render(<PointAllocationSection {...defaultProps} />);

      const select = screen.getByLabelText(/Select Package Type/i);
      expect(select).toBeInTheDocument();

      // Check all allocation type options are present
      expect(
        screen.getByRole("option", { name: /Admin User Package/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: /One Year Package/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: /One Month Package/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: /Per Request Point/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: /Guest Point/i })
      ).toBeInTheDocument();
    });

    it("should render allocate points button", () => {
      render(<PointAllocationSection {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /Allocate Points/i })
      ).toBeInTheDocument();
    });
  });

  describe("Allocation Type Selection", () => {
    it("should allow selecting admin_user_package", async () => {
      const user = userEvent.setup();
      render(<PointAllocationSection {...defaultProps} />);

      const select = screen.getByLabelText(/Select Package Type/i);
      await user.selectOptions(select, "admin_user_package");

      expect(select).toHaveValue("admin_user_package");
    });

    it("should allow selecting one_year_package", async () => {
      const user = userEvent.setup();
      render(<PointAllocationSection {...defaultProps} />);

      const select = screen.getByLabelText(/Select Package Type/i);
      await user.selectOptions(select, "one_year_package");

      expect(select).toHaveValue("one_year_package");
    });

    it("should allow selecting one_month_package", async () => {
      const user = userEvent.setup();
      render(<PointAllocationSection {...defaultProps} />);

      const select = screen.getByLabelText(/Select Package Type/i);
      await user.selectOptions(select, "one_month_package");

      expect(select).toHaveValue("one_month_package");
    });

    it("should allow selecting per_request_point", async () => {
      const user = userEvent.setup();
      render(<PointAllocationSection {...defaultProps} />);

      const select = screen.getByLabelText(/Select Package Type/i);
      await user.selectOptions(select, "per_request_point");

      expect(select).toHaveValue("per_request_point");
    });

    it("should allow selecting guest_point", async () => {
      const user = userEvent.setup();
      render(<PointAllocationSection {...defaultProps} />);

      const select = screen.getByLabelText(/Select Package Type/i);
      await user.selectOptions(select, "guest_point");

      expect(select).toHaveValue("guest_point");
    });
  });

  describe("Point Allocation", () => {
    it("should call allocatePoints API with correct parameters", async () => {
      const user = userEvent.setup();
      (UserEditService.allocatePoints as jest.Mock).mockResolvedValue({
        success: true,
        data: { message: "Points allocated successfully" },
      });

      render(<PointAllocationSection {...defaultProps} />);

      const select = screen.getByLabelText(/Select Package Type/i);
      await user.selectOptions(select, "one_year_package");

      const allocateButton = screen.getByRole("button", {
        name: /Allocate Points/i,
      });
      await user.click(allocateButton);

      await waitFor(() => {
        expect(UserEditService.allocatePoints).toHaveBeenCalledWith(
          "user-123",
          "test@example.com",
          "one_year_package"
        );
      });
    });

    it("should call onAllocationComplete after successful allocation", async () => {
      const user = userEvent.setup();
      (UserEditService.allocatePoints as jest.Mock).mockResolvedValue({
        success: true,
        data: { message: "Points allocated successfully" },
      });

      render(<PointAllocationSection {...defaultProps} />);

      const allocateButton = screen.getByRole("button", {
        name: /Allocate Points/i,
      });
      await user.click(allocateButton);

      await waitFor(() => {
        expect(mockOnAllocationComplete).toHaveBeenCalled();
      });
    });

    it("should apply optimistic update before API call", async () => {
      const user = userEvent.setup();
      (UserEditService.allocatePoints as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<PointAllocationSection {...defaultProps} />);

      const allocateButton = screen.getByRole("button", {
        name: /Allocate Points/i,
      });
      await user.click(allocateButton);

      // Optimistic update should be called immediately
      expect(mockOnOptimisticUpdate).toHaveBeenCalled();
    });

    it("should rollback optimistic update on error", async () => {
      const user = userEvent.setup();
      (UserEditService.allocatePoints as jest.Mock).mockResolvedValue({
        success: false,
        error: { status: 500, message: "Server error" },
      });

      render(<PointAllocationSection {...defaultProps} />);

      const allocateButton = screen.getByRole("button", {
        name: /Allocate Points/i,
      });
      await user.click(allocateButton);

      await waitFor(() => {
        // Should be called twice: once for optimistic update, once for rollback (null)
        expect(mockOnOptimisticUpdate).toHaveBeenCalledTimes(2);
        expect(mockOnOptimisticUpdate).toHaveBeenLastCalledWith(null);
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading state during allocation", async () => {
      const user = userEvent.setup();
      (UserEditService.allocatePoints as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<PointAllocationSection {...defaultProps} />);

      const allocateButton = screen.getByRole("button", {
        name: /Allocate Points/i,
      });
      await user.click(allocateButton);

      expect(screen.getByText(/Allocating Points.../i)).toBeInTheDocument();
      expect(allocateButton).toBeDisabled();
    });

    it("should disable select during allocation", async () => {
      const user = userEvent.setup();
      (UserEditService.allocatePoints as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<PointAllocationSection {...defaultProps} />);

      const allocateButton = screen.getByRole("button", {
        name: /Allocate Points/i,
      });
      await user.click(allocateButton);

      const select = screen.getByLabelText(/Select Package Type/i);
      expect(select).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("should display error message on allocation failure", async () => {
      const user = userEvent.setup();
      (UserEditService.allocatePoints as jest.Mock).mockResolvedValue({
        success: false,
        error: { status: 500, message: "Failed to allocate points" },
      });

      render(<PointAllocationSection {...defaultProps} />);

      const allocateButton = screen.getByRole("button", {
        name: /Allocate Points/i,
      });
      await user.click(allocateButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to allocate points/i)
        ).toBeInTheDocument();
      });
    });

    it("should display permission error", async () => {
      const user = userEvent.setup();
      (UserEditService.allocatePoints as jest.Mock).mockResolvedValue({
        success: false,
        error: { status: 403, message: "Permission denied" },
      });

      render(<PointAllocationSection {...defaultProps} />);

      const allocateButton = screen.getByRole("button", {
        name: /Allocate Points/i,
      });
      await user.click(allocateButton);

      await waitFor(() => {
        expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<PointAllocationSection {...defaultProps} />);

      expect(screen.getByLabelText(/Select Package Type/i)).toBeInTheDocument();
      expect(
        screen.getByRole("region", { name: /Current points balance/i })
      ).toBeInTheDocument();
    });

    it("should announce loading state to screen readers", async () => {
      const user = userEvent.setup();
      (UserEditService.allocatePoints as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<PointAllocationSection {...defaultProps} />);

      const allocateButton = screen.getByRole("button", {
        name: /Allocate Points/i,
      });
      await user.click(allocateButton);

      expect(allocateButton).toHaveAttribute("aria-busy", "true");
    });
  });
});
