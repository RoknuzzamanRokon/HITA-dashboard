import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toast } from "../toast";
import { Notification } from "@/lib/types/exports";

describe("Toast", () => {
  const mockOnDismiss = jest.fn();

  const baseNotification: Notification = {
    id: "notif_1",
    type: "success",
    title: "Success",
    message: "Operation completed successfully",
    autoDismiss: true,
    duration: 5000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Rendering", () => {
    it("should render notification with title and message", () => {
      render(
        <Toast notification={baseNotification} onDismiss={mockOnDismiss} />
      );

      expect(screen.getByText("Success")).toBeInTheDocument();
      expect(
        screen.getByText("Operation completed successfully")
      ).toBeInTheDocument();
    });

    it("should render success notification with correct styling", () => {
      render(
        <Toast notification={baseNotification} onDismiss={mockOnDismiss} />
      );

      const toast = screen.getByRole("alert");
      expect(toast).toHaveClass("bg-green-50");
    });

    it("should render error notification with correct styling", () => {
      const errorNotification: Notification = {
        ...baseNotification,
        type: "error",
        title: "Error",
        message: "Something went wrong",
      };

      render(
        <Toast notification={errorNotification} onDismiss={mockOnDismiss} />
      );

      const toast = screen.getByRole("alert");
      expect(toast).toHaveClass("bg-red-50");
    });

    it("should render warning notification with correct styling", () => {
      const warningNotification: Notification = {
        ...baseNotification,
        type: "warning",
        title: "Warning",
        message: "Please be careful",
      };

      render(
        <Toast notification={warningNotification} onDismiss={mockOnDismiss} />
      );

      const toast = screen.getByRole("alert");
      expect(toast).toHaveClass("bg-yellow-50");
    });

    it("should render info notification with correct styling", () => {
      const infoNotification: Notification = {
        ...baseNotification,
        type: "info",
        title: "Info",
        message: "Here is some information",
      };

      render(
        <Toast notification={infoNotification} onDismiss={mockOnDismiss} />
      );

      const toast = screen.getByRole("alert");
      expect(toast).toHaveClass("bg-blue-50");
    });

    it("should render appropriate icon for each notification type", () => {
      const { rerender } = render(
        <Toast notification={baseNotification} onDismiss={mockOnDismiss} />
      );

      // Success icon (checkmark)
      expect(
        screen.getByRole("alert").querySelector("svg")
      ).toBeInTheDocument();

      // Error icon (X)
      const errorNotification: Notification = {
        ...baseNotification,
        type: "error",
      };
      rerender(
        <Toast notification={errorNotification} onDismiss={mockOnDismiss} />
      );
      expect(
        screen.getByRole("alert").querySelector("svg")
      ).toBeInTheDocument();

      // Warning icon
      const warningNotification: Notification = {
        ...baseNotification,
        type: "warning",
      };
      rerender(
        <Toast notification={warningNotification} onDismiss={mockOnDismiss} />
      );
      expect(
        screen.getByRole("alert").querySelector("svg")
      ).toBeInTheDocument();

      // Info icon
      const infoNotification: Notification = {
        ...baseNotification,
        type: "info",
      };
      rerender(
        <Toast notification={infoNotification} onDismiss={mockOnDismiss} />
      );
      expect(
        screen.getByRole("alert").querySelector("svg")
      ).toBeInTheDocument();
    });
  });

  describe("Action Button", () => {
    it("should render action button when action is provided", () => {
      const mockAction = jest.fn();
      const notificationWithAction: Notification = {
        ...baseNotification,
        action: {
          label: "Download",
          onClick: mockAction,
        },
      };

      render(
        <Toast
          notification={notificationWithAction}
          onDismiss={mockOnDismiss}
        />
      );

      expect(
        screen.getByRole("button", { name: "Download" })
      ).toBeInTheDocument();
    });

    it("should not render action button when action is not provided", () => {
      render(
        <Toast notification={baseNotification} onDismiss={mockOnDismiss} />
      );

      expect(
        screen.queryByRole("button", { name: /download/i })
      ).not.toBeInTheDocument();
    });

    it("should call action onClick and dismiss when action button is clicked", async () => {
      const user = userEvent.setup({ delay: null });
      const mockAction = jest.fn();
      const notificationWithAction: Notification = {
        ...baseNotification,
        action: {
          label: "Download",
          onClick: mockAction,
        },
      };

      render(
        <Toast
          notification={notificationWithAction}
          onDismiss={mockOnDismiss}
        />
      );

      const actionButton = screen.getByRole("button", { name: "Download" });
      await user.click(actionButton);

      expect(mockAction).toHaveBeenCalledTimes(1);

      // Wait for dismiss animation
      jest.advanceTimersByTime(300);
      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe("Dismiss Functionality", () => {
    it("should call onDismiss when dismiss button is clicked", async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <Toast notification={baseNotification} onDismiss={mockOnDismiss} />
      );

      const dismissButton = screen.getByRole("button", {
        name: /dismiss notification/i,
      });
      await user.click(dismissButton);

      // Wait for dismiss animation
      jest.advanceTimersByTime(300);
      await waitFor(() => {
        expect(mockOnDismiss).toHaveBeenCalledTimes(1);
      });
    });

    it("should show exit animation when dismissing", async () => {
      const user = userEvent.setup({ delay: null });
      render(
        <Toast notification={baseNotification} onDismiss={mockOnDismiss} />
      );

      const toast = screen.getByRole("alert");
      expect(toast).toHaveClass("animate-slide-in-right");

      const dismissButton = screen.getByRole("button", {
        name: /dismiss notification/i,
      });
      await user.click(dismissButton);

      // After clicking dismiss, should have exit animation class
      await waitFor(() => {
        expect(toast).toHaveClass("animate-slide-out-right");
      });
    });
  });

  describe("ARIA Attributes", () => {
    it("should have assertive aria-live for error notifications", () => {
      const errorNotification: Notification = {
        ...baseNotification,
        type: "error",
      };

      render(
        <Toast notification={errorNotification} onDismiss={mockOnDismiss} />
      );

      const toast = screen.getByRole("alert");
      expect(toast).toHaveAttribute("aria-live", "assertive");
    });

    it("should have polite aria-live for non-error notifications", () => {
      render(
        <Toast notification={baseNotification} onDismiss={mockOnDismiss} />
      );

      const toast = screen.getByRole("alert");
      expect(toast).toHaveAttribute("aria-live", "polite");
    });

    it("should have proper aria-label for action button", () => {
      const notificationWithAction: Notification = {
        ...baseNotification,
        action: {
          label: "Download File",
          onClick: jest.fn(),
        },
      };

      render(
        <Toast
          notification={notificationWithAction}
          onDismiss={mockOnDismiss}
        />
      );

      const actionButton = screen.getByRole("button", {
        name: "Download File",
      });
      expect(actionButton).toHaveAttribute("aria-label", "Download File");
    });

    it("should have proper aria-label for dismiss button", () => {
      render(
        <Toast notification={baseNotification} onDismiss={mockOnDismiss} />
      );

      const dismissButton = screen.getByRole("button", {
        name: "Dismiss notification",
      });
      expect(dismissButton).toHaveAttribute(
        "aria-label",
        "Dismiss notification"
      );
    });
  });

  describe("Color Contrast Compliance", () => {
    it("should use WCAG AA compliant colors for success notifications", () => {
      render(
        <Toast notification={baseNotification} onDismiss={mockOnDismiss} />
      );

      const toast = screen.getByRole("alert");
      // Light mode: green-50 bg with green-800 text
      expect(toast).toHaveClass("text-green-800");
      expect(toast).toHaveClass("bg-green-50");
    });

    it("should use WCAG AA compliant colors for error notifications", () => {
      const errorNotification: Notification = {
        ...baseNotification,
        type: "error",
      };

      render(
        <Toast notification={errorNotification} onDismiss={mockOnDismiss} />
      );

      const toast = screen.getByRole("alert");
      // Light mode: red-50 bg with red-800 text
      expect(toast).toHaveClass("text-red-800");
      expect(toast).toHaveClass("bg-red-50");
    });

    it("should use WCAG AA compliant colors for warning notifications", () => {
      const warningNotification: Notification = {
        ...baseNotification,
        type: "warning",
      };

      render(
        <Toast notification={warningNotification} onDismiss={mockOnDismiss} />
      );

      const toast = screen.getByRole("alert");
      // Light mode: yellow-50 bg with yellow-900 text
      expect(toast).toHaveClass("text-yellow-900");
      expect(toast).toHaveClass("bg-yellow-50");
    });

    it("should use WCAG AA compliant colors for info notifications", () => {
      const infoNotification: Notification = {
        ...baseNotification,
        type: "info",
      };

      render(
        <Toast notification={infoNotification} onDismiss={mockOnDismiss} />
      );

      const toast = screen.getByRole("alert");
      // Light mode: blue-50 bg with blue-800 text
      expect(toast).toHaveClass("text-blue-800");
      expect(toast).toHaveClass("bg-blue-50");
    });
  });

  describe("Responsive Design", () => {
    it("should have minimum width for readability", () => {
      render(
        <Toast notification={baseNotification} onDismiss={mockOnDismiss} />
      );

      const toast = screen.getByRole("alert");
      expect(toast).toHaveClass("min-w-[320px]");
    });

    it("should have maximum width to prevent overflow", () => {
      render(
        <Toast notification={baseNotification} onDismiss={mockOnDismiss} />
      );

      const toast = screen.getByRole("alert");
      expect(toast).toHaveClass("max-w-[420px]");
    });
  });

  describe("Animation", () => {
    it("should have slide-in animation on mount", () => {
      render(
        <Toast notification={baseNotification} onDismiss={mockOnDismiss} />
      );

      const toast = screen.getByRole("alert");
      expect(toast).toHaveClass("animate-slide-in-right");
    });

    it("should include animation styles", () => {
      render(
        <Toast notification={baseNotification} onDismiss={mockOnDismiss} />
      );

      // Check that style tag with animations is present
      const styleTag = document.querySelector("style");
      expect(styleTag).toBeInTheDocument();
      expect(styleTag?.textContent).toContain("slideInRight");
      expect(styleTag?.textContent).toContain("slideOutRight");
    });
  });

  describe("Long Messages", () => {
    it("should handle long messages without breaking layout", () => {
      const longMessageNotification: Notification = {
        ...baseNotification,
        message:
          "This is a very long message that should wrap properly and not break the layout of the toast notification component. It should remain readable and accessible.",
      };

      render(
        <Toast
          notification={longMessageNotification}
          onDismiss={mockOnDismiss}
        />
      );

      const message = screen.getByText(/this is a very long message/i);
      expect(message).toBeInTheDocument();
    });

    it("should handle long titles without breaking layout", () => {
      const longTitleNotification: Notification = {
        ...baseNotification,
        title: "This is a Very Long Title That Should Still Display Properly",
      };

      render(
        <Toast notification={longTitleNotification} onDismiss={mockOnDismiss} />
      );

      const title = screen.getByText(/this is a very long title/i);
      expect(title).toBeInTheDocument();
    });
  });
});
