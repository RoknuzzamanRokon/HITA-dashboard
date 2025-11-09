/**
 * Unit tests for ApiKeyDisplay component
 * Tests API key display, masking, and copy functionality
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApiKeyDisplay } from "../api-key-display";

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(),
  },
});

describe("ApiKeyDisplay", () => {
  const mockOnCopy = jest.fn();
  const testApiKey = "test-api-key-1234567890abcdef";

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset clipboard mock
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });
  });

  describe("Rendering", () => {
    it("should render API key display component", () => {
      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      expect(screen.getByText("API Key")).toBeInTheDocument();
    });

    it("should display masked API key by default", () => {
      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      // Should show first 8 and last 4 characters with dots in between
      expect(screen.getByText(/test-api•+cdef/)).toBeInTheDocument();
    });

    it("should render show/hide toggle button", () => {
      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      expect(
        screen.getByRole("button", { name: /Show API key/i })
      ).toBeInTheDocument();
    });

    it("should render copy button", () => {
      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      expect(
        screen.getByRole("button", { name: /Copy API key/i })
      ).toBeInTheDocument();
    });
  });

  describe("Null/Empty API Key State", () => {
    it("should display message when API key is null", () => {
      render(<ApiKeyDisplay apiKey={null} onCopy={mockOnCopy} />);

      expect(screen.getByText("No API key generated yet")).toBeInTheDocument();
    });

    it("should not show toggle or copy buttons when API key is null", () => {
      render(<ApiKeyDisplay apiKey={null} onCopy={mockOnCopy} />);

      expect(
        screen.queryByRole("button", { name: /Show/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Copy/i })
      ).not.toBeInTheDocument();
    });

    it("should have proper ARIA label for no API key state", () => {
      render(<ApiKeyDisplay apiKey={null} onCopy={mockOnCopy} />);

      expect(
        screen.getByRole("status", { name: /No API key available/i })
      ).toBeInTheDocument();
    });
  });

  describe("Masked/Unmasked Toggle", () => {
    it("should show full API key when clicking Show button", async () => {
      const user = userEvent.setup();
      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      const showButton = screen.getByRole("button", { name: /Show API key/i });
      await user.click(showButton);

      expect(screen.getByText(testApiKey)).toBeInTheDocument();
    });

    it("should mask API key when clicking Hide button", async () => {
      const user = userEvent.setup();
      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      // First show the key
      const showButton = screen.getByRole("button", { name: /Show API key/i });
      await user.click(showButton);

      // Then hide it
      const hideButton = screen.getByRole("button", { name: /Hide API key/i });
      await user.click(hideButton);

      expect(screen.getByText(/test-api•+cdef/)).toBeInTheDocument();
    });

    it("should toggle button text between Show and Hide", async () => {
      const user = userEvent.setup();
      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      const showButton = screen.getByRole("button", { name: /Show API key/i });
      expect(showButton).toHaveTextContent("Show");

      await user.click(showButton);

      const hideButton = screen.getByRole("button", { name: /Hide API key/i });
      expect(hideButton).toHaveTextContent("Hide");
    });

    it("should update aria-pressed attribute when toggling", async () => {
      const user = userEvent.setup();
      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      const toggleButton = screen.getByRole("button", {
        name: /Show API key/i,
      });
      expect(toggleButton).toHaveAttribute("aria-pressed", "false");

      await user.click(toggleButton);

      expect(toggleButton).toHaveAttribute("aria-pressed", "true");
    });
  });

  describe("Copy to Clipboard Functionality", () => {
    it("should copy API key to clipboard when clicking copy button", async () => {
      const user = userEvent.setup();
      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      const copyButton = screen.getByRole("button", { name: /Copy API key/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testApiKey);
      });
    });

    it("should call onCopy callback after successful copy", async () => {
      const user = userEvent.setup();
      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      const copyButton = screen.getByRole("button", { name: /Copy API key/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(mockOnCopy).toHaveBeenCalled();
      });
    });

    it("should show success feedback after copying", async () => {
      const user = userEvent.setup();
      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      const copyButton = screen.getByRole("button", { name: /Copy API key/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText("Copied!")).toBeInTheDocument();
        expect(
          screen.getByText("API key copied to clipboard")
        ).toBeInTheDocument();
      });
    });

    it("should disable copy button after successful copy", async () => {
      const user = userEvent.setup();
      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      const copyButton = screen.getByRole("button", { name: /Copy API key/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(copyButton).toBeDisabled();
      });
    });

    it("should reset copy success state after 2 seconds", async () => {
      jest.useFakeTimers();
      const user = userEvent.setup({ delay: null });

      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      const copyButton = screen.getByRole("button", { name: /Copy API key/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(screen.getByText("Copied!")).toBeInTheDocument();
      });

      // Fast-forward time by 2 seconds
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(screen.queryByText("Copied!")).not.toBeInTheDocument();
        expect(copyButton).not.toBeDisabled();
      });

      jest.useRealTimers();
    });

    it("should handle copy failure gracefully", async () => {
      const user = userEvent.setup();
      const consoleError = jest.spyOn(console, "error").mockImplementation();
      (navigator.clipboard.writeText as jest.Mock).mockRejectedValue(
        new Error("Clipboard access denied")
      );

      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      const copyButton = screen.getByRole("button", { name: /Copy API key/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(consoleError).toHaveBeenCalledWith(
          "Failed to copy API key:",
          expect.any(Error)
        );
      });

      consoleError.mockRestore();
    });
  });

  describe("API Key Masking Logic", () => {
    it("should mask short API keys completely", () => {
      const shortKey = "short";
      render(<ApiKeyDisplay apiKey={shortKey} onCopy={mockOnCopy} />);

      expect(screen.getByText("••••••••••••")).toBeInTheDocument();
    });

    it("should show first 8 and last 4 characters for long keys", () => {
      const longKey = "abcdefgh1234567890ijklmnop";
      render(<ApiKeyDisplay apiKey={longKey} onCopy={mockOnCopy} />);

      // Should show: abcdefgh + dots + mnop
      expect(screen.getByText(/abcdefgh•+mnop/)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA labels", () => {
      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      expect(
        screen.getByRole("region", { name: /API key display/i })
      ).toBeInTheDocument();
      expect(screen.getByLabelText("API Key")).toBeInTheDocument();
    });

    it("should announce copy success to screen readers", async () => {
      const user = userEvent.setup();
      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      const copyButton = screen.getByRole("button", { name: /Copy API key/i });
      await user.click(copyButton);

      await waitFor(() => {
        const status = screen.getByRole("status");
        expect(status).toHaveTextContent("API key copied to clipboard");
      });
    });

    it("should announce visibility state to screen readers", async () => {
      const user = userEvent.setup();
      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      // Check initial state
      const hiddenStatus = screen.getByRole("status");
      expect(hiddenStatus).toHaveTextContent("API key is hidden");

      // Toggle visibility
      const showButton = screen.getByRole("button", { name: /Show API key/i });
      await user.click(showButton);

      await waitFor(() => {
        expect(hiddenStatus).toHaveTextContent("API key is visible");
      });
    });

    it("should have aria-live region for status updates", () => {
      render(<ApiKeyDisplay apiKey={testApiKey} onCopy={mockOnCopy} />);

      const liveRegion = screen.getByRole("status");
      expect(liveRegion).toHaveAttribute("aria-live", "polite");
      expect(liveRegion).toHaveAttribute("aria-atomic", "true");
    });
  });

  describe("Component without onCopy callback", () => {
    it("should work without onCopy callback", async () => {
      const user = userEvent.setup();
      render(<ApiKeyDisplay apiKey={testApiKey} />);

      const copyButton = screen.getByRole("button", { name: /Copy API key/i });
      await user.click(copyButton);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(testApiKey);
        expect(screen.getByText("Copied!")).toBeInTheDocument();
      });
    });
  });
});
