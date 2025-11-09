/**
 * User Form Component
 * Form for creating and editing users with role selection and validation
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { Select } from "@/lib/components/ui/select";
import { Modal } from "@/lib/components/ui/modal";
import { UserRole } from "@/lib/types/auth";
import { UserFormData, UserListItem } from "@/lib/types/user";
import { useAuth } from "@/lib/contexts/auth-context";
import { Save, X, Eye, EyeOff } from "lucide-react";

interface UserFormProps {
  user?: UserListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (userData: UserFormData) => Promise<void>;
  loading?: boolean;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  role?: string;
  general?: string;
}

export function UserForm({
  user,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: UserFormProps) {
  const { user: currentUser } = useAuth();
  const isEditing = !!user;

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    password: "",
    role: UserRole.GENERAL_USER,
    isActive: true,
    pointBalance: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: "", // Don't populate password for editing
        role: user.role,
        isActive: user.isActive,
        pointBalance: user.pointBalance || 0,
      });
    } else {
      // Reset form for new user
      setFormData({
        username: "",
        email: "",
        password: "",
        role: UserRole.GENERAL_USER,
        isActive: true,
        pointBalance: 0,
      });
    }
    setErrors({});
  }, [user, isOpen]);

  /**
   * Get available roles based on current user's role
   */
  const getAvailableRoles = (): Array<{ value: UserRole; label: string }> => {
    const roleOptions = [
      { value: UserRole.GENERAL_USER, label: "General User" },
      { value: UserRole.ADMIN_USER, label: "Admin User" },
      { value: UserRole.SUPER_USER, label: "Super User" },
    ];

    // Super users can assign any role
    if (currentUser?.role === UserRole.SUPER_USER) {
      return roleOptions;
    }

    // Admin users can only assign general user and admin user roles
    if (currentUser?.role === UserRole.ADMIN_USER) {
      return roleOptions.filter(
        (option) =>
          option.value === UserRole.GENERAL_USER ||
          option.value === UserRole.ADMIN_USER
      );
    }

    // General users shouldn't be able to create users, but just in case
    return [{ value: UserRole.GENERAL_USER, label: "General User" }];
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username =
        "Username can only contain letters, numbers, hyphens, and underscores";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Password validation (only for new users or when password is provided)
    if (!isEditing || formData.password) {
      if (!formData.password) {
        newErrors.password = "Password is required";
      }
    }

    // Role validation
    if (!formData.role) {
      newErrors.role = "Role is required";
    }

    // Point balance validation
    if (formData.pointBalance !== undefined && formData.pointBalance < 0) {
      newErrors.general = "Point balance cannot be negative";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Prepare form data for submission
      const submitData: UserFormData = {
        ...formData,
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      // Don't include password if it's empty during editing
      if (isEditing && !formData.password) {
        delete submitData.password;
      }

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      setErrors({
        general:
          error instanceof Error
            ? error.message
            : "An error occurred while saving the user",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const availableRoles = getAvailableRoles();

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit User: ${user?.username}` : "Create New User"}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General Error */}
        {errors.general && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{errors.general}</div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Username *
            </label>
            <Input
              id="username"
              type="text"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              placeholder="Enter username"
              error={errors.username}
              disabled={isSubmitting || loading}
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600">{errors.username}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address *
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="Enter email address"
              error={errors.email}
              disabled={isSubmitting || loading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password {!isEditing && "*"}
              {isEditing && (
                <span className="text-gray-500 text-xs ml-1">
                  (leave blank to keep current)
                </span>
              )}
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder={
                  isEditing ? "Enter new password (optional)" : "Enter password"
                }
                error={errors.password}
                disabled={isSubmitting || loading}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                ) : (
                  <Eye className="h-4 w-4 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">{errors.password}</p>
            )}
          </div>

          {/* Role */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Role *
            </label>
            <Select
              id="role"
              value={formData.role}
              onChange={(e) =>
                handleInputChange("role", e.target.value as UserRole)
              }
              options={availableRoles}
              placeholder="Select role"
              error={errors.role}
              disabled={isSubmitting || loading}
            />
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role}</p>
            )}
          </div>

          {/* Point Balance */}
          <div>
            <label
              htmlFor="pointBalance"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Point Balance
            </label>
            <Input
              id="pointBalance"
              type="number"
              min="0"
              value={formData.pointBalance || 0}
              onChange={(e) =>
                handleInputChange("pointBalance", parseInt(e.target.value) || 0)
              }
              placeholder="0"
              disabled={isSubmitting || loading}
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              id="isActive"
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => handleInputChange("isActive", e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isSubmitting || loading}
            />
            <label
              htmlFor="isActive"
              className="ml-2 block text-sm text-gray-700"
            >
              Active User
            </label>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || loading}
            leftIcon={<X className="h-4 w-4" />}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || loading}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {isSubmitting
              ? "Saving..."
              : isEditing
              ? "Update User"
              : "Create User"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
