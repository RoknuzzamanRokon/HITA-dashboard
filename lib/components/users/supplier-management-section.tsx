/**
 * Supplier Management Section Component
 * Manages supplier activation and deactivation for users
 * Allows administrators to activate or deactivate supplier access
 */

"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";
import { Button } from "@/lib/components/ui/button";
import { useToast } from "@/lib/components/ui/toast";
import { UserEditService } from "@/lib/api/user-edit";
import { Building2, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SupplierManagementSectionProps {
  userId: string;
  activeSuppliers: string[];
  totalSuppliers: number;
  onSuppliersUpdated: () => void;
}

/**
 * Available suppliers list
 * This can be fetched from an API or configuration in the future
 */
const AVAILABLE_SUPPLIERS = [
  "Expedia",
  "Booking.com",
  "Agoda",
  "Hotels.com",
  "Airbnb",
  "TripAdvisor",
  "Priceline",
  "Kayak",
];

export function SupplierManagementSection({
  userId,
  activeSuppliers,
  totalSuppliers,
  onSuppliersUpdated,
}: SupplierManagementSectionProps) {
  // Hooks
  const toast = useToast();

  // State management
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionType, setActionType] = useState<
    "activate" | "deactivate" | null
  >(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  /**
   * Handle supplier selection toggle
   */
  const handleSupplierToggle = (supplier: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplier)
        ? prev.filter((s) => s !== supplier)
        : [...prev, supplier]
    );
    setValidationError(null);
  };

  /**
   * Handle select all suppliers
   */
  const handleSelectAll = () => {
    if (selectedSuppliers.length === AVAILABLE_SUPPLIERS.length) {
      setSelectedSuppliers([]);
    } else {
      setSelectedSuppliers([...AVAILABLE_SUPPLIERS]);
    }
  };

  /**
   * Handle activate suppliers
   */
  const handleActivateSuppliers = async () => {
    // Validation
    if (selectedSuppliers.length === 0) {
      const errorMsg = "Please select at least one supplier to activate";
      setValidationError(errorMsg);
      toast.warning("Validation Error", errorMsg);
      return;
    }

    setLoading(true);
    setActionType("activate");
    setValidationError(null);

    try {
      const response = await UserEditService.activateSuppliers(
        userId,
        selectedSuppliers
      );

      if (response.success) {
        const count = selectedSuppliers.length;
        toast.success(
          "Suppliers Activated",
          `Successfully activated ${count} supplier${count > 1 ? "s" : ""}`
        );
        setSelectedSuppliers([]);
        onSuppliersUpdated();
      } else {
        const errorMsg =
          response.error?.message ||
          "Failed to activate suppliers. Please try again.";
        toast.error("Activation Failed", errorMsg);

        if (response.error?.status === 403) {
          setValidationError("You don't have permission to activate suppliers");
        }
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while activating suppliers";
      toast.error("Error", errorMsg);
      setValidationError(errorMsg);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  /**
   * Handle deactivate suppliers
   */
  const handleDeactivateSuppliers = async () => {
    // Validation
    if (selectedSuppliers.length === 0) {
      const errorMsg = "Please select at least one supplier to deactivate";
      setValidationError(errorMsg);
      toast.warning("Validation Error", errorMsg);
      return;
    }

    setLoading(true);
    setActionType("deactivate");
    setValidationError(null);

    try {
      const response = await UserEditService.deactivateSuppliers(
        userId,
        selectedSuppliers
      );

      if (response.success) {
        const count = selectedSuppliers.length;
        toast.success(
          "Suppliers Deactivated",
          `Successfully deactivated ${count} supplier${count > 1 ? "s" : ""}`
        );
        setSelectedSuppliers([]);
        onSuppliersUpdated();
      } else {
        const errorMsg =
          response.error?.message ||
          "Failed to deactivate suppliers. Please try again.";
        toast.error("Deactivation Failed", errorMsg);

        if (response.error?.status === 403) {
          setValidationError(
            "You don't have permission to deactivate suppliers"
          );
        }
      }
    } catch (err) {
      const errorMsg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred while deactivating suppliers";
      toast.error("Error", errorMsg);
      setValidationError(errorMsg);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-purple-100">
            <Building2 className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Supplier Management
          </h3>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Suppliers Display */}
        <div className="p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-purple-700">
              Active Suppliers
            </span>
            <span className="text-lg font-bold text-purple-600">
              {activeSuppliers.length} / {totalSuppliers}
            </span>
          </div>
          {activeSuppliers.length > 0 ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {activeSuppliers.map((supplier) => (
                <span
                  key={supplier}
                  className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-md"
                >
                  {supplier}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-purple-600 mt-1">No active suppliers</p>
          )}
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

        {/* Supplier Selection */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium text-gray-700">
              Select Suppliers
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={loading}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
            >
              {selectedSuppliers.length === AVAILABLE_SUPPLIERS.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200">
            {AVAILABLE_SUPPLIERS.map((supplier) => (
              <label
                key={supplier}
                className={cn(
                  "flex items-center space-x-2 p-2 rounded-lg cursor-pointer transition-colors",
                  selectedSuppliers.includes(supplier)
                    ? "bg-purple-100 border border-purple-300"
                    : "bg-white border border-gray-200 hover:bg-gray-50",
                  loading && "cursor-not-allowed opacity-60"
                )}
              >
                <input
                  type="checkbox"
                  checked={selectedSuppliers.includes(supplier)}
                  onChange={() => handleSupplierToggle(supplier)}
                  disabled={loading}
                  className="h-4 w-4 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {supplier}
                </span>
              </label>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Select suppliers to activate or deactivate for this user
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={handleActivateSuppliers}
            disabled={loading || selectedSuppliers.length === 0}
            variant="primary"
            className={cn(
              "w-full bg-green-600 hover:bg-green-700",
              (loading || selectedSuppliers.length === 0) &&
                "cursor-not-allowed opacity-70"
            )}
          >
            {loading && actionType === "activate" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Activating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>

          <Button
            onClick={handleDeactivateSuppliers}
            disabled={loading || selectedSuppliers.length === 0}
            variant="danger"
            className={cn(
              "w-full",
              (loading || selectedSuppliers.length === 0) &&
                "cursor-not-allowed opacity-70"
            )}
          >
            {loading && actionType === "deactivate" ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deactivating...
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-2" />
                Deactivate
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
