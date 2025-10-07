/**
 * Dashboard Layout
 * Wraps all dashboard pages with the root layout including sidebar and navbar
 */

"use client";

import React from "react";
import { RootLayout } from "@/lib/components/layout/root-layout";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return <RootLayout>{children}</RootLayout>;
}
