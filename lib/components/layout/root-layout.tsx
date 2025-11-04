/**
 * Root Layout Component with Navbar and Sidebar
 * Provides the main layout structure for authenticated pages
 */

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { cn } from "@/lib/utils";
import { Navbar } from "./navbar";
import { Sidebar } from "./sidebar";

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Handle initial client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="text-blue-600 dark:text-blue-400 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render layout for unauthenticated users
  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Navbar */}
      <Navbar
        user={user}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggle={() => setSidebarOpen(!sidebarOpen)}
          userRole={user.role}
        />

        {/* Main Content Area */}
        <main
          className={cn(
            "flex-1 transition-all duration-500 ease-out",
            sidebarOpen ? "lg:ml-72" : "lg:ml-20"
          )}
        >
          <div className="p-6 pt-20 max-w-7xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="p-6">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
