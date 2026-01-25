"use client";

import Link from "next/link";
import { Home, ArrowLeft, Search, Settings } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="min-h-screen bg-[rgb(var(--bg-primary))] flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
            404
          </h1>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-[rgb(var(--text-primary))] mb-4">
            Oops! Dashboard Page Not Found
          </h2>
          <p className="text-lg text-[rgb(var(--text-secondary))] leading-relaxed">
            The dashboard page you are looking for might have been removed, had
            its name changed, or is temporarily unavailable.
          </p>
        </div>

        {/* Illustration */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-6">
            <Settings className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            Go to Dashboard
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[rgb(var(--bg-secondary))] text-[rgb(var(--text-primary))] font-semibold rounded-lg border border-[rgb(var(--border-primary))] hover:bg-[rgb(var(--bg-tertiary))] transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        {/* Quick Navigation */}
        <div className="mt-12 p-6 bg-[rgb(var(--bg-secondary))] rounded-xl border border-[rgb(var(--border-primary))]">
          <h3 className="text-lg font-semibold text-[rgb(var(--text-primary))] mb-4">
            Quick Navigation
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/dashboard/users"
              className="p-3 text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
            >
              Users
            </Link>
            <Link
              href="/dashboard/hotels"
              className="p-3 text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
            >
              Hotels
            </Link>
            <Link
              href="/dashboard/analytics"
              className="p-3 text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
            >
              Analytics
            </Link>
            <Link
              href="/dashboard/settings"
              className="p-3 text-sm text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-tertiary))] rounded-lg transition-colors"
            >
              Settings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
