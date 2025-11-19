"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/lib/components/ui/modal";
import { Button } from "@/lib/components/ui/button";
import { apiClient } from "@/lib/api/client";
import {
  Building2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Power,
  PowerOff,
  Search,
} from "lucide-react";

interface SupplierManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    id: string;
    username: string;
    email: string;
    activeSuppliers?: string[];
  };
  onSuccess?: () => void;
}

const availableSuppliers = [
  { id: "hotelbeds", name: "HotelBeds", logo: "🏨" },
  { id: "expedia", name: "Expedia", logo: "✈️" },
  { id: "booking", name: "Booking.com", logo: "🌐" },
  { id: "agoda", name: "Agoda", logo: "🏖️" },
  { id: "amadeus", name: "Amadeus", logo: "🎯" },
  { id: "sabre", name: "Sabre", logo: "🔷" },
];

export function SupplierManagementModal({
  isOpen,
  onClose,
  user,
  onSuccess,
}: SupplierManagementModalProps) {
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [actionType, setActionType] = useState<"activate" | "deactivate">(
    "activate"
  );

  useEffect(() => {
    if (isOpen && user.activeSuppliers) {
      setSelectedSuppliers(user.activeSuppliers);
    }
  }, [isOpen, user.activeSuppliers]);

  const filteredSuppliers = availableSuppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers((prev) =>
      prev.includes(supplierId)
        ? prev.filter((id) => id !== supplierId)
        : [...prev, supplierId]
    );
  };

  const handleActivate = async () => {
    if (selectedSuppliers.length === 0) {
      setError("Please select at least one supplier");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(
        `/permissions/admin/activate_supplier?user_id=${user.id}`,
        {
          provider_activision_list: selectedSuppliers,
        }
      );

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError(response.error?.message || "Failed to activate suppliers");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async () => {
    if (selectedSuppliers.length === 0) {
      setError("Please select at least one supplier");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post(
        `/permissions/admin/deactivate_supplier?user_id=${user.id}`,
        {
          provider_activision_list: selectedSuppliers,
        }
      );

      if (response.success) {
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.();
          onClose();
          setSuccess(false);
        }, 1500);
      } else {
        setError(response.error?.message || "Failed to deactivate suppliers");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setSelectedSuppliers(user.activeSuppliers || []);
      setError(null);
      setSuccess(false);
      setSearchQuery("");
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Manage Suppliers"
      size="lg"
    >
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {user.username}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {user.email}
              </p>
              {user.activeSuppliers && user.activeSuppliers.length > 0 && (
                <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                  {user.activeSuppliers.length} active supplier(s)
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 animate-fade-in">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <p className="text-sm font-medium text-gray-600 dark:text-green-300">
                Suppliers updated successfully!
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

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          />
        </div>

        {/* Suppliers Grid */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Select Suppliers ({selectedSuppliers.length} selected)
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
            {filteredSuppliers.map((supplier) => {
              const isSelected = selectedSuppliers.includes(supplier.id);
              const isActive = user.activeSuppliers?.includes(supplier.id);

              return (
                <button
                  key={supplier.id}
                  onClick={() => toggleSupplier(supplier.id)}
                  disabled={loading || success}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all duration-200
                    ${
                      isSelected
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg"
                        : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                    }
                    ${
                      loading || success
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer hover:shadow-md"
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="text-3xl mb-2">{supplier.logo}</div>
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                      {supplier.name}
                    </h4>
                    {isActive && (
                      <span className="inline-block mt-2 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">
                        Active
                      </span>
                    )}
                  </div>
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={loading || success}
          >
            Cancel
          </Button>
          <div className="flex space-x-3">
            <Button
              onClick={() => {
                setActionType("deactivate");
                handleDeactivate();
              }}
              disabled={selectedSuppliers.length === 0 || loading || success}
              variant="outline"
              leftIcon={
                loading && actionType === "deactivate" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <PowerOff className="w-4 h-4" />
                )
              }
              className="border-red-300 text-red-600 hover:bg-red-50 dark:border-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              Deactivate
            </Button>
            <Button
              onClick={() => {
                setActionType("activate");
                handleActivate();
              }}
              disabled={selectedSuppliers.length === 0 || loading || success}
              leftIcon={
                loading && actionType === "activate" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Power className="w-4 h-4" />
                )
              }
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              Activate
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
