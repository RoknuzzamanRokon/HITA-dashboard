/**
 * Recent Transactions Component
 * Displays recent bookings, point allocations, and user activities
 */

"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import {
  CreditCard,
  Users,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Coins,
} from "lucide-react";

interface Transaction {
  id: string;
  type: "booking" | "points" | "user_activity" | "payment";
  title: string;
  description: string;
  amount?: number;
  points?: number;
  status: "success" | "pending" | "failed";
  timestamp: string;
  user?: string;
}

interface RecentTransactionsProps {
  isEnabled?: boolean;
  limit?: number;
}

export const RecentTransactions: React.FC<RecentTransactionsProps> = ({
  isEnabled = true,
  limit = 10,
}) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  const getMockTransactions = (): Transaction[] => {
    const now = new Date();
    return [
      {
        id: "1",
        type: "booking",
        title: "New Hotel Booking",
        description: "Deluxe Room - 3 nights",
        amount: 450,
        status: "success",
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString(),
        user: "john.doe@example.com",
      },
      {
        id: "2",
        type: "points",
        title: "Points Allocated",
        description: "Monthly package assigned",
        points: 5000,
        status: "success",
        timestamp: new Date(now.getTime() - 15 * 60000).toISOString(),
        user: "jane.smith@example.com",
      },
      {
        id: "3",
        type: "user_activity",
        title: "New User Registration",
        description: "General user account created",
        status: "success",
        timestamp: new Date(now.getTime() - 25 * 60000).toISOString(),
        user: "newuser@example.com",
      },
      {
        id: "4",
        type: "payment",
        title: "Payment Received",
        description: "Booking confirmation payment",
        amount: 320,
        status: "success",
        timestamp: new Date(now.getTime() - 35 * 60000).toISOString(),
        user: "customer@example.com",
      },
      {
        id: "5",
        type: "booking",
        title: "Booking Cancelled",
        description: "Suite Room - Refund processed",
        amount: -680,
        status: "failed",
        timestamp: new Date(now.getTime() - 45 * 60000).toISOString(),
        user: "user@example.com",
      },
      {
        id: "6",
        type: "points",
        title: "Points Redeemed",
        description: "Used for booking discount",
        points: -2000,
        status: "success",
        timestamp: new Date(now.getTime() - 55 * 60000).toISOString(),
        user: "member@example.com",
      },
      {
        id: "7",
        type: "payment",
        title: "Payment Pending",
        description: "Awaiting confirmation",
        amount: 550,
        status: "pending",
        timestamp: new Date(now.getTime() - 65 * 60000).toISOString(),
        user: "guest@example.com",
      },
      {
        id: "8",
        type: "user_activity",
        title: "Profile Updated",
        description: "User information modified",
        status: "success",
        timestamp: new Date(now.getTime() - 75 * 60000).toISOString(),
        user: "activeuser@example.com",
      },
    ];
  };

  const getTransactionIcon = (type: Transaction["type"]) => {
    switch (type) {
      case "booking":
        return <CreditCard className="w-5 h-5" />;
      case "points":
        return <Coins className="w-5 h-5" />;
      case "user_activity":
        return <Users className="w-5 h-5" />;
      case "payment":
        return <TrendingUp className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: Transaction["status"]) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: Transaction["status"]) => {
    switch (status) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800";
      case "pending":
        return "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800";
      case "failed":
        return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800";
    }
  };

  const getTypeColor = (type: Transaction["type"]) => {
    switch (type) {
      case "booking":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400";
      case "points":
        return "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400";
      case "user_activity":
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400";
      case "payment":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400";
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now.getTime() - time.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (!isEnabled) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              Recent Activity
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Latest transactions and updates
            </p>
          </div>
        </div>
        {!loading && (
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span>Live</span>
          </div>
        )}
      </div>

      {/* Loading State */}
      {loading && transactions.length === 0 ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="animate-pulse flex items-center space-x-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-xl"
            >
              <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-lg"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Transactions List */}
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {transactions.map((transaction, index) => (
              <div
                key={transaction.id}
                className={`
                  p-4 rounded-xl border transition-all duration-200 hover:shadow-md
                  ${getStatusColor(transaction.status)}
                  animate-fade-in
                `}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(
                        transaction.type
                      )}`}
                    >
                      {getTransactionIcon(transaction.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100 truncate">
                          {transaction.title}
                        </h4>
                        {getStatusIcon(transaction.status)}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                        {transaction.description}
                      </p>
                      {transaction.user && (
                        <p className="text-xs text-gray-500 dark:text-gray-500 truncate">
                          {transaction.user}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Amount/Points & Time */}
                  <div className="flex flex-col items-end ml-4">
                    {transaction.amount !== undefined && (
                      <div
                        className={`flex items-center space-x-1 font-bold text-sm ${
                          transaction.amount >= 0
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {transaction.amount >= 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        <span>${Math.abs(transaction.amount)}</span>
                      </div>
                    )}
                    {transaction.points !== undefined && (
                      <div
                        className={`flex items-center space-x-1 font-bold text-sm ${
                          transaction.points >= 0
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-orange-600 dark:text-orange-400"
                        }`}
                      >
                        {transaction.points >= 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        <span>{Math.abs(transaction.points)} pts</span>
                      </div>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatTimeAgo(transaction.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          {transactions.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No recent activity</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};
