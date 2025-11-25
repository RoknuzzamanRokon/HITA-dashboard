/**
 * Modern Sidebar Component with Glassmorphism Design
 * Premium collapsible navigation sidebar with smooth animations and mobile responsiveness
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronDown, ChevronRight, Menu, X } from "lucide-react";
import { UserRole } from "@/lib/types/auth";
import { cn } from "@/lib/utils";
import {
  getMenuSectionsByRole,
  MenuItem,
  MenuSection,
} from "@/lib/utils/menu-config";
import { useNavigationGuard } from "@/lib/hooks/use-navigation-guard";
import { useTheme } from "@/lib/contexts/theme-context";
import { useAuth } from "@/lib/contexts/auth-context";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
  userRole: UserRole;
  className?: string;
}

interface MenuItemComponentProps {
  item: MenuItem;
  isOpen: boolean;
  isActive: boolean;
  hasChildren: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: () => void;
  onNavigate: () => void;
  level?: number;
}

function MenuItemComponent({
  item,
  isOpen,
  isActive,
  hasChildren,
  isExpanded = false,
  onToggleExpanded,
  onNavigate,
  level = 0,
}: MenuItemComponentProps) {
  const Icon = item.icon;
  const [isHovered, setIsHovered] = useState(false);

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={onToggleExpanded}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className={cn(
            "group flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out relative overflow-hidden",
            "before:absolute before:inset-0 before:rounded-xl before:transition-all before:duration-300",
            isActive
              ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 shadow-lg backdrop-blur-sm border border-blue-200/30"
              : "text-gray-700 hover:text-gray-900",
            !isActive &&
              "hover:bg-white/40 hover:backdrop-blur-sm hover:shadow-md hover:border hover:border-white/30",
            !isOpen && "justify-center px-3",
            level > 0 && "ml-4",
            isHovered && !isActive && "transform scale-105"
          )}
          title={!isOpen ? item.label : undefined}
        >
          {/* Gradient overlay for active state */}
          {isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl" />
          )}

          {/* Hover ripple effect */}
          {isHovered && !isActive && (
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl animate-pulse" />
          )}

          <Icon
            className={cn(
              "h-5 w-5 flex-shrink-0 relative z-10 transition-all duration-300",
              isActive
                ? "text-blue-600"
                : "text-gray-500 group-hover:text-gray-700",
              isOpen && "mr-3",
              isHovered && "transform scale-110"
            )}
          />
          {isOpen && (
            <>
              <span className="truncate flex-1 text-left relative z-10 font-medium">
                {item.label}
              </span>
              {hasChildren && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-all duration-300 relative z-10",
                    isExpanded && "transform rotate-180",
                    isHovered && "transform scale-110"
                  )}
                />
              )}
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <Link
      href={item.path}
      onClick={onNavigate}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "group flex items-center px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ease-out relative overflow-hidden",
        "before:absolute before:inset-0 before:rounded-xl before:transition-all before:duration-300",
        isActive
          ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 shadow-lg backdrop-blur-sm border border-blue-200/30"
          : "text-gray-700 hover:text-gray-900",
        !isActive &&
          "hover:bg-white/40 hover:backdrop-blur-sm hover:shadow-md hover:border hover:border-white/30",
        !isOpen && "justify-center px-3",
        level > 0 && "ml-4",
        isHovered && !isActive && "transform scale-105"
      )}
      title={!isOpen ? item.label : undefined}
    >
      {/* Active state gradient overlay */}
      {isActive && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl" />
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-l-full" />
        </>
      )}

      {/* Hover ripple effect */}
      {isHovered && !isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-xl animate-pulse" />
      )}

      <Icon
        className={cn(
          "h-5 w-5 flex-shrink-0 relative z-10 transition-all duration-300",
          isActive
            ? "text-blue-600"
            : "text-gray-500 group-hover:text-gray-700",
          isOpen && "mr-3",
          isHovered && "transform scale-110"
        )}
      />
      {isOpen && (
        <>
          <span className="truncate relative z-10 font-medium">
            {item.label}
          </span>
          {isActive && (
            <div className="ml-auto w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative z-10 animate-pulse" />
          )}
        </>
      )}
    </Link>
  );
}

