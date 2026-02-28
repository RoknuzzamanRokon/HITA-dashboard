/**
 * Public Navigation Component
 * Shared navigation for all public pages with active link highlighting
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/contexts/auth-context";
import { Globe, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

export function PublicNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const handleLoginClick = () => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  };

  // Check if a link is active
  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(path);
  };

  // Navigation links configuration
  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/blog", label: "Blog" },
    { href: "/pricing", label: "Pricing" },
    { href: "/contact", label: "Contact" },
  ];

  return (
    <nav className="bg-white/95 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              prefetch={true}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-primary-color rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">HotelAPI</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch={true}
                className={cn(
                  "transition-colors font-semibold text-lg",
                  isActive(link.href)
                    ? "text-primary-color"
                    : "text-gray-600 hover:text-primary-color",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/free-trial"
              prefetch={true}
              className={cn(
                "border-2 px-6 py-2 rounded-xl transition-all duration-200 font-semibold",
                isActive("/free-trial")
                  ? "border-primary-color bg-primary-color text-white"
                  : "border-blue-500 text-blue-600 hover:bg-blue-50",
              )}
            >
              Free Trial
            </Link>
            <button
              onClick={handleLoginClick}
              className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
            >
              {isAuthenticated ? "Dashboard" : "Login"}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={true}
                  className={cn(
                    "transition-colors font-semibold",
                    isActive(link.href)
                      ? "text-primary-color"
                      : "text-gray-600 hover:text-primary-color",
                  )}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/free-trial"
                prefetch={true}
                className={cn(
                  "border-2 px-6 py-2 rounded-xl transition-all duration-200 font-semibold text-center",
                  isActive("/free-trial")
                    ? "border-primary-color bg-primary-color text-white"
                    : "border-blue-500 text-blue-600 hover:bg-blue-50",
                )}
                onClick={() => setIsMenuOpen(false)}
              >
                Free Trial
              </Link>
              <button
                onClick={() => {
                  handleLoginClick();
                  setIsMenuOpen(false);
                }}
                className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold text-left shadow-lg hover:shadow-xl"
              >
                {isAuthenticated ? "Dashboard" : "Login"}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
