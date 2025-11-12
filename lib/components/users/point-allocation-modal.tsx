"use client";

import React, { useState } from "react";
import { Modal } from "@/lib/components/ui/modal";
import { Button } from "@/lib/components/ui/button";
import { apiClient } from "@/lib/api/client";
import {
  Coins,
  Calendar,
  Zap,
  Gift,
  Crown,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
} from "lucide-react";

interface PointAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    username: string;
    email: string;
  };
  onSuccess?: () => void;
}

type AllocationType =
  | "one_month_package"
  | "one_year_package"
  | "admin_user_package"
  | "per_request_point"
  | "guest_point";

const allocationTypes: {
  value: AllocationType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}[] = [
  {
    value: "one_month_package",
    label: "1 Month Package",
    description: "Monthly subscription points",
    icon: <Calendar className="w-5 h-5" />,
    color: "blue",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    value: "one_year_package",
    label: "1 Year Package",
    description: "Annual subscription points",
    icon: <Crown className="w-5 h-5" />,
    color: "purple",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    value: "admin_user_package",
    label: "Admin Package",
    description: "Administrative user points",
    icon: <Shield className="w-5 h-5" />,
    color: "indigo",
    gradient: "from-indigo-500 to-blue-500",
  },
  {
    value: "per_request_point",
    label: "Per Request Points",
    description: "Individual request allocation",
    icon: <Zap className="w-5 h-5" />,
    color: "amber",
    gradient: "from-amber-500 to-orange-500",
  },
  {
    value: "guest_point",
    label: "Guest Points",
    description: "Trial or guest user points",
    icon: <Gift className="w-5 h-5" />,
    color: "green",
    gradient: "from-green-500 to-emerald-500",
  },
];

export function PointAllocationModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: PointAllocationModalProps) {
  const [selectedType, setSelectedType] = useState<AllocationType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleAllocate = async () => {
    if (!selectedType) {
      setError("Please select an allocation type");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post("/user/points/give", {
        receiver_email: user.email,
        receiver_id: user.id,
        allocation_type: selectedType,
      });

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
          setSuccess(false);
          setSelectedType(null);
        }, 1500);
      } else {
        setError(response.error?.message || "Failed to allocate points");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedType(null);
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Allocate Points"
      size="lg"
    >
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
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
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Points allocated successfully!
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm font-medium text-red-800 dark:text-red-300">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Allocation Types */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Select Allocation Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allocationTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                disabled={loading || success}
                className={`
                  relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                  ${
                    selectedType === type.value
                      ? `border-${type.color}-500 bg-${type.color}-50 dark:bg-${type.color}-900/20 shadow-lg`
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                  }
                  ${
                    loading || success
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:shadow-md"
                  }
                `}
              >
                <div className="flex items-start space-x-3">
                  <div
                    className={`
                    w-10 h-10 rounded-lg flex items-center justify-center
                    bg-gradient-to-br ${type.gradient} text-white shadow-md
                  `}
                  >
                    {type.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                      {type.label}
                    </h4>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {type.description}
                    </p>
                  </div>
                  {selectedType === type.value && (
                    <CheckCircle className={`w-5 h-5 text-${type.color}-600`} />
                  )}
                </div>
              </button>
            ))}
          </div>
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
            onClick={handleAllocate}
            disabled={!selectedType || loading || success}
            leftIcon={
              loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Coins className="w-4 h-4" />
              )
            }
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {loading ? "Allocating..." : "Allocate Points"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
