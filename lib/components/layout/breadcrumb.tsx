/**
 * Breadcrumb Component
 * Navigation breadcrumb with role-based path resolution
 */

"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { getBreadcrumbs } from "@/lib/utils/menu-config";
import { cn } from "@/lib/utils";

interface BreadcrumbProps {
  className?: string;
}

export function Breadcrumb({ className }: BreadcrumbProps) {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user) return null;

  const breadcrumbs = getBreadcrumbs(pathname, user.role);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav
      className={cn("flex items-center space-x-2 text-sm", className)}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const isFirst = index === 0;

          return (
            <li key={crumb.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="h-4 w-4 text-gray-400 mx-2" />
              )}

              {isLast ? (
                <span className="text-gray-900 font-medium flex items-center">
                  {isFirst && <Home className="h-4 w-4 mr-1" />}
                  {crumb.label}
                </span>
              ) : (
                <Link
                  href={crumb.path}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center"
                >
                  {isFirst && <Home className="h-4 w-4 mr-1" />}
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
