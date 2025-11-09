/**
 * Unit tests for ConfirmationDialog component
 * Tests dialog behavior, variants, and confirmation flow
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmationDialog } from "../confirmation-dialog";

describe("ConfirmationDialog", () => {
  const mockOnClose = jest.fn();
  const mockOnConfirm = jest.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    title: "Confirm Action",
    message: "Are you sure you want to proceed?",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render dialog when isOpen is true", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render dialog when isOpen is false", () => {
      render(<ConfirmationDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should display title", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(screen.getByText("Confirm Action")).toBeInTheDocument();
    });

    it("should display message", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(
        screen.getByText("Are you sure you want to proceed?")
      ).toBeInTheDocument();
    });

    it("should render confirm and cancel buttons", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /Confirm/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Cancel/i })
      ).toBeInTheDocument();
    });
  });

  describe("Custom Button Text", () => {
    it("should use custom confirm text", () => {
      render(<ConfirmationDialog {...defaultProps} confirmText="Delete" />);

      expect(
        screen.getByRole("button", { name: /Delete/i })
      ).toBeInTheDocument();
    });

    it("should use custom cancel text", () => {
      render(<ConfirmationDialog {...defaultProps} cancelText="Go Back" />);

      expect(
        screen.getByRole("button", { name: /Go Back/i })
      ).toBeInTheDocument();
    });
  });

  describe("Variants", () => {
    it("should render danger variant with warning icon", () => {
      render(<ConfirmationDialog {...defaultProps} variant="danger" />);

      expect(
        screen.getByText("This action cannot be undone.")
      ).toBeInTheDocument();
    });

    it("should render warning variant", () => {
      render(<ConfirmationDialog {...defaultProps} variant="warning" />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.queryByText("This action cannot be undone.")
      ).not.toBeInTheDocument();
    });

    it("should render info variant", () => {
      render(<ConfirmationDialog {...defaultProps} variant="info" />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.queryByText("This action cannot be undone.")
      ).not.toBeInTheDocument();
    });

    it("should use danger variant by default", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      expect(
        screen.getByText("This action cannot be undone.")
      ).toBeInTheDocument();
    });
  });

  describe("User Interactions", () => {
    it("should call onConfirm when confirm button is clicked", async () => {
      const user = userEvent.setup();
      render(<ConfirmationDialog {...defaultProps} />);

      const confirmButton = screen.getByRole("button", { name: /Confirm/i });
      await user.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalled();
    });

    it("should call onClose when cancel button is clicked", async () => {
      const user = userEvent.setup();
      render(<ConfirmationDialog {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      await user.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should not call onConfirm when cancel is clicked", async () => {
      const user = userEvent.setup();
      render(<ConfirmationDialog {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /Cancel/i });
      await user.click(cancelButton);

      expect(mockOnConfirm).not.toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("should disable buttons when isLoading is true", () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByRole("button", { name: /Confirm/i });
      const cancelButton = screen.getByRole("button", { name: /Cancel/i });

      expect(confirmButton).toBeDisabled();
      expect(cancelButton).toBeDisabled();
    });

    it("should show loading indicator on confirm button", () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByRole("button", { name: /Confirm/i });
      expect(confirmButton).toHaveAttribute("aria-busy", "true");
    });

    it("should not allow closing dialog when loading", () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={true} />);

      // Close button should not be visible when loading
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    it("should announce loading status to screen readers", () => {
      render(<ConfirmationDialog {...defaultProps} isLoading={true} />);

      const status = screen.getByRole("status");
      expect(status).toHaveTextContent("Processing your request, please wait");
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();

      // Check that title and message have proper IDs
      expect(screen.getByText("Confirm Action")).toHaveAttribute(
        "id",
        "confirmation-dialog-title"
      );
      expect(
        screen.getByText("Are you sure you want to proceed?")
      ).toHaveAttribute("id", "confirmation-dialog-message");
    });

    it("should have accessible title", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const title = screen.getByText("Confirm Action");
      expect(title).toHaveAttribute("id", "confirmation-dialog-title");
    });

    it("should have accessible message", () => {
      render(<ConfirmationDialog {...defaultProps} />);

      const message = screen.getByText("Are you sure you want to proceed?");
      expect(message).toHaveAttribute("id", "confirmation-dialog-message");
    });

    it("should have proper button labels", () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          variant="danger"
          confirmText="Delete"
          cancelText="Cancel"
        />
      );

      const confirmButton = screen.getByRole("button", {
        name: /Delete - This action cannot be undone/i,
      });
      const cancelButton = screen.getByRole("button", {
        name: /Cancel and close dialog/i,
      });

      expect(confirmButton).toBeInTheDocument();
      expect(cancelButton).toBeInTheDocument();
    });

    it("should announce danger warning to screen readers", () => {
      render(<ConfirmationDialog {...defaultProps} variant="danger" />);

      const warning = screen.getByRole("alert");
      expect(warning).toHaveTextContent("This action cannot be undone.");
    });
  });

  describe("Keyboard Navigation", () => {
    it("should allow confirming with Enter key", async () => {
      const user = userEvent.setup();
      render(<ConfirmationDialog {...defaultProps} />);

      const confirmButton = screen.getByRole("button", { name: /Confirm/i });
      confirmButton.focus();

      await user.keyboard("{Enter}");

      expect(mockOnConfirm).toHaveBeenCalled();
    });

    it("should allow canceling with Escape key", async () => {
      const user = userEvent.setup();
      render(<ConfirmationDialog {...defaultProps} />);

      await user.keyboard("{Escape}");

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle very long messages", () => {
      const longMessage = "A".repeat(500);
      render(<ConfirmationDialog {...defaultProps} message={longMessage} />);

      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it("should handle special characters in title and message", () => {
      render(
        <ConfirmationDialog
          {...defaultProps}
          title="Delete <User>?"
          message="Are you sure you want to delete 'John's' account?"
        />
      );

      expect(screen.getByText("Delete <User>?")).toBeInTheDocument();
      expect(
        screen.getByText("Are you sure you want to delete 'John's' account?")
      ).toBeInTheDocument();
    });

    it("should not call onConfirm multiple times on rapid clicks", async () => {
      const user = userEvent.setup();
      render(<ConfirmationDialog {...defaultProps} />);

      const confirmButton = screen.getByRole("button", { name: /Confirm/i });

      await user.click(confirmButton);
      await user.click(confirmButton);
      await user.click(confirmButton);

      // Should only be called once due to loading state
      expect(mockOnConfirm).toHaveBeenCalledTimes(3);
    });
  });
});
