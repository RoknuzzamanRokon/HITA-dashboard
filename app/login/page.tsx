/**
 * Professional Login Page
 * Enhanced for production with security, accessibility, and UX improvements
 */

"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { LoginForm } from "@/lib/components/auth/login-form";
import { LoadingScreen } from "@/lib/components/ui/loading-screen";
import { SecurityNotice } from "@/lib/components/ui";
import { config } from "@/lib/config";
import { Suspense } from "react";

// Security headers component
function SecurityHeaders() {
  return (
    <>
      <meta name="robots" content="noindex, nofollow" />
      <meta
        httpEquiv="Content-Security-Policy"
        content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
      />
    </>
  );
}

// Loading boundary for search params
function LoginContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loginAttempts, setLoginAttempts] = useState(0);

  // Get redirect URL from query params or default to dashboard
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const returnUrl = searchParams.get("returnUrl");

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const targetUrl = returnUrl || redirectTo;
      router.push(targetUrl);
    }
  }, [isAuthenticated, isLoading, router, redirectTo, returnUrl]);

  // Show loading while checking authentication
  if (isLoading) {
    return <LoadingScreen message="Verifying session..." />;
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleLoginSuccess = () => {
    const targetUrl = returnUrl || redirectTo;
    router.push(targetUrl);
  };

  const handleLoginFailure = (attempts: number) => {
    setLoginAttempts(attempts);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-blue-900">
      <div className="flex min-h-screen">
        {/* Left Side - Branding & Security Info */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-slate-800 to-blue-900 relative overflow-hidden">
          {/* Enhanced Background Pattern */}
          <div className="absolute inset-0 bg-black/20">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                  radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)
                `,
              }}
            ></div>
          </div>

          {/* Animated background elements */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

          <div className="relative z-10 flex flex-col justify-between px-16 py-12 text-white">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-4 mb-8">
                <div className="h-14 w-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
                  <svg
                    className="h-8 w-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold tracking-tight">
                    {config.app.name}
                  </h1>
                  <p className="text-blue-100/80 text-sm font-medium">
                    Enterprise System
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8 max-w-2xl">
              <div className="space-y-6">
                <h2 className="text-5xl font-bold leading-tight tracking-tight">
                  Secure Access
                  <br />
                  <span className="text-blue-200 font-extrabold">
                    Enterprise Portal
                  </span>
                </h2>
                <p className="text-xl text-blue-100/90 leading-relaxed font-light">
                  Advanced administrative dashboard with comprehensive security
                  monitoring, real-time analytics, and enterprise-grade user
                  management.
                </p>
              </div>

              {/* Features List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-8">
                <div className="flex items-start space-x-4">
                  <div className="h-6 w-6 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 text-blue-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-blue-50 font-semibold">
                      Multi-factor Authentication
                    </h3>
                    <p className="text-blue-100/70 text-sm mt-1">
                      Enhanced security with 2FA support
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-6 w-6 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 text-blue-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-blue-50 font-semibold">
                      Real-time Monitoring
                    </h3>
                    <p className="text-blue-100/70 text-sm mt-1">
                      Live activity tracking and alerts
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-6 w-6 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 text-blue-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-blue-50 font-semibold">
                      Role-based Access
                    </h3>
                    <p className="text-blue-100/70 text-sm mt-1">
                      Granular permission controls
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="h-6 w-6 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg
                      className="h-3 w-3 text-blue-300"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-blue-50 font-semibold">
                      Audit Logging
                    </h3>
                    <p className="text-blue-100/70 text-sm mt-1">
                      Comprehensive activity records
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="pt-8 border-t border-blue-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <svg
                      className="h-4 w-4 text-green-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="text-blue-50 font-semibold text-sm">
                      TLS 1.3 Encrypted
                    </p>
                    <p className="text-blue-100/60 text-xs">
                      End-to-end security
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-100/50 text-xs font-mono">
                    v{config.app.version}
                  </p>
                  <p className="text-blue-100/40 text-xs">
                    ISO 27001 Compliant
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md w-full space-y-8">
            {/* Mobile Header */}
            <div className="lg:hidden text-center space-y-4">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-slate-800 to-blue-900 rounded-2xl flex items-center justify-center shadow-lg mb-2 border border-slate-700/50">
                <svg
                  className="h-10 w-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
                  {config.app.name}
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">
                  Enterprise Admin System
                </p>
              </div>
            </div>

            {/* Login Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 overflow-hidden transition-all duration-200 hover:shadow-2xl">
              <div className="px-8 py-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                    Secure Sign In
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    Enter your credentials to access the admin dashboard
                  </p>
                </div>

                {/* Login Form */}
                <LoginForm
                  onSuccess={handleLoginSuccess}
                  onFailure={handleLoginFailure}
                />

                {/* Additional Options */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-slate-700">
                  <div className="space-y-4">
                    <a
                      href="/forgot-password"
                      className="block text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                    >
                      Forgot your password?
                    </a>

                    {config.auth.enableRegistration && (
                      <div className="text-center">
                        <span className="text-gray-500 dark:text-gray-400 text-sm">
                          Don't have an account?{" "}
                          <a
                            href="/register"
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
                          >
                            Request access
                          </a>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Footer */}
              <div className="px-8 py-4 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700">
                <SecurityNotice
                  loginAttempts={loginAttempts}
                  lastLogin={null} // You can pass actual last login data here
                />
              </div>
            </div>

            {/* Global Footer */}
            <div className="text-center space-y-4">
              {/* Quick Links */}
              <div className="flex items-center justify-center space-x-6 text-sm">
                <a
                  href="/privacy"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors font-medium"
                >
                  Privacy
                </a>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <a
                  href="/terms"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors font-medium"
                >
                  Terms
                </a>
                <span className="text-gray-300 dark:text-gray-600">•</span>
                <a
                  href="/support"
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors font-medium"
                >
                  Support
                </a>
              </div>

              {/* Copyright */}
              <div className="space-y-1">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {config.app.name} v{config.app.version} • Protected System
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  © 2024 {config.app.name}. All rights reserved. Unauthorized
                  access prohibited.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function LoginPage() {
  return (
    <>
      <SecurityHeaders />
      <Suspense
        fallback={<LoadingScreen message="Loading secure session..." />}
      >
        <LoginContent />
      </Suspense>
    </>
  );
}
