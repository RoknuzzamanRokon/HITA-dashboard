/**
 * Enterprise Login Page
 * Production-ready with professional design and enhanced security
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
        content="default-src 'self'; connect-src 'self' http://127.0.0.1:8001 http://localhost:8001 https://*.innovatedemo.com; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
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
    console.log("🎉 Login success handler called");
    const targetUrl = returnUrl || redirectTo;
    console.log("🚀 Redirecting to:", targetUrl);
    router.push(targetUrl);
  };

  const handleLoginFailure = (attempts: number) => {
    setLoginAttempts(attempts);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50">
      {/* Professional Background with Subtle Animation */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)`,
            backgroundSize: "50px 50px",
          }}
        ></div>

        {/* Animated Orbs */}
        <div className="absolute top-1/4 -left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"></div>
        <div
          className="absolute top-1/3 -right-10 w-72 h-72 bg-indigo-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"
          style={{ animationDelay: "3s" }}
        ></div>
        <div
          className="absolute -bottom-8 left-1/2 w-72 h-72 bg-slate-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float-slow"
          style={{ animationDelay: "6s" }}
        ></div>
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Left Side - Professional Branding */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
          {/* Subtle Pattern Overlay */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.1) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 0%, transparent 50%)`,
            }}
          ></div>

          <div className="relative z-20 flex flex-col justify-between px-16 py-12 text-white">
            {/* Header */}
            <div>
              <div className="flex items-center space-x-4 mb-12">
                <div className="h-16 w-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
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
                  <p className="text-blue-100/80 text-sm font-medium mt-1">
                    Enterprise Platform
                  </p>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-12 max-w-2xl">
              <div className="space-y-6">
                <h2 className="text-4xl font-bold leading-tight tracking-tight">
                  Secure Enterprise
                  <br />
                  <span className="text-blue-200">Access Portal</span>
                </h2>
                <p className="text-lg text-blue-100/90 leading-relaxed font-light">
                  Access your organization's administrative dashboard with
                  enterprise-grade security and comprehensive management tools.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: (
                      <svg
                        className="w-5 h-5"
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
                    title: "Advanced Security",
                    desc: "Multi-factor authentication and encryption",
                  },
                  {
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ),
                    title: "Real-time Analytics",
                    desc: "Comprehensive monitoring and reporting",
                  },
                  {
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ),
                    title: "User Management",
                    desc: "Granular role-based access control",
                  },
                  {
                    icon: (
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ),
                    title: "Audit Logging",
                    desc: "Complete activity tracking and records",
                  },
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-200 border border-white/10"
                  >
                    <div className="h-10 w-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0 text-blue-300">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm">
                        {feature.title}
                      </h3>
                      <p className="text-blue-100/70 text-xs mt-1">
                        {feature.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Status */}
            <div className="pt-8 border-t border-blue-700/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-white font-medium text-sm">
                      System Secure
                    </p>
                    <p className="text-blue-100/60 text-xs">
                      TLS 1.3 Encrypted Connection
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-blue-100/70 text-xs font-mono">
                    v{config.app.version}
                  </p>
                  <p className="text-blue-100/50 text-xs">SOC 2 Compliant</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-md w-full space-y-8">
            {/* Mobile Header */}
            <div className="lg:hidden text-center space-y-6">
              <div className="mx-auto h-20 w-20 bg-gradient-to-br from-slate-800 to-blue-900 rounded-2xl flex items-center justify-center shadow-lg border border-slate-700/50">
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
                <h1 className="text-2xl font-bold text-gray-900">
                  {config.app.name}
                </h1>
                <p className="text-gray-600 text-sm mt-1">
                  Enterprise Platform
                </p>
              </div>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-2xl">
              <div className="px-8 py-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
                    <svg
                      className="w-7 h-7 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Secure Sign In
                  </h2>
                  <p className="text-gray-600">
                    Access your enterprise dashboard
                  </p>
                </div>

                {/* Login Form */}
                <LoginForm
                  onSuccess={handleLoginSuccess}
                  onFailure={handleLoginFailure}
                />

                {/* Additional Options */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="space-y-4">
                    <a
                      href="/forgot-password"
                      className="block text-center text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
                    >
                      Forgot your password?
                    </a>

                    {config.auth.enableRegistration && (
                      <div className="text-center">
                        <span className="text-gray-500 text-sm">
                          Need access?{" "}
                          <a
                            href="/register"
                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                          >
                            Request account
                          </a>
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Security Footer */}
              <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
                <SecurityNotice
                  loginAttempts={loginAttempts}
                  lastLogin={null}
                />
              </div>
            </div>

            {/* Global Footer */}
            <div className="text-center space-y-4">
              {/* Quick Links */}
              <div className="flex items-center justify-center space-x-6 text-sm">
                <a
                  href="/privacy"
                  className="text-gray-500 hover:text-gray-700 transition-colors font-medium"
                >
                  Privacy
                </a>
                <span className="text-gray-300">•</span>
                <a
                  href="/terms"
                  className="text-gray-500 hover:text-gray-700 transition-colors font-medium"
                >
                  Terms
                </a>
                <span className="text-gray-300">•</span>
                <a
                  href="/support"
                  className="text-gray-500 hover:text-gray-700 transition-colors font-medium"
                >
                  Support
                </a>
              </div>

              {/* Copyright */}
              <div className="space-y-1">
                <p className="text-xs text-gray-400">
                  {config.app.name} v{config.app.version}
                </p>
                <p className="text-xs text-gray-400">
                  © 2024 {config.app.name}. All rights reserved.
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
