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
import { useLayout } from "@/lib/contexts/layout-context";

interface RootLayoutProps {
  children: React.ReactNode;
}

export function RootLayout({ children }: RootLayoutProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useLayout();
  const [mounted, setMounted] = useState(false);

  // Handle initial client-side rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--bg-primary))]">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 dark:border-blue-400"></div>
          <p className="text-blue-600 dark:text-blue-400 font-medium">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  // Don't render layout for unauthenticated users
  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg-primary))] transition-colors duration-300">
      {/* Navbar */}
      <Navbar user={user} onToggleSidebar={toggleSidebar} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onToggle={toggleSidebar}
          userRole={user.role}
        />

        {/* Main Content Area */}
        <main
          className={cn(
            "flex-1 transition-all duration-500 ease-out",
            sidebarOpen ? "lg:ml-72" : "lg:ml-20",
          )}
        >
          <div className="p-1 pt-20 mx-auto">
            <div className="bg-[rgb(var(--bg-secondary))] rounded-xl shadow-[var(--shadow-sm)] border border-[rgb(var(--border-primary))]">
              <div className="p-6">{children}</div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
