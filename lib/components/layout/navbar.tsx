/**
 * Modern Navigation Bar Component
 * Enhanced top navigation with glassmorphism design, notifications, and search
 */

"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Menu,
  Bell,
  User,
  LogOut,
  Settings,
  ChevronDown,
  Search,
  Sun,
  Moon,
  Palette,
  HelpCircle,
  Shield,
  MessageSquare,
  Home,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useTheme } from "@/lib/contexts/theme-context";
import { User as UserType } from "@/lib/types/auth";
import { cn } from "@/lib/utils";

interface NavbarProps {
  user: UserType;
  onToggleSidebar: () => void;
}

export function Navbar({ user, onToggleSidebar }: NavbarProps) {
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Mock notifications data
  const notifications = [
    {
      id: 1,
      title: "New user registered",
      message: "John Doe just signed up",
      time: "2 min ago",
      unread: true,
    },
    {
      id: 2,
      title: "System update",
      message: "Security patch applied successfully",
      time: "1 hour ago",
      unread: true,
    },
    {
      id: 3,
      title: "Backup completed",
      message: "Daily backup finished",
      time: "3 hours ago",
      unread: false,
    },
  ];

  const unreadCount = notifications.filter((n) => n.unread).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setNotificationOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [searchOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case "super_user":
        return "Super Admin";
      case "admin_user":
        return "Admin";
      case "general_user":
        return "User";
      default:
        return role;
    }
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 dark:text-white"
      style={{
        background: theme === 'dark' 
          ? "linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(17, 24, 39, 0.8) 100%)"
          : "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)",
        backdropFilter: "blur(20px)",
        borderBottom: theme === 'dark' 
          ? "1px solid rgba(55, 65, 81, 0.3)" 
          : "1px solid rgba(255, 255, 255, 0.2)",
        boxShadow: theme === 'dark'
          ? "0 8px 32px rgba(0, 0, 0, 0.3)"
          : "0 8px 32px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and sidebar toggle */}
          <div className="flex items-center space-x-4">
            <button
              onClick={onToggleSidebar}
              className={cn(
                "p-2 rounded-xl transition-all duration-300 group relative overflow-hidden",
                theme === 'dark'
                  ? "text-gray-300 hover:text-white hover:bg-gray-700/40"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/40",
                "hover:backdrop-blur-sm hover:shadow-lg hover:scale-110",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              )}
              aria-label="Toggle sidebar"
            >
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl",
                theme === 'dark'
                  ? "bg-gradient-to-r from-gray-700/20 to-transparent"
                  : "bg-gradient-to-r from-white/20 to-transparent"
              )} />
              <Menu className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:rotate-180" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800 tracking-tight">
                Admin Panel
              </h1>
            </div>
          </div>


          {/* Right side - Actions and user menu */}
          <div className="flex items-center space-x-2">
            {/* Mobile Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className={cn(
                "md:hidden p-2 rounded-xl text-gray-600 hover:text-gray-900 transition-all duration-300 group relative overflow-hidden",
                "hover:bg-white/40 hover:backdrop-blur-sm hover:shadow-lg hover:scale-110",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              )}
              aria-label="Search"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              <Search className="h-5 w-5 relative z-10" />
            </button>

            {/* Notifications */}
            <div className="relative" ref={notificationRef}>
              <button
                onClick={() => setNotificationOpen(!notificationOpen)}
                className={cn(
                  "p-2 rounded-xl text-gray-600 hover:text-gray-900 transition-all duration-300 group relative overflow-hidden",
                  "hover:bg-white/40 hover:backdrop-blur-sm hover:shadow-lg hover:scale-110",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                )}
                aria-label="Notifications"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <Bell className="h-5 w-5 relative z-10" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-xs font-bold text-white shadow-lg animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notificationOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border border-white/20 animate-scale-in"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <div className="p-4 border-b border-white/20">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Notifications
                      </h3>
                      {unreadCount > 0 && (
                        <span className="px-2 py-1 text-xs font-medium bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={cn(
                          "p-4 border-b border-white/10 hover:bg-white/20 transition-colors duration-200 cursor-pointer",
                          notification.unread && "bg-blue-50/50"
                        )}
                      >
                        <div className="flex items-start space-x-3">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                              notification.unread
                                ? "bg-blue-500"
                                : "bg-gray-300"
                            )}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 border-t border-white/20">
                    <button className="w-full text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200">
                      View all notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className={cn(
                "p-2 rounded-xl transition-all duration-300 relative overflow-hidden",
                theme === 'dark'
                  ? "text-gray-300 hover:text-white hover:bg-gray-700/40"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/40",
                "hover:backdrop-blur-sm hover:shadow-lg hover:scale-110",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              )}
              aria-label="Toggle theme"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 relative z-10" />
              ) : (
                <Moon className="h-5 w-5 relative z-10" />
              )}
            </button>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={cn(
                  "flex items-center space-x-3 p-2 rounded-xl text-gray-600 hover:text-gray-900 transition-all duration-300 group relative overflow-hidden",
                  "hover:bg-white/40 hover:backdrop-blur-sm hover:shadow-lg hover:scale-105",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                )}
                aria-label="User menu"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl" />
                <div className="flex items-center space-x-2 relative z-10">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <div className="text-sm font-semibold text-gray-900">
                      {user.username}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">
                      {getRoleDisplayName(user.role)}
                    </div>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform duration-300",
                      dropdownOpen && "rotate-180"
                    )}
                  />
                </div>
              </button>

              {/* Enhanced Dropdown menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border border-white/20 animate-scale-in"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.8) 100%)",
                    backdropFilter: "blur(20px)",
                  }}
                >
                  <div className="py-2">
                    {/* User info */}
                    <div className="px-4 py-4 border-b border-white/20">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                          <User className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-900">
                            {user.username}
                          </div>
                          <div className="text-sm text-gray-600">
                            {user.email}
                          </div>
                          <div className="text-xs text-gray-500 mt-1 px-2 py-1 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full inline-block">
                            {getRoleDisplayName(user.role)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                      <button
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-white/40 hover:text-gray-900 transition-all duration-200 group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <User className="h-4 w-4 mr-3 text-gray-500 group-hover:text-blue-500 transition-colors duration-200" />
                        <span className="font-medium">Profile</span>
                      </button>

                      <button
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-white/40 hover:text-gray-900 transition-all duration-200 group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Settings className="h-4 w-4 mr-3 text-gray-500 group-hover:text-blue-500 transition-colors duration-200" />
                        <span className="font-medium">Settings</span>
                      </button>

                      <button
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-white/40 hover:text-gray-900 transition-all duration-200 group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <Palette className="h-4 w-4 mr-3 text-gray-500 group-hover:text-blue-500 transition-colors duration-200" />
                        <span className="font-medium">Appearance</span>
                      </button>

                      <button
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-white/40 hover:text-gray-900 transition-all duration-200 group"
                        onClick={() => setDropdownOpen(false)}
                      >
                        <HelpCircle className="h-4 w-4 mr-3 text-gray-500 group-hover:text-blue-500 transition-colors duration-200" />
                        <span className="font-medium">Help & Support</span>
                      </button>
                    </div>

                    <div className="border-t border-white/20 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50/50 hover:text-red-700 transition-all duration-200 group"
                      >
                        <LogOut className="h-4 w-4 mr-3 group-hover:transform group-hover:translate-x-1 transition-transform duration-200" />
                        <span className="font-medium">Sign out</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {searchOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/60 backdrop-blur-sm border border-white/30 rounded-xl text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              onBlur={() => {
                if (!searchQuery) setSearchOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </nav>
  );
}
