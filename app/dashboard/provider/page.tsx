"use client";

// Alias route to present Providers dashboard under /dashboard/provider
// Reuse the existing dashboard providers page component
import ProvidersDashboardPage from "../providers/page";

export default function DashboardProviderAlias() {
  return <ProvidersDashboardPage />;
}