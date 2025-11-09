/**
 * Point Allocation Section Component
 * Manages point allocation with package type selection
 * Allows administrators to allocate points to users using predefined package types
 */

"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { Select, SelectOption } from "@/lib/components/ui/select";
import { useToast } from "@/lib/components/ui/toast";
import { UserEditService, AllocationType } from "@/lib/api/user-edit";
import { Coins, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PointAllocationSectionProps {
  userId: string;
  userEmail: string;
  currentPoints: number;
  onAllocationComplete: () => void;
}

/**
 * Allocation type options with user-friendly labels
 */
const ALLOCATION_TYPE_OPTIONS: SelectOption[] = [
  { value: "admin_user_package", label: "Admin User Package" },
  { value: "one_year_package", label: "One Year Package" },
  { value: "one_month_package", label: "One Month Package" },
  { value: "per_request_point", label: "Per Request Point" },
  { value: "guest_point", label: "Guest Point" },
];

export function PointAllocationSection({
  userId,
  userEmail,
  currentPoints,
  onAllocationComplete,
}: PointAllocationSectionProps) {
  // Hooks
  const toast = useToast();

  // State management
  const [selectedAllocationType, setSelectedAllocationType] =
    useState<AllocationType>("admin_user_package");
  const [loading, setLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * Handle allocation type change
   */
  const handleAllocationTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setSelectedAllocationType(e.target.value as AllocationType);
    setValidationError(null);
  };

  /**
   * Handle point allocation submission
   */
  const handleAllocatePoints = async () => {
    // Validation
    if (!selectedAllocationType) {
      setValidationError("Please select an allocation type");
      toast.warning("Validation Error", "Please select an allocation type");
      return;
    }

    setLoading(true);
    setValidationError(null);

    try {
      const response = await UserEditService.allocatePoints(
        userId,
        userEmail,
        selectedAllocationType
      );

      if (response.success) {
        const packageName = selectedAllocationType.replace(/_/g, " ");
        toast.success(
          "Points Allocated",
          `Successfully allocated points using ${packageName}`
        );
        onAllocationComplete();
      } else {
        const errorMsg =
          response.error?.message ||
          "Failed to allocate points. Please try again.";
        toast.error("Allocation Failed", errorMsg);

        // Handle specific error cases
        if (response.error?.status === 403) {
          setValidationError("You don't have permission to allocate points");
        } else if (response.error?.status === 400) {
          setValidationError(errorMsg);
        }
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while allocating points";
      toast.error("Error", errorMsg);
      setValidationError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-green-100">
            <Coins className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Point Allocation
          </h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Points Display */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-blue-700">
              Current Points
            </span>
            <span className="text-2xl font-bold text-blue-600">
              {currentPoints}
            </span>
          </div>
        </div>

        {/* Validation Error */}
        {validationError && (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm font-medium text-red-900 flex-1">
              {validationError}
            </p>
          </div>
        )}

        {/* Allocation Type Selector */}
        <div>
          <Select
            label="Select Package Type"
            options={ALLOCATION_TYPE_OPTIONS}
            value={selectedAllocationType}
            onChange={handleAllocationTypeChange}
            disabled={loading}
            required
            placeholder="Choose an allocation type"
          />
          <p className="mt-1 text-xs text-gray-500">
            Select the package type to allocate points to this user
          </p>
        </div>

        {/* Allocate Button */}
        <Button
          onClick={handleAllocatePoints}
          disabled={loading || !selectedAllocationType}
          className={cn("w-full", loading && "cursor-not-allowed opacity-70")}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Allocating Points...
            </>
          ) : (
            <>
              <Coins className="h-4 w-4 mr-2" />
              Allocate Points
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
