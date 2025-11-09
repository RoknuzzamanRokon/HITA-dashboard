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
  onOptimisticUpdate?: (updates: any) => void;
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
  onOptimisticUpdate,
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

    // Apply optimistic update
    const newActiveSuppliers = [
      ...activeSuppliers,
      ...selectedSuppliers.filter((s) => !activeSuppliers.includes(s)),
    ];
    onOptimisticUpdate?.({ active_suppliers: newActiveSuppliers });

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

        // Rollback optimistic update on error
        onOptimisticUpdate?.(null);

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

      // Rollback optimistic update on error
      onOptimisticUpdate?.(null);
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

    // Apply optimistic update
    const newActiveSuppliers = activeSuppliers.filter(
      (s) => !selectedSuppliers.includes(s)
    );
    onOptimisticUpdate?.({ active_suppliers: newActiveSuppliers });

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

        // Rollback optimistic update on error
        onOptimisticUpdate?.(null);

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

      // Rollback optimistic update on error
      onOptimisticUpdate?.(null);
    } finally {
      setLoading(false);
      setActionType(null);
    }
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-purple-100" aria-hidden="true">
            <Building2 className="h-5 w-5 text-purple-600" />
          </div>
          <h3
            className="text-lg font-semibold text-gray-900"
            id="supplier-management-heading"
          >
            Supplier Management
          </h3>
        </div>
      </CardHeader>
      <CardContent
        className="space-y-4"
        aria-labelledby="supplier-management-heading"
      >
        {/* ARIA live region for supplier management status */}
        <div
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        >
          {loading &&
            actionType === "activate" &&
            "Activating suppliers, please wait"}
          {loading &&
            actionType === "deactivate" &&
            "Deactivating suppliers, please wait"}
          {validationError && `Error: ${validationError}`}
          {selectedSuppliers.length > 0 &&
            `${selectedSuppliers.length} supplier${
              selectedSuppliers.length > 1 ? "s" : ""
            } selected`}
        </div>
        {/* Active Suppliers Display */}
        <div
          className={cn(
            "p-3 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 transition-all",
            loading && "ring-2 ring-purple-400 ring-opacity-50 animate-pulse"
          )}
          role="region"
          aria-label="Active suppliers list"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-purple-700">
              Active Suppliers
            </span>
            <span
              className="text-lg font-bold text-purple-600 flex items-center"
              aria-label={`${activeSuppliers.length} of ${totalSuppliers} suppliers active`}
            >
              {activeSuppliers.length} / {totalSuppliers}
              {loading && (
                <Loader2 className="inline-block h-4 w-4 ml-2 animate-spin text-purple-500" />
              )}
            </span>
          </div>
          {activeSuppliers.length > 0 ? (
            <div
              className="flex flex-wrap gap-2 mt-2"
              role="list"
              aria-label="Active suppliers"
            >
              {activeSuppliers.map((supplier) => (
                <span
                  key={supplier}
                  className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded-md"
                  role="listitem"
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
          <div
            className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start space-x-2"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle
              className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5"
              aria-hidden="true"
            />
            <p className="text-sm font-medium text-red-900 flex-1">
              {validationError}
            </p>
          </div>
        )}

        {/* Supplier Selection */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <label
              className="text-sm font-medium text-gray-700"
              id="supplier-selection-label"
            >
              Select Suppliers
            </label>
            <button
              type="button"
              onClick={handleSelectAll}
              disabled={loading}
              className="text-xs text-purple-600 hover:text-purple-700 font-medium disabled:opacity-50"
              aria-label={
                selectedSuppliers.length === AVAILABLE_SUPPLIERS.length
                  ? "Deselect all suppliers"
                  : "Select all suppliers"
              }
            >
              {selectedSuppliers.length === AVAILABLE_SUPPLIERS.length
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>
          <div
            className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-gray-50 border border-gray-200"
            role="group"
            aria-labelledby="supplier-selection-label"
          >
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
                  aria-label={`${supplier} supplier`}
                />
                <span className="text-sm font-medium text-gray-700">
                  {supplier}
                </span>
              </label>
            ))}
          </div>
          <p
            className="mt-1 text-xs text-gray-500"
            id="supplier-selection-description"
          >
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
            aria-label={`Activate ${
              selectedSuppliers.length
            } selected supplier${selectedSuppliers.length !== 1 ? "s" : ""}`}
            aria-busy={loading && actionType === "activate"}
          >
            {loading && actionType === "activate" ? (
              <>
                <Loader2
                  className="h-4 w-4 mr-2 animate-spin"
                  aria-hidden="true"
                />
                Activating...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" aria-hidden="true" />
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
            aria-label={`Deactivate ${
              selectedSuppliers.length
            } selected supplier${selectedSuppliers.length !== 1 ? "s" : ""}`}
            aria-busy={loading && actionType === "deactivate"}
          >
            {loading && actionType === "deactivate" ? (
              <>
                <Loader2
                  className="h-4 w-4 mr-2 animate-spin"
                  aria-hidden="true"
                />
                Deactivating...
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                Deactivate
              </>
            )}
          </Button>
        </div>

        {/* Optimistic Update Indicator */}
        {loading && (
          <div className="text-xs text-purple-600 text-center animate-pulse">
            {actionType === "activate"
              ? "Activating suppliers..."
              : "Deactivating suppliers..."}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
