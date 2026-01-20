"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center px-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Error Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-red-500 to-orange-500 rounded-full mb-6">
            <AlertTriangle className="w-12 h-12 text-white" />
          </div>
        </div>

        {/* Error Message */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Something went wrong!
          </h1>
          <p className="text-lg text-gray-600 leading-relaxed mb-4">
            We encountered an unexpected error. Don't worry, our team has been
            notified and we're working to fix it.
          </p>

          {/* Error Details (only in development) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-left">
              <h3 className="font-semibold text-red-800 mb-2">
                Error Details (Development):
              </h3>
              <p className="text-sm text-red-700 font-mono break-all">
                {error.message}
              </p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-2">
                  Error ID: {error.digest}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold rounded-lg hover:from-red-700 hover:to-orange-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </Link>
        </div>

        {/* Additional Help */}
        <div className="mt-12 p-6 bg-white/60 backdrop-blur-sm rounded-xl border border-white/20">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            What happened?
          </h3>
          <ul className="text-gray-600 space-y-2">
            <li>• This might be a temporary issue</li>
            <li>• Try refreshing the page</li>
            <li>• Check your internet connection</li>
            <li>• Contact support if the problem persists</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
