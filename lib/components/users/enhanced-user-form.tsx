/**
 * Enhanced User Form Component
 * Beautiful user form modal with smooth animations, validation, and toast notifications
 */

"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/lib/components/ui/button";
import { Input } from "@/lib/components/ui/input";
import { Select } from "@/lib/components/ui/select";
import { Modal, ModalBody, ModalFooter } from "@/lib/components/ui/modal";
import { useToast } from "@/lib/components/ui/toast";
import { UserRole } from "@/lib/types/auth";
import { UserFormData, UserListItem } from "@/lib/types/user";
import { useAuth } from "@/lib/contexts/auth-context";
import {
  Save,
  X,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Shield,
  Coins,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedUserFormProps {
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
  pointBalance?: string;
}

interface ValidationState {
  username: "idle" | "validating" | "valid" | "invalid";
  email: "idle" | "validating" | "valid" | "invalid";
  password: "idle" | "validating" | "valid" | "invalid";
}

export function EnhancedUserForm({
  user,
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}: EnhancedUserFormProps) {
  const { user: currentUser } = useAuth();
  const { success, error: showError } = useToast();
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
  const [validationState, setValidationState] = useState<ValidationState>({
    username: "idle",
    email: "idle",
    password: "idle",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: "",
        role: user.role,
        isActive: user.isActive,
        pointBalance: user.pointBalance || 0,
      });
    } else {
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
    setValidationState({
      username: "idle",
      email: "idle",
      password: "idle",
    });
    setHasInteracted(false);
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

    if (currentUser?.role === UserRole.SUPER_USER) {
      return roleOptions;
    }

    if (currentUser?.role === UserRole.ADMIN_USER) {
      return roleOptions.filter(
        (option) =>
          option.value === UserRole.GENERAL_USER ||
          option.value === UserRole.ADMIN_USER
      );
    }

    return [{ value: UserRole.GENERAL_USER, label: "General User" }];
  };

  /**
   * Real-time field validation
   */
  const validateField = (
    field: keyof FormErrors,
    value: string
  ): string | undefined => {
    switch (field) {
      case "username":
        if (!value.trim()) return "Username is required";
        if (value.length < 3) return "Username must be at least 3 characters";
        if (!/^[a-zA-Z0-9_-]+$/.test(value)) {
          return "Username can only contain letters, numbers, hyphens, and underscores";
        }
        return undefined;

      case "email":
        if (!value.trim()) return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address";
        }
        return undefined;

      case "password":
        if (!isEditing || value) {
          if (!value) return "Password is required";
          if (value.length < 8) return "Password must be at least 8 characters";
          if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) {
            return "Password must contain uppercase, lowercase, and number";
          }
        }
        return undefined;

      case "pointBalance":
        const points = parseInt(value);
        if (isNaN(points) || points < 0)
          return "Point balance must be a positive number";
        return undefined;

      default:
        return undefined;
    }
  };

  /**
   * Handle input changes with real-time validation
   */
  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasInteracted(true);

    // Real-time validation for text fields
    if (
      typeof value === "string" &&
      (field === "username" || field === "email" || field === "password")
    ) {
      setValidationState((prev) => ({ ...prev, [field]: "validating" }));

      setTimeout(() => {
        const error = validateField(field as keyof FormErrors, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
        setValidationState((prev) => ({
          ...prev,
          [field]: error ? "invalid" : "valid",
        }));
      }, 300);
    }

    // Clear field error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  /**
   * Validate entire form
   */
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    newErrors.username = validateField("username", formData.username);
    newErrors.email = validateField("email", formData.email);
    newErrors.password = validateField("password", formData.password || "");

    if (formData.pointBalance !== undefined) {
      newErrors.pointBalance = validateField(
        "pointBalance",
        formData.pointBalance.toString()
      );
    }

    // Remove undefined errors
    Object.keys(newErrors).forEach((key) => {
      if (newErrors[key as keyof FormErrors] === undefined) {
        delete newErrors[key as keyof FormErrors];
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      showError("Validation Error", "Please fix the errors before submitting");
      return;
    }

    setIsSubmitting(true);

    try {
      const submitData: UserFormData = {
        ...formData,
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
      };

      if (isEditing && !formData.password) {
        delete submitData.password;
      }

      await onSubmit(submitData);

      success(
        isEditing ? "User Updated" : "User Created",
        isEditing
          ? `${formData.username} has been updated successfully`
          : `${formData.username} has been created successfully`
      );

      onClose();
    } catch (error) {
      showError(
        "Error",
        error instanceof Error
          ? error.message
          : "An error occurred while saving the user"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Get validation icon for input fields
   */
  const getValidationIcon = (field: keyof ValidationState) => {
    const state = validationState[field];
    const hasError = errors[field];

    if (!hasInteracted) return null;

    switch (state) {
      case "validating":
        return (
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent" />
        );
      case "valid":
        return !hasError ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : null;
      case "invalid":
        return hasError ? (
          <AlertCircle className="h-4 w-4 text-red-500" />
        ) : null;
      default:
        return null;
    }
  };

  const availableRoles = getAvailableRoles();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Edit User: ${user?.username}` : "Create New User"}
      size="lg"
      animation="slide"
    >
      <form onSubmit={handleSubmit}>
        <ModalBody className="space-y-6">
          {/* Header with icon */}
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-200/50">
            <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {isEditing
                  ? "Update User Information"
                  : "Create New User Account"}
              </h3>
              <p className="text-sm text-gray-500">
                {isEditing
                  ? "Modify user details and permissions"
                  : "Fill in the details to create a new user account"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Username *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  placeholder="Enter username"
                  error={errors.username}
                  disabled={isSubmitting || loading}
                  className="pl-10 pr-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {getValidationIcon("username")}
                </div>
              </div>
              {errors.username && (
                <p className="text-sm text-red-600 animate-slide-in-from-top">
                  {errors.username}
                </p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter email address"
                  error={errors.email}
                  disabled={isSubmitting || loading}
                  className="pl-10 pr-10"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {getValidationIcon("email")}
                </div>
              </div>
              {errors.email && (
                <p className="text-sm text-red-600 animate-slide-in-from-top">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Password {!isEditing && "*"}
                {isEditing && (
                  <span className="text-gray-500 text-xs ml-1">
                    (leave blank to keep current)
                  </span>
                )}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder={
                    isEditing
                      ? "Enter new password (optional)"
                      : "Enter password"
                  }
                  error={errors.password}
                  disabled={isSubmitting || loading}
                  className="pl-10 pr-20"
                />
                <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
                  {getValidationIcon("password")}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 rounded-md hover:bg-gray-100 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600 animate-slide-in-from-top">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Role */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Role *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                  <Shield className="h-4 w-4 text-gray-400" />
                </div>
                <Select
                  value={formData.role}
                  onChange={(e) =>
                    handleInputChange("role", e.target.value as UserRole)
                  }
                  options={availableRoles}
                  placeholder="Select role"
                  disabled={isSubmitting || loading}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Point Balance */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Point Balance
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Coins className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="number"
                  min="0"
                  value={formData.pointBalance || 0}
                  onChange={(e) =>
                    handleInputChange(
                      "pointBalance",
                      parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="0"
                  error={errors.pointBalance}
                  disabled={isSubmitting || loading}
                  className="pl-10"
                />
              </div>
              {errors.pointBalance && (
                <p className="text-sm text-red-600 animate-slide-in-from-top">
                  {errors.pointBalance}
                </p>
              )}
            </div>

            {/* Active Status */}
            <div className="flex items-center space-x-3 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200">
              <input
                id="isActive"
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  handleInputChange("isActive", e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200"
                disabled={isSubmitting || loading}
              />
              <label
                htmlFor="isActive"
                className="text-sm font-medium text-gray-700"
              >
                Active User
              </label>
              <div
                className={cn(
                  "px-2 py-1 rounded-full text-xs font-medium transition-all duration-200",
                  formData.isActive
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-800"
                )}
              >
                {formData.isActive ? "Active" : "Inactive"}
              </div>
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
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
            variant="gradient"
            loading={isSubmitting}
            disabled={isSubmitting || loading}
            leftIcon={<Save className="h-4 w-4" />}
          >
            {isEditing ? "Update User" : "Create User"}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
