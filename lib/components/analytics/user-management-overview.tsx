/**
 * User Management Overview Component
 * Displays user management analytics
 */

"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "@/lib/components/ui/card";
import { Users } from "lucide-react";

interface UserManagementData {
  user_lifecycle?: {
    new_users_30d: number;
    activation_rate: number;
    user_growth_rate: number;
  };
  recent_activity?: {
    api_keys_issued: number;
  };
}

interface UserManagementOverviewProps {
  data?: UserManagementData;
  loading?: boolean;
}

export function UserManagementOverview({
  data,
  loading = false,
}: UserManagementOverviewProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            User Management Overview
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

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-gray-900">
            User Management Overview
          </h3>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <h3 className="text-lg font-semibold text-gray-900">
          User Management Overview
        </h3>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.user_lifecycle && (
            <>
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-900">
                  {data.user_lifecycle.new_users_30d}
                </div>
                <div className="text-sm text-blue-700">New Users (30d)</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-900">
                  {data.user_lifecycle.activation_rate.toFixed(1)}%
                </div>
                <div className="text-sm text-green-700">Activation Rate</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-900">
                  {data.user_lifecycle.user_growth_rate.toFixed(1)}%
                </div>
                <div className="text-sm text-purple-700">Growth Rate</div>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
