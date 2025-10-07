/**
 * Create User Page
 * Page for creating new users with form validation and role selection
 */

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/lib/hooks/use-auth";
import { UserService } from "@/lib/api/users";
import { UserForm } from "@/lib/components/users/user-form";
import { Button } from "@/lib/components/ui/button";
import { ArrowLeft } from "lucide-react";
import type { UserFormData } from "@/lib/types/user";

export default function CreateUserPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Handle user creation
   */
  const handleCreateUser = async (userData: UserFormData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await UserService.createUser(userData);

      if (response.success) {
        // Redirect to users list with success message
        router.push("/dashboard/users?created=true");
      } else {
        throw new Error(response.error?.message || "Failed to create user");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err; // Re-throw to let the form handle it
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle navigation back to users list
   */
  const handleBack = () => {
    router.push("/dashboard/users");
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            leftIcon={<ArrowLeft className="h-4 w-4" />}
          >
            Back to Users
          </Button>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New User</h1>
          <p className="mt-1 text-sm text-gray-600">
            Add a new user to the system with appropriate role and permissions
          </p>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError(null)}
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Creation Form */}
      <UserForm
        isOpen={true}
        onClose={handleBack}
        onSubmit={handleCreateUser}
        loading={loading}
      />
    </div>
  );
}
