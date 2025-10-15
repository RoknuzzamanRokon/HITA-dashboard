/**
 * Root Layout Component with Navbar and Sidebar
 * Provides the main layout structure for authenticated pages
 */

"use client";

import React, { useState } from "react";
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

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render layout for unauthenticated users
  if (!isAuthenticated || !user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
          <div className="p-6 pt-20">{children}</div>
        </main>
      </div>
    </div>
  );
}
