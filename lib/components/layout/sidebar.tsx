/**
 * Sidebar Component
 * Enhanced collapsible navigation sidebar with role-based menu system
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronDown, ChevronRight } from "lucide-react";
import { UserRole } from "@/lib/types/auth";
import { cn } from "@/lib/utils";
import {
  getMenuSectionsByRole,
  MenuItem,
  MenuSection,
} from "@/lib/utils/menu-config";
import { useNavigationGuard } from "@/lib/hooks/use-navigation-guard";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userRole: UserRole;
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

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={onToggleExpanded}
          className={cn(
            "flex items-center w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
            isActive
              ? "bg-blue-100 text-blue-700"
              : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
            !isOpen && "justify-center",
            level > 0 && "ml-4"
          )}
          title={!isOpen ? item.label : undefined}
        >
          <Icon
            className={cn(
              "h-5 w-5 flex-shrink-0",
              isActive ? "text-blue-700" : "text-gray-500",
              isOpen && "mr-3"
            )}
          />
          {isOpen && (
            <>
              <span className="truncate flex-1 text-left">{item.label}</span>
              {hasChildren && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    isExpanded && "transform rotate-180"
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
      className={cn(
        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
        isActive
          ? "bg-blue-100 text-blue-700 border-r-2 border-blue-700"
          : "text-gray-700 hover:bg-gray-100 hover:text-gray-900",
        !isOpen && "justify-center",
        level > 0 && "ml-4"
      )}
      title={!isOpen ? item.label : undefined}
    >
      <Icon
        className={cn(
          "h-5 w-5 flex-shrink-0",
          isActive ? "text-blue-700" : "text-gray-500",
          isOpen && "mr-3"
        )}
      />
      {isOpen && (
        <>
          <span className="truncate">{item.label}</span>
          {isActive && (
            <div className="ml-auto w-2 h-2 bg-blue-700 rounded-full" />
          )}
        </>
      )}
    </Link>
  );
}

export function Sidebar({ isOpen, onClose, userRole }: SidebarProps) {
  const pathname = usePathname();
  const { hasRouteAccess } = useNavigationGuard();
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Get menu sections filtered by user role
  const menuSections = getMenuSectionsByRole(userRole);

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
    if (window.innerWidth < 1024) {
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
      <div key={section.id} className="mb-6">
        {isOpen && (
          <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            {section.label}
          </h3>
        )}
        <ul className="space-y-1">
          {visibleItems.map((item) => renderMenuItem(item))}
        </ul>
      </div>
    );
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transition-all duration-300 ease-in-out z-50",
          isOpen ? "w-64" : "w-16",
          "lg:translate-x-0",
          !isOpen && "lg:w-16",
          isOpen && "lg:w-64"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar header with toggle */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {isOpen && (
              <h2 className="text-lg font-semibold text-gray-900">
                Navigation
              </h2>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 lg:hidden"
              aria-label="Close sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </div>

          {/* Navigation menu */}
          <nav className="flex-1 overflow-y-auto py-4 px-3">
            {menuSections.map((section) => renderMenuSection(section))}
          </nav>

          {/* Sidebar footer */}
          <div className="border-t border-gray-200 p-4">
            {isOpen ? (
              <div className="text-xs text-gray-500 text-center">
                <div className="flex items-center justify-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                  <span>System Online</span>
                </div>
                <div>Management Panel v1.0.0</div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div
                  className="w-2 h-2 bg-green-500 rounded-full"
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
