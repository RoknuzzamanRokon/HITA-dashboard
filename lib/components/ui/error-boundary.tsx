/**
 * Error Boundary Component
 * Catches and handles React errors gracefully
 */

"use client";

import React, { Component, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error Boundary caught an error:", error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center min-h-[400px] p-8">
          <div className="max-w-md w-full">
            <div className="bg-gradient-to-br from-red-50 to-rose-50 border border-red-200 rounded-2xl p-8 shadow-lg">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-red-100">
                  <AlertTriangle className="h-12 w-12 text-red-600" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-red-900">
                    Something went wrong
                  </h3>
                  <p className="text-sm text-red-700">
                    An unexpected error occurred. Please try again.
                  </p>
                </div>

                {this.state.error && process.env.NODE_ENV === "development" && (
                  <div className="w-full mt-4 p-4 bg-red-100 rounded-lg">
                    <p className="text-xs font-mono text-red-800 break-all">
                      {this.state.error.message}
                    </p>
                  </div>
                )}

                <Button
                  onClick={this.handleReset}
                  className="mt-4"
                  leftIcon={<RefreshCw className="h-4 w-4" />}
                >
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
