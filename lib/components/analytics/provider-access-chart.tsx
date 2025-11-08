/**
 * Provider Access Chart Component
 * Displays provider access analytics
 */

"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";
import { Building2 } from "lucide-react";

interface ProviderAccessData {
  provider_access?: {
    total_providers: number;
    active_providers: number;
  };
}

interface ProviderAccessChartProps {
  data?: ProviderAccessData;
  loading?: boolean;
}

export function ProviderAccessChart({
  data,
  loading = false,
}: ProviderAccessChartProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            Provider Access
          </h3>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || !data.provider_access) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            Provider Access
          </h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Building2 className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No provider data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">Provider Access</h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-900">
              {data.provider_access.total_providers}
            </div>
            <div className="text-sm text-blue-700">Total Providers</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-900">
              {data.provider_access.active_providers}
            </div>
            <div className="text-sm text-green-700">Active Providers</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
