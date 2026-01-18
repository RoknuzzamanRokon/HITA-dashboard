/**
 * Login form component with validation and error handling
 */

"use client";

import React from "react";
import { User, Lock, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useLoginForm } from "@/lib/hooks/use-auth";

export interface LoginFormProps {
  onSuccess?: () => void;
  onFailure?: (attempts: number) => void;
  className?: string;
}

export function LoginForm({ onSuccess, onFailure, className }: LoginFormProps) {
  const { formData, formErrors, isLoading, handleChange, handleSubmit } =
    useLoginForm();
  const [loginAttempts, setLoginAttempts] = React.useState(0);
  const [rememberMe, setRememberMe] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e, rememberMe);
    if (success && onSuccess) {
      setLoginAttempts(0); // Reset attempts on success
      onSuccess();
    } else if (!success) {
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      if (onFailure) {
        onFailure(newAttempts);
      }
    }
  };

  return (
    <form onSubmit={onSubmit} className={className} noValidate>
      <div className="space-y-6">
        {/* General error message */}
        {formErrors.general && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-semibold text-red-800">
                  Authentication Failed
                </h3>
                <div className="mt-1 text-sm text-red-700">
                  {formErrors.general}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-5">
          {/* Username field */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                required
                autoComplete="username"
                disabled={isLoading}
                className={`block w-full pl-10 pr-3 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  formErrors.username
                    ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 text-gray-900"
                } ${isLoading ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
              />
            </div>
            {formErrors.username && (
              <p className="mt-2 text-sm text-red-600">{formErrors.username}</p>
            )}
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold text-gray-700 mb-2"
            >
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                required
                autoComplete="current-password"
                disabled={isLoading}
                className={`block w-full pl-10 pr-10 py-3 border rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  formErrors.password
                    ? "border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500"
                    : "border-gray-300 text-gray-900"
                } ${isLoading ? "bg-gray-50 cursor-not-allowed" : "bg-white"}`}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPassword(!showPassword);
                }}
                className="absolute inset-y-0 right-0 pr-3 flex items-center justify-center text-gray-400 hover:text-gray-700 focus:outline-none focus:text-gray-700 transition-colors z-10 cursor-pointer"
                tabIndex={0}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {formErrors.password && (
              <p className="mt-2 text-sm text-red-600">{formErrors.password}</p>
            )}
          </div>
        </div>

        {/* Remember me and forgot password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700 cursor-pointer select-none"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
            >
              Forgot your password?
            </a>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isLoading}
          className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white transition-all duration-200 ${
            isLoading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          }`}
        >
          {isLoading && (
            <div className="absolute left-0 inset-y-0 flex items-center pl-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            </div>
          )}
          {isLoading ? "Signing in..." : "Sign in to Dashboard"}
        </button>        
      </div>
    </form>
  );
}
