"use client";

import React, { useState } from "react";
import { Modal } from "@/lib/components/ui/modal";
import { Button } from "@/lib/components/ui/button";
import { apiClient } from "@/lib/api/client";
import {
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Loader2,
  XCircle,
} from "lucide-react";

interface PointResetModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    username: string;
    email: string;
    pointBalance?: number;
  };
  onSuccess?: () => void;
}

export function PointResetModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: PointResetModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const handleReset = async () => {
    if (confirmText.toLowerCase() !== "reset") {
      setError('Please type "RESET" to confirm');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(`/user/reset_point/${user.id}`, {});

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
          setSuccess(false);
          setConfirmText("");
        }, 1500);
      } else {
        setError(response.error?.message || "Failed to reset points");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setConfirmText("");
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Reset User Points"
      size="md"
    >
      <div className="space-y-6">
        {/* Warning Banner */}
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                Warning: Irreversible Action
              </h4>
              <p className="text-sm text-red-800 dark:text-red-300">
                This will permanently reset all points for this user. This
                action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* User Info */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-800 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
                {user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {user.username}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {user.email}
                </p>
              </div>
            </div>
            {user.pointBalance !== undefined && (
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Current Points
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {user.pointBalance.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-gray-700 dark:text-green-400" />
              <p className="text-sm font-medium text-gray-900 dark:text-green-300">
                Points reset successfully!
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Confirmation Input */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Type <span className="text-red-600 font-mono">RESET</span> to
            confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={(e) => {
              setConfirmText(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Type RESET here"
            disabled={loading || success}
            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            This confirmation is required to prevent accidental point resets.
          </p>
        </div>

        {/* What Will Happen */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center">
            <RotateCcw className="w-4 h-4 mr-2" />
            What will happen:
          </h4>
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>All current points will be set to zero</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>Point history will be preserved for audit purposes</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>User will need new point allocation to continue</span>
            </li>
            <li className="flex items-start">
              <span className="text-red-500 mr-2">•</span>
              <span>This action cannot be reversed</span>
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading || success}
          >
            Cancel
          </Button>
          <Button
            onClick={handleReset}
            disabled={
              confirmText.toLowerCase() !== "reset" || loading || success
            }
            leftIcon={
              loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RotateCcw className="w-4 h-4" />
              )
            }
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
          >
            {loading ? "Resetting..." : "Reset Points"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
