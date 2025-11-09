/**
 * Confirmation Dialog Component
 * Reusable confirmation modal for destructive or important actions
 * Displays a warning message and requires explicit user confirmation
 */

"use client";

import React from "react";
import { Modal, ModalBody, ModalFooter } from "./modal";
import { Button } from "./button";
import { AlertTriangle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

const variantConfig = {
  danger: {
    icon: AlertTriangle,
    iconColor: "text-red-600",
    iconBg: "bg-red-100",
    confirmButtonVariant: "danger" as const,
  },
  warning: {
    icon: AlertCircle,
    iconColor: "text-yellow-600",
    iconBg: "bg-yellow-100",
    confirmButtonVariant: "primary" as const,
  },
  info: {
    icon: Info,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
    confirmButtonVariant: "primary" as const,
  },
};

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmationDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = () => {
    onConfirm();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      animation="scale"
      closeOnOverlayClick={!isLoading}
      showCloseButton={!isLoading}
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-message"
      role="alertdialog"
    >
      <ModalBody>
        {/* ARIA live region for loading status */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {isLoading && "Processing your request, please wait"}
        </div>

        <div className="flex flex-col items-center text-center space-y-4 py-4">
          {/* Icon */}
          <div
            className={cn("p-3 rounded-full", config.iconBg)}
            aria-hidden="true"
          >
            <Icon className={cn("h-8 w-8", config.iconColor)} />
          </div>

          {/* Title */}
          <h3
            className="text-lg font-semibold text-gray-900"
            id="confirmation-dialog-title"
          >
            {title}
          </h3>

          {/* Message */}
          <p
            className="text-sm text-gray-600 max-w-sm"
            id="confirmation-dialog-message"
          >
            {message}
          </p>

          {/* Warning text for destructive actions */}
          {variant === "danger" && (
            <p
              className="text-xs text-red-600 font-medium"
              role="alert"
              aria-live="polite"
            >
              This action cannot be undone.
            </p>
          )}
        </div>
      </ModalBody>

      <ModalFooter className="flex justify-center space-x-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={isLoading}
          className="min-w-[100px]"
          aria-label={`${cancelText} and close dialog`}
        >
          {cancelText}
        </Button>
        <Button
          variant={config.confirmButtonVariant}
          onClick={handleConfirm}
          disabled={isLoading}
          loading={isLoading}
          className="min-w-[100px]"
          aria-label={`${confirmText} - ${
            variant === "danger" ? "This action cannot be undone" : ""
          }`}
          aria-busy={isLoading}
        >
          {confirmText}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