export function Sidebar({ isOpen, onClose, onToggle, userRole }: SidebarProps) {
  const pathname = usePathname();
  const { theme } = useTheme();
  const { user } = useAuth();
  const { hasRouteAccess } = useNavigationGuard();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  // Check if user is a demo user
  const isDemoUser = user?.pointBalance === 0 || !user?.pointBalance;

  // Get menu sections filtered by user role
  let menuSections = getMenuSectionsByRole(userRole);

  // Filter out exports for demo users
  if (isDemoUser) {
    menuSections = menuSections.map(section => ({
      ...section,
      items: section.items.filter(item => item.id !== 'exports')
    })).filter(section => section.items.length > 0);
  }

  // Handle responsive behavior
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const isItemActive = (path: string) => {
    if (path === "/dashboard") {
      return pathname === "/" || pathname === "/dashboard";
    }
    return pathname.startsWith(path);
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const handleNavigate = () => {
    // Close sidebar on mobile after navigation
    if (isMobile) {
      onClose();
    }
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isActive = isItemActive(item.path);
    const isExpanded = expandedItems.has(item.id);
    const hasAccess = hasRouteAccess(item.path);

    // Don't render items user doesn't have access to
    if (!hasAccess) {
      return null;
    }

    return (
      <li key={item.id}>
        <MenuItemComponent
          item={item}
          isOpen={isOpen}
          isActive={isActive}
          hasChildren={!!hasChildren}
          isExpanded={isExpanded}
          onToggleExpanded={() => toggleExpanded(item.id)}
          onNavigate={handleNavigate}
          level={level}
        />

        {/* Render children if expanded */}
        {hasChildren && isExpanded && isOpen && (
          <ul className="mt-1 space-y-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </ul>
        )}
      </li>
    );
  };

  const renderMenuSection = (section: MenuSection) => {
    const visibleItems = section.items.filter((item) =>
      hasRouteAccess(item.path)
    );

    if (visibleItems.length === 0) {
      return null;
    }

    return (
      <div key={section.id} className="mb-8">
        {isOpen && (
          <h3 className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 relative">
            <span className="relative z-10">{section.label}</span>
            <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-gray-300/50 via-gray-200/30 to-transparent" />
          </h3>
        )}
        <ul className="space-y-2">
          {visibleItems.map((item) => renderMenuItem(item))}
        </ul>
      </div>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300"
          onClick={onClose}
        />
      )}

      {/* Enhanced Glassmorphism Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] transition-all duration-500 ease-out z-50",
          "backdrop-blur-xl border-r shadow-2xl",
          "before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/10 before:to-transparent before:pointer-events-none",

          // Desktop behavior
          "lg:translate-x-0",
          isOpen ? "lg:w-72" : "lg:w-20",

          // Mobile behavior
          isMobile && isOpen
            ? "w-80 translate-x-0"
            : isMobile && "w-80 -translate-x-full",
          
          theme === 'dark' ? "bg-gray-900/80 border-gray-700" : "bg-white/80 border-white/20",

          // Animation classes
          "transform-gpu will-change-transform"
        )}
        style={{
          background: theme === 'dark'
            ? "linear-gradient(135deg, rgba(17, 24, 39, 0.9) 0%, rgba(17, 24, 39, 0.7) 100%)"
            : "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)",
          boxShadow: theme === 'dark'
            ? "0 25px 45px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(55, 65, 81, 0.3)"
            : "0 25px 45px -12px rgba(0, 0, 0, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.6)",
        }}
      >
        <div className="flex flex-col h-full relative">
          {/* Enhanced Sidebar Header */}
          <div className={cn(
            "flex items-center justify-between p-6 border-b backdrop-blur-sm",
            theme === 'dark' ? "border-gray-700/30 bg-gradient-to-r from-gray-800/20 to-transparent" : "border-white/20 bg-gradient-to-r from-white/20 to-transparent"
          )}>
            {isOpen && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Menu className="h-4 w-4 text-white" />
                </div>
                <h2 className={cn(
                  "text-lg font-bold tracking-tight",
                  theme === 'dark' ? "text-white" : "text-gray-800"
                )}>
                  Navigation
                </h2>
              </div>
            )}

            {/* Toggle Button */}
            <button
              onClick={isMobile ? onClose : onToggle}
              className={cn(
                "p-2 rounded-xl transition-all duration-300 group relative overflow-hidden",
                theme === 'dark'
                  ? "text-gray-300 hover:text-white hover:bg-gray-700/40"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/40",
                "hover:backdrop-blur-sm hover:shadow-lg hover:scale-110",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/50",
                !isOpen && "lg:mx-auto"
              )}
              aria-label={isMobile ? "Close sidebar" : "Toggle sidebar"}
            >
              <div className={cn(
                "absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl",
                theme === 'dark'
                  ? "bg-gradient-to-r from-gray-700/20 to-transparent"
                  : "bg-gradient-to-r from-white/20 to-transparent"
              )} />
              {isMobile ? (
                <X className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:rotate-90" />
              ) : (
                <ChevronLeft
                  className={cn(
                    "h-5 w-5 relative z-10 transition-all duration-300",
                    !isOpen && "rotate-180",
                    "group-hover:scale-110"
                  )}
                />
              )}
            </button>
          </div>

          {/* Enhanced Navigation Menu */}
          <nav className="flex-1 overflow-y-auto py-6 px-4 scrollbar-thin scrollbar-thumb-gray-300/50 scrollbar-track-transparent">
            <div className="space-y-2">
              {menuSections.map((section) => renderMenuSection(section))}
            </div>
          </nav>

          {/* Enhanced Sidebar Footer */}
          <div className="border-t border-white/20 p-6 bg-gradient-to-r from-white/10 to-transparent backdrop-blur-sm">
            {isOpen ? (
              <div className="text-xs text-gray-600 text-center space-y-2">
                <div className="flex items-center justify-center space-x-2 p-2 rounded-lg bg-white/20 backdrop-blur-sm">
                  <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse" />
                  <span className="font-medium">System Online</span>
                </div>
                <div className="text-gray-500 font-medium">
                  Management Panel v1.0.0
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div
                  className="w-3 h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse shadow-lg"
                  title="System Online"
                />
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
