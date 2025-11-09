/**
 * Unit tests for UserEditModal component
 * Tests rendering, data fetching, error handling, and loading states
 */

import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserEditModal } from "../user-edit-modal";
import { UserEditService } from "@/lib/api/user-edit";
import type { DetailedUserInfo } from "@/lib/api/user-edit";

// Mock dependencies
jest.mock("@/lib/api/user-edit");
jest.mock("@/lib/components/ui/toast", () => ({
  useToast: () => ({
    success: jest.fn(),
    error: jest.fn(),
    warning: jest.fn(),
  }),
}));

const mockUserDetails: DetailedUserInfo = {
  id: "user-123",
  username: "testuser",
  email: "test@example.com",
  role: "general_user",
  api_key: "test-api-key-123",
  points: {
    total_points: 1000,
    current_points: 500,
    total_used_points: 500,
    paid_status: "paid",
    total_rq: 50,
  },
  active_suppliers: ["Expedia", "Booking.com"],
  total_suppliers: 8,
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-15T00:00:00Z",
  user_status: "active",
  is_active: true,
  using_rq_status: "enabled",
  created_by: "admin",
  viewed_by: {
    user_id: "admin-1",
    username: "admin",
    email: "admin@example.com",
    role: "admin_user",
  },
};

describe("UserEditModal", () => {
  const mockOnClose = jest.fn();
  const mockOnUserUpdated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Rendering and Data Fetching", () => {
    it("should render modal when isOpen is true", () => {
      (UserEditService.getUserDetails as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUserDetails,
      });

      render(
        <UserEditModal
          isOpen={true}
          onClose={mockOnClose}
          userId="user-123"
          onUserUpdated={mockOnUserUpdated}
        />
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render modal when isOpen is false", () => {
      render(
        <UserEditModal
          isOpen={false}
          onClose={mockOnClose}
          userId="user-123"
          onUserUpdated={mockOnUserUpdated}
        />
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should fetch user details when modal opens", async () => {
      (UserEditService.getUserDetails as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUserDetails,
      });

      render(
        <UserEditModal
          isOpen={true}
          onClose={mockOnClose}
          userId="user-123"
          onUserUpdated={mockOnUserUpdated}
        />
      );

      await waitFor(() => {
        expect(UserEditService.getUserDetails).toHaveBeenCalledWith("user-123");
      });
    });

    it("should display user information after successful fetch", async () => {
      (UserEditService.getUserDetails as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUserDetails,
      });

      render(
        <UserEditModal
          isOpen={true}
          onClose={mockOnClose}
          userId="user-123"
          onUserUpdated={mockOnUserUpdated}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("testuser")).toBeInTheDocument();
        expect(screen.getByText("test@example.com")).toBeInTheDocument();
        expect(screen.getByText("500")).toBeInTheDocument(); // current points
      });
    });

    it("should display all user information sections", async () => {
      (UserEditService.getUserDetails as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUserDetails,
      });

      render(
        <UserEditModal
          isOpen={true}
          onClose={mockOnClose}
          userId="user-123"
          onUserUpdated={mockOnUserUpdated}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("User Information")).toBeInTheDocument();
        expect(screen.getByText("Points & Usage")).toBeInTheDocument();
        expect(screen.getByText("Supplier Access")).toBeInTheDocument();
        expect(screen.getByText("Point Allocation")).toBeInTheDocument();
        expect(screen.getByText("User Actions")).toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton while fetching data", async () => {
      (UserEditService.getUserDetails as jest.Mock).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      render(
        <UserEditModal
          isOpen={true}
          onClose={mockOnClose}
          userId="user-123"
          onUserUpdated={mockOnUserUpdated}
        />
      );

      // Check for loading indicators
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should display error message when fetch fails", async () => {
      (UserEditService.getUserDetails as jest.Mock).mockResolvedValue({
        success: false,
        error: {
          status: 500,
          message: "Server error occurred",
        },
      });

      render(
        <UserEditModal
          isOpen={true}
          onClose={mockOnClose}
          userId="user-123"
          onUserUpdated={mockOnUserUpdated}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByText(/Failed to Load User Details/i)
        ).toBeInTheDocument();
        expect(screen.getByText(/Server error occurred/i)).toBeInTheDocument();
      });
    });

    it("should display network error with troubleshooting steps", async () => {
      (UserEditService.getUserDetails as jest.Mock).mockResolvedValue({
        success: false,
        error: {
          status: 0,
          message: "Cannot connect to backend API",
        },
      });

      render(
        <UserEditModal
          isOpen={true}
          onClose={mockOnClose}
          userId="user-123"
          onUserUpdated={mockOnUserUpdated}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/Cannot connect/i)).toBeInTheDocument();
        expect(screen.getByText(/Troubleshooting Steps/i)).toBeInTheDocument();
      });
    });

    it("should show retry button on error", async () => {
      (UserEditService.getUserDetails as jest.Mock).mockResolvedValue({
        success: false,
        error: {
          status: 500,
          message: "Server error",
        },
      });

      render(
        <UserEditModal
          isOpen={true}
          onClose={mockOnClose}
          userId="user-123"
          onUserUpdated={mockOnUserUpdated}
        />
      );

      await waitFor(() => {
        expect(
          screen.getByRole("button", { name: /Retry/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe("Modal Interactions", () => {
    it("should call onClose when close button is clicked", async () => {
      (UserEditService.getUserDetails as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUserDetails,
      });

      render(
        <UserEditModal
          isOpen={true}
          onClose={mockOnClose}
          userId="user-123"
          onUserUpdated={mockOnUserUpdated}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("testuser")).toBeInTheDocument();
      });

      const closeButton = screen.getByRole("button", { name: /close/i });
      await userEvent.click(closeButton);

      expect(mockOnClose).toHaveBeenCalled();
    });

    it("should clear state when modal closes", async () => {
      (UserEditService.getUserDetails as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUserDetails,
      });

      const { rerender } = render(
        <UserEditModal
          isOpen={true}
          onClose={mockOnClose}
          userId="user-123"
          onUserUpdated={mockOnUserUpdated}
        />
      );

      await waitFor(() => {
        expect(screen.getByText("testuser")).toBeInTheDocument();
      });

      rerender(
        <UserEditModal
          isOpen={false}
          onClose={mockOnClose}
          userId="user-123"
          onUserUpdated={mockOnUserUpdated}
        />
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", async () => {
      (UserEditService.getUserDetails as jest.Mock).mockResolvedValue({
        success: true,
        data: mockUserDetails,
      });

      render(
        <UserEditModal
          isOpen={true}
          onClose={mockOnClose}
          userId="user-123"
          onUserUpdated={mockOnUserUpdated}
        />
      );

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveAttribute("aria-label", "User edit modal");
      });
    });

    it("should announce errors to screen readers", async () => {
      (UserEditService.getUserDetails as jest.Mock).mockResolvedValue({
        success: false,
        error: {
          status: 500,
          message: "Server error",
        },
      });

      render(
        <UserEditModal
          isOpen={true}
          onClose={mockOnClose}
          userId="user-123"
          onUserUpdated={mockOnUserUpdated}
        />
      );

      await waitFor(() => {
        const errorAlert = screen.getByRole("alert");
        expect(errorAlert).toBeInTheDocument();
      });
    });
  });
});
