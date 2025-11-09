/**
 * Unit tests for SupplierManagementSection component
 * Tests supplier selection, activation, and deactivation functionality
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SupplierManagementSection } from "../supplier-management-section";
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

describe("SupplierManagementSection", () => {
  const mockOnSuppliersUpdated = jest.fn();
  const mockOnOptimisticUpdate = jest.fn();

  const defaultProps = {
    userId: "user-123",
    activeSuppliers: ["Expedia", "Booking.com"],
    totalSuppliers: 8,
    onSuppliersUpdated: mockOnSuppliersUpdated,
    onOptimisticUpdate: mockOnOptimisticUpdate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render supplier management section", () => {
      render(<SupplierManagementSection {...defaultProps} />);

      expect(screen.getByText("Supplier Management")).toBeInTheDocument();
      expect(screen.getByText("Active Suppliers")).toBeInTheDocument();
    });

    it("should display active suppliers count", () => {
      render(<SupplierManagementSection {...defaultProps} />);

      expect(screen.getByText("2 / 8")).toBeInTheDocument();
    });

    it("should display list of active suppliers", () => {
      render(<SupplierManagementSection {...defaultProps} />);

      expect(screen.getByText("Expedia")).toBeInTheDocument();
      expect(screen.getByText("Booking.com")).toBeInTheDocument();
    });

    it("should display message when no active suppliers", () => {
      render(
        <SupplierManagementSection {...defaultProps} activeSuppliers={[]} />
      );

      expect(screen.getByText("No active suppliers")).toBeInTheDocument();
    });

    it("should render all available supplier checkboxes", () => {
      render(<SupplierManagementSection {...defaultProps} />);

      const suppliers = [
        "Expedia",
        "Booking.com",
        "Agoda",
        "Hotels.com",
        "Airbnb",
        "TripAdvisor",
        "Priceline",
        "Kayak",
      ];

      suppliers.forEach((supplier) => {
        expect(
          screen.getByLabelText(`${supplier} supplier`)
        ).toBeInTheDocument();
      });
    });

    it("should render activate and deactivate buttons", () => {
      render(<SupplierManagementSection {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /Activate/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Deactivate/i })
      ).toBeInTheDocument();
    });
  });

  describe("Supplier Selection", () => {
    it("should allow selecting a single supplier", async () => {
      const user = userEvent.setup();
      render(<SupplierManagementSection {...defaultProps} />);

      const checkbox = screen.getByLabelText("Agoda supplier");
      await user.click(checkbox);

      expect(checkbox).toBeChecked();
    });

    it("should allow selecting multiple suppliers", async () => {
      const user = userEvent.setup();
      render(<SupplierManagementSection {...defaultProps} />);

      const agodaCheckbox = screen.getByLabelText("Agoda supplier");
      const hotelsCheckbox = screen.getByLabelText("Hotels.com supplier");

      await user.click(agodaCheckbox);
      await user.click(hotelsCheckbox);

      expect(agodaCheckbox).toBeChecked();
      expect(hotelsCheckbox).toBeChecked();
    });

    it("should allow deselecting a supplier", async () => {
      const user = userEvent.setup();
      render(<SupplierManagementSection {...defaultProps} />);

      const checkbox = screen.getByLabelText("Agoda supplier");
      await user.click(checkbox);
      expect(checkbox).toBeChecked();

      await user.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("should select all suppliers when clicking Select All", async () => {
      const user = userEvent.setup();
      render(<SupplierManagementSection {...defaultProps} />);

      const selectAllButton = screen.getByRole("button", {
        name: /Select all suppliers/i,
      });
      await user.click(selectAllButton);

      const agodaCheckbox = screen.getByLabelText("Agoda supplier");
      const hotelsCheckbox = screen.getByLabelText("Hotels.com supplier");

      expect(agodaCheckbox).toBeChecked();
      expect(hotelsCheckbox).toBeChecked();
    });

    it("should deselect all suppliers when clicking Deselect All", async () => {
      const user = userEvent.setup();
      render(<SupplierManagementSection {...defaultProps} />);

      // First select all
      const selectAllButton = screen.getByRole("button", {
        name: /Select all suppliers/i,
      });
      await user.click(selectAllButton);

      // Then deselect all
      const deselectAllButton = screen.getByRole("button", {
        name: /Deselect all suppliers/i,
      });
      await user.click(deselectAllButton);

      const agodaCheckbox = screen.getByLabelText("Agoda supplier");
      expect(agodaCheckbox).not.toBeChecked();
    });
  });

  describe("Supplier Activation", () => {
    it("should call activateSuppliers API with selected suppliers", async () => {
      const user = userEvent.setup();
      (UserEditService.activateSuppliers as jest.Mock).mockResolvedValue({
        success: true,
        data: { message: "Suppliers activated successfully" },
      });

      render(<SupplierManagementSection {...defaultProps} />);

      const agodaCheckbox = screen.getByLabelText("Agoda supplier");
      await user.click(agodaCheckbox);

      const activateButton = screen.getByRole("button", {
        name: /Activate 1 selected supplier/i,
      });
      await user.click(activateButton);

      await waitFor(() => {
        expect(UserEditService.activateSuppliers).toHaveBeenCalledWith(
          "user-123",
          ["Agoda"]
        );
      });
    });

    it("should call onSuppliersUpdated after successful activation", async () => {
      const user = userEvent.setup();
      (UserEditService.activateSuppliers as jest.Mock).mockResolvedValue({
        success: true,
        data: { message: "Suppliers activated successfully" },
      });

      render(<SupplierManagementSection {...defaultProps} />);

      const agodaCheckbox = screen.getByLabelText("Agoda supplier");
      await user.click(agodaCheckbox);

      const activateButton = screen.getByRole("button", { name: /Activate/i });
      await user.click(activateButton);

      await waitFor(() => {
        expect(mockOnSuppliersUpdated).toHaveBeenCalled();
      });
    });

    it("should clear selection after successful activation", async () => {
      const user = userEvent.setup();
      (UserEditService.activateSuppliers as jest.Mock).mockResolvedValue({
        success: true,
        data: { message: "Suppliers activated successfully" },
      });

      render(<SupplierManagementSection {...defaultProps} />);

      const agodaCheckbox = screen.getByLabelText("Agoda supplier");
      await user.click(agodaCheckbox);

      const activateButton = screen.getByRole("button", { name: /Activate/i });
      await user.click(activateButton);

      await waitFor(() => {
        expect(agodaCheckbox).not.toBeChecked();
      });
    });

    it("should show validation error when activating without selection", async () => {
      const user = userEvent.setup();
      render(<SupplierManagementSection {...defaultProps} />);

      const activateButton = screen.getByRole("button", { name: /Activate/i });
      await user.click(activateButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Please select at least one supplier to activate/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Supplier Deactivation", () => {
    it("should call deactivateSuppliers API with selected suppliers", async () => {
      const user = userEvent.setup();
      (UserEditService.deactivateSuppliers as jest.Mock).mockResolvedValue({
        success: true,
        data: { message: "Suppliers deactivated successfully" },
      });

      render(<SupplierManagementSection {...defaultProps} />);

      const agodaCheckbox = screen.getByLabelText("Agoda supplier");
      await user.click(agodaCheckbox);

      const deactivateButton = screen.getByRole("button", {
        name: /Deactivate 1 selected supplier/i,
      });
      await user.click(deactivateButton);

      await waitFor(() => {
        expect(UserEditService.deactivateSuppliers).toHaveBeenCalledWith(
          "user-123",
          ["Agoda"]
        );
      });
    });

    it("should call onSuppliersUpdated after successful deactivation", async () => {
      const user = userEvent.setup();
      (UserEditService.deactivateSuppliers as jest.Mock).mockResolvedValue({
        success: true,
        data: { message: "Suppliers deactivated successfully" },
      });

      render(<SupplierManagementSection {...defaultProps} />);

      const agodaCheckbox = screen.getByLabelText("Agoda supplier");
      await user.click(agodaCheckbox);

      const deactivateButton = screen.getByRole("button", {
        name: /Deactivate/i,
      });
      await user.click(deactivateButton);

      await waitFor(() => {
        expect(mockOnSuppliersUpdated).toHaveBeenCalled();
      });
    });

    it("should show validation error when deactivating without selection", async () => {
      const user = userEvent.setup();
      render(<SupplierManagementSection {...defaultProps} />);

      const deactivateButton = screen.getByRole("button", {
        name: /Deactivate/i,
      });
      await user.click(deactivateButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Please select at least one supplier to deactivate/i)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading state during activation", async () => {
      const user = userEvent.setup();
      (UserEditService.activateSuppliers as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<SupplierManagementSection {...defaultProps} />);

      const agodaCheckbox = screen.getByLabelText("Agoda supplier");
      await user.click(agodaCheckbox);

      const activateButton = screen.getByRole("button", { name: /Activate/i });
      await user.click(activateButton);

      expect(screen.getByText(/Activating.../i)).toBeInTheDocument();
    });

    it("should disable buttons during loading", async () => {
      const user = userEvent.setup();
      (UserEditService.activateSuppliers as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<SupplierManagementSection {...defaultProps} />);

      const agodaCheckbox = screen.getByLabelText("Agoda supplier");
      await user.click(agodaCheckbox);

      const activateButton = screen.getByRole("button", { name: /Activate/i });
      await user.click(activateButton);

      expect(activateButton).toBeDisabled();
      expect(
        screen.getByRole("button", { name: /Deactivate/i })
      ).toBeDisabled();
    });
  });

  describe("Error Handling", () => {
    it("should display error message on activation failure", async () => {
      const user = userEvent.setup();
      (UserEditService.activateSuppliers as jest.Mock).mockResolvedValue({
        success: false,
        error: { status: 500, message: "Failed to activate suppliers" },
      });

      render(<SupplierManagementSection {...defaultProps} />);

      const agodaCheckbox = screen.getByLabelText("Agoda supplier");
      await user.click(agodaCheckbox);

      const activateButton = screen.getByRole("button", { name: /Activate/i });
      await user.click(activateButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to activate suppliers/i)
        ).toBeInTheDocument();
      });
    });

    it("should rollback optimistic update on error", async () => {
      const user = userEvent.setup();
      (UserEditService.activateSuppliers as jest.Mock).mockResolvedValue({
        success: false,
        error: { status: 500, message: "Server error" },
      });

      render(<SupplierManagementSection {...defaultProps} />);

      const agodaCheckbox = screen.getByLabelText("Agoda supplier");
      await user.click(agodaCheckbox);

      const activateButton = screen.getByRole("button", { name: /Activate/i });
      await user.click(activateButton);

      await waitFor(() => {
        expect(mockOnOptimisticUpdate).toHaveBeenLastCalledWith(null);
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<SupplierManagementSection {...defaultProps} />);

      expect(
        screen.getByRole("region", { name: /Active suppliers list/i })
      ).toBeInTheDocument();
      expect(screen.getByRole("group")).toBeInTheDocument();
    });

    it("should announce selection count to screen readers", async () => {
      const user = userEvent.setup();
      render(<SupplierManagementSection {...defaultProps} />);

      const agodaCheckbox = screen.getByLabelText("Agoda supplier");
      await user.click(agodaCheckbox);

      // The status should be announced via aria-live region
      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });
});
