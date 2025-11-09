/**
 * Unit tests for UserActionsSection component
 * Tests all user action buttons and confirmation dialogs
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserActionsSection } from "../user-actions-section";
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

describe("UserActionsSection", () => {
  const mockOnActionComplete = jest.fn();
  const mockOnOptimisticUpdate = jest.fn();

  const defaultProps = {
    userId: "user-123",
    isActive: true,
    currentPoints: 500,
    onActionComplete: mockOnActionComplete,
    onOptimisticUpdate: mockOnOptimisticUpdate,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render user actions section", () => {
      render(<UserActionsSection {...defaultProps} />);

      expect(screen.getByText("User Actions")).toBeInTheDocument();
    });

    it("should render all action buttons", () => {
      render(<UserActionsSection {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /Deactivate user account/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Generate new API key/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Reset user points/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Delete user account/i })
      ).toBeInTheDocument();
    });

    it("should show Activate button when user is inactive", () => {
      render(<UserActionsSection {...defaultProps} isActive={false} />);

      expect(
        screen.getByRole("button", { name: /Activate user account/i })
      ).toBeInTheDocument();
    });

    it("should show Deactivate button when user is active", () => {
      render(<UserActionsSection {...defaultProps} isActive={true} />);

      expect(
        screen.getByRole("button", { name: /Deactivate user account/i })
      ).toBeInTheDocument();
    });
  });

  describe("Activate/Deactivate User", () => {
    it("should call activateUser API when toggling status", async () => {
      const user = userEvent.setup();
      (UserEditService.activateUser as jest.Mock).mockResolvedValue({
        success: true,
        data: { message: "User activated successfully" },
      });

      render(<UserActionsSection {...defaultProps} />);

      const toggleButton = screen.getByRole("button", {
        name: /Deactivate user account/i,
      });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(UserEditService.activateUser).toHaveBeenCalledWith("user-123");
      });
    });

    it("should call onActionComplete after successful status toggle", async () => {
      const user = userEvent.setup();
      (UserEditService.activateUser as jest.Mock).mockResolvedValue({
        success: true,
        data: { message: "User activated successfully" },
      });

      render(<UserActionsSection {...defaultProps} />);

      const toggleButton = screen.getByRole("button", {
        name: /Deactivate user account/i,
      });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(mockOnActionComplete).toHaveBeenCalledWith(
          "toggle-status",
          true,
          expect.any(String)
        );
      });
    });

    it("should apply optimistic update when toggling status", async () => {
      const user = userEvent.setup();
      (UserEditService.activateUser as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<UserActionsSection {...defaultProps} />);

      const toggleButton = screen.getByRole("button", {
        name: /Deactivate user account/i,
      });
      await user.click(toggleButton);

      expect(mockOnOptimisticUpdate).toHaveBeenCalledWith({ is_active: false });
    });
  });

  describe("Reset Points", () => {
    it("should show confirmation dialog when clicking reset points", async () => {
      const user = userEvent.setup();
      render(<UserActionsSection {...defaultProps} />);

      const resetButton = screen.getByRole("button", {
        name: /Reset user points/i,
      });
      await user.click(resetButton);

      await waitFor(() => {
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
        expect(screen.getByText(/Reset User Points/i)).toBeInTheDocument();
      });
    });

    it("should call resetUserPoints API after confirmation", async () => {
      const user = userEvent.setup();
      (UserEditService.resetUserPoints as jest.Mock).mockResolvedValue({
        success: true,
        data: { message: "Points reset successfully" },
      });

      render(<UserActionsSection {...defaultProps} />);

      const resetButton = screen.getByRole("button", {
        name: /Reset user points/i,
      });
      await user.click(resetButton);

      await waitFor(() => {
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", {
        name: /Reset Points/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(UserEditService.resetUserPoints).toHaveBeenCalledWith(
          "user-123"
        );
      });
    });

    it("should not call API when canceling confirmation", async () => {
      const user = userEvent.setup();
      render(<UserActionsSection {...defaultProps} />);

      const resetButton = screen.getByRole("button", {
        name: /Reset user points/i,
      });
      await user.click(resetButton);

      await waitFor(() => {
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      await user.click(cancelButton);

      expect(UserEditService.resetUserPoints).not.toHaveBeenCalled();
    });

    it("should apply optimistic update when resetting points", async () => {
      const user = userEvent.setup();
      (UserEditService.resetUserPoints as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<UserActionsSection {...defaultProps} />);

      const resetButton = screen.getByRole("button", {
        name: /Reset user points/i,
      });
      await user.click(resetButton);

      await waitFor(() => {
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", {
        name: /Reset Points/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockOnOptimisticUpdate).toHaveBeenCalledWith({
          points: {
            current_points: 0,
            total_points: 0,
            total_used_points: 0,
          },
        });
      });
    });
  });

  describe("Delete User", () => {
    it("should show confirmation dialog when clicking delete user", async () => {
      const user = userEvent.setup();
      render(<UserActionsSection {...defaultProps} />);

      const deleteButton = screen.getByRole("button", {
        name: /Delete user account/i,
      });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
        expect(screen.getByText(/Delete User/i)).toBeInTheDocument();
        expect(
          screen.getByText(/This action cannot be undone/i)
        ).toBeInTheDocument();
      });
    });

    it("should call deleteUser API after confirmation", async () => {
      const user = userEvent.setup();
      (UserEditService.deleteUser as jest.Mock).mockResolvedValue({
        success: true,
        data: { message: "User deleted successfully" },
      });

      render(<UserActionsSection {...defaultProps} />);

      const deleteButton = screen.getByRole("button", {
        name: /Delete user account/i,
      });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole("button", {
        name: /Delete User/i,
      });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(UserEditService.deleteUser).toHaveBeenCalledWith("user-123");
      });
    });

    it("should not call API when canceling deletion", async () => {
      const user = userEvent.setup();
      render(<UserActionsSection {...defaultProps} />);

      const deleteButton = screen.getByRole("button", {
        name: /Delete user account/i,
      });
      await user.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      await user.click(cancelButton);

      expect(UserEditService.deleteUser).not.toHaveBeenCalled();
    });
  });

  describe("Generate API Key", () => {
    it("should call generateApiKey API when clicking button", async () => {
      const user = userEvent.setup();
      (UserEditService.generateApiKey as jest.Mock).mockResolvedValue({
        success: true,
        data: { api_key: "new-api-key-123" },
      });

      render(<UserActionsSection {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: /Generate new API key/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(UserEditService.generateApiKey).toHaveBeenCalledWith("user-123");
      });
    });

    it("should call onActionComplete after successful generation", async () => {
      const user = userEvent.setup();
      (UserEditService.generateApiKey as jest.Mock).mockResolvedValue({
        success: true,
        data: { api_key: "new-api-key-123" },
      });

      render(<UserActionsSection {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: /Generate new API key/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(mockOnActionComplete).toHaveBeenCalledWith(
          "generate-api-key",
          true,
          expect.any(String)
        );
      });
    });
  });

  describe("Loading States", () => {
    it("should disable all buttons when an action is in progress", async () => {
      const user = userEvent.setup();
      (UserEditService.generateApiKey as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<UserActionsSection {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: /Generate new API key/i,
      });
      await user.click(generateButton);

      const toggleButton = screen.getByRole("button", {
        name: /Deactivate user account/i,
      });
      const resetButton = screen.getByRole("button", {
        name: /Reset user points/i,
      });
      const deleteButton = screen.getByRole("button", {
        name: /Delete user account/i,
      });

      expect(toggleButton).toBeDisabled();
      expect(resetButton).toBeDisabled();
      expect(deleteButton).toBeDisabled();
    });

    it("should show loading indicator on active button", async () => {
      const user = userEvent.setup();
      (UserEditService.generateApiKey as jest.Mock).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ success: true }), 100)
          )
      );

      render(<UserActionsSection {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: /Generate new API key/i,
      });
      await user.click(generateButton);

      expect(generateButton).toHaveAttribute("aria-busy", "true");
    });
  });

  describe("Error Handling", () => {
    it("should display error message on action failure", async () => {
      const user = userEvent.setup();
      (UserEditService.generateApiKey as jest.Mock).mockResolvedValue({
        success: false,
        error: { status: 500, message: "Failed to generate API key" },
      });

      render(<UserActionsSection {...defaultProps} />);

      const generateButton = screen.getByRole("button", {
        name: /Generate new API key/i,
      });
      await user.click(generateButton);

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to generate API key/i)
        ).toBeInTheDocument();
      });
    });

    it("should display permission error", async () => {
      const user = userEvent.setup();
      (UserEditService.activateUser as jest.Mock).mockResolvedValue({
        success: false,
        error: { status: 403, message: "Permission denied" },
      });

      render(<UserActionsSection {...defaultProps} />);

      const toggleButton = screen.getByRole("button", {
        name: /Deactivate user account/i,
      });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(screen.getByText(/don't have permission/i)).toBeInTheDocument();
      });
    });

    it("should rollback optimistic update on error", async () => {
      const user = userEvent.setup();
      (UserEditService.activateUser as jest.Mock).mockResolvedValue({
        success: false,
        error: { status: 500, message: "Server error" },
      });

      render(<UserActionsSection {...defaultProps} />);

      const toggleButton = screen.getByRole("button", {
        name: /Deactivate user account/i,
      });
      await user.click(toggleButton);

      await waitFor(() => {
        expect(mockOnOptimisticUpdate).toHaveBeenLastCalledWith(null);
      });
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels on all buttons", () => {
      render(<UserActionsSection {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /Deactivate user account/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Generate new API key/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Reset user points to zero/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Delete user account permanently/i })
      ).toBeInTheDocument();
    });

    it("should announce action status to screen readers", () => {
      render(<UserActionsSection {...defaultProps} />);

      expect(screen.getByRole("status")).toBeInTheDocument();
    });
  });
});
