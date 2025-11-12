"use client";

import React, { useState } from "react";
import { Button } from "@/lib/components/ui/button";
import { PointAllocationModal } from "./point-allocation-modal";
import { SupplierManagementModal } from "./supplier-management-modal";
import { PointResetModal } from "./point-reset-modal";
import {
  Coins,
  Building2,
  RotateCcw,
  Eye,
  Edit,
  Trash2,
  MoreVertical,
} from "lucide-react";

interface UserActionsCardProps {
  user: {
    id: string;
    username: string;
    email: string;
    pointBalance?: number;
    activeSuppliers?: string[];
  };
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onRefresh?: () => void;
}

export function UserActionsCard({
  user,
  onView,
  onEdit,
  onDelete,
  onRefresh,
}: UserActionsCardProps) {
  const [showPointModal, setShowPointModal] = useState(false);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSuccess = () => {
    onRefresh?.();
  };

  return (
    <>
      <div className="flex items-center space-x-2">
        {/* Primary Actions */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowPointModal(true)}
          title="Allocate Points"
          className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800 hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30"
        >
          <Coins className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowSupplierModal(true)}
          title="Manage Suppliers"
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/30 dark:hover:to-pink-900/30"
        >
          <Building2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowResetModal(true)}
          title="Reset Points"
          className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800 hover:from-red-100 hover:to-orange-100 dark:hover:from-red-900/30 dark:hover:to-orange-900/30"
        >
          <RotateCcw className="h-4 w-4 text-red-600 dark:text-red-400" />
        </Button>

        {/* More Actions Dropdown */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDropdown(!showDropdown)}
            title="More Actions"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>

          {showDropdown && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowDropdown(false)}
              />
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-20">
                <div className="py-1">
                  {onView && (
                    <button
                      onClick={() => {
                        onView();
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  )}
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit();
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit User</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete();
                        setShowDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete User</span>
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <PointAllocationModal
        isOpen={showPointModal}
        onClose={() => setShowPointModal(false)}
        user={user}
        onSuccess={handleSuccess}
      />

      <SupplierManagementModal
        isOpen={showSupplierModal}
        onClose={() => setShowSupplierModal(false)}
        user={user}
        onSuccess={handleSuccess}
      />

      <PointResetModal
        isOpen={showResetModal}
        onClose={() => setShowResetModal(false)}
        user={user}
        onSuccess={handleSuccess}
      />
    </>
  );
}
