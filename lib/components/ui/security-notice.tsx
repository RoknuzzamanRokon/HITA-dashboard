/**
 * Security Notice Component
 * Displays security information and login attempt warnings
 */

"use client";

import React from "react";

interface SecurityNoticeProps {
  loginAttempts?: number;
  lastLogin?: string | null;
  showEncryption?: boolean;
  className?: string;
}

export function SecurityNotice({
  loginAttempts = 0,
  lastLogin,
  showEncryption = true,
  className = "",
}: SecurityNoticeProps) {
  const getSecurityMessage = () => {
    if (loginAttempts > 3) {
      return {
        type: "warning",
        icon: (
          <svg
            className="h-4 w-4 text-amber-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        ),
        message: `Multiple login attempts detected (${loginAttempts}). Account may be temporarily locked.`,
        bgColor: "bg-amber-50 dark:bg-amber-900/20",
        textColor: "text-amber-800 dark:text-amber-200",
        borderColor: "border-amber-200 dark:border-amber-800",
      };
    }

    if (loginAttempts > 1) {
      return {
        type: "info",
        icon: (
          <svg
            className="h-4 w-4 text-blue-500"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        ),
        message: `${loginAttempts} login attempts. Please verify your credentials.`,
        bgColor: "bg-blue-50 dark:bg-blue-900/20",
        textColor: "text-blue-800 dark:text-blue-200",
        borderColor: "border-blue-200 dark:border-blue-800",
      };
    }

    return {
      type: "success",
      icon: (
        <svg
          className="h-4 w-4 text-green-500"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
      message: "Your connection is secure and encrypted",
      bgColor: "bg-green-50 dark:bg-green-900/20",
      textColor: "text-green-800 dark:text-green-200",
      borderColor: "border-green-200 dark:border-green-800",
    };
  };

  const securityInfo = getSecurityMessage();

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Security Status */}
      <div
        className={`flex items-center justify-center space-x-2 p-3 rounded-lg border ${securityInfo.bgColor} ${securityInfo.borderColor}`}
      >
        <div className="flex-shrink-0">{securityInfo.icon}</div>
        <span className={`text-xs font-medium ${securityInfo.textColor}`}>
          {securityInfo.message}
        </span>
      </div>

      {/* Last Login Info */}
      {lastLogin && (
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Last login: {new Date(lastLogin).toLocaleString()}
          </p>
        </div>
      )}

      {/* Encryption Notice */}
      {showEncryption && (
        <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
          <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
              clipRule="evenodd"
            />
          </svg>
          <span>256-bit SSL encryption</span>
        </div>
      )}
    </div>
  );
}
