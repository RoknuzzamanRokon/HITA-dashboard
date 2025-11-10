/**
 * Supplier Status Component
 * Displays active/inactive supplier information from the API
 */

"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api/client";
import { Badge } from "@/lib/components/ui/badge";
import { CheckCircle, XCircle, Activity, AlertCircle } from "lucide-react";

interface SupplierData {
  active_supplier: number;
  total_on_supplier: number;
  total_off_supplier: number;
  off_supplier_list: string[];
  on_supplier_list: string[];
}

export function SupplierStatus() {
  const [supplierData, setSupplierData] = useState<SupplierData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSupplierData();
  }, []);

  const fetchSupplierData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.get<SupplierData>(
        "/user/check-active-my-supplier"
      );

      if (response.success && response.data) {
        setSupplierData(response.data);
      } else {
        setError(response.error?.message || "Failed to load supplier data");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-gray-100 rounded-xl"></div>
            <div className="h-20 bg-gray-100 rounded-xl"></div>
            <div className="h-20 bg-gray-100 rounded-xl"></div>
          </div>
          <div className="h-32 bg-gray-100 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        <div className="flex items-center space-x-3 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      </div>
    );
  }

  if (!supplierData) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900 flex items-center">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
            <Activity className="h-5 w-5 text-blue-600" />
          </div>
          Supplier Status
        </h3>
        <Badge variant="outline" className="text-sm">
          {supplierData.active_supplier} total
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-blue-600">
                Total Suppliers
              </p>
              <p className="text-2xl font-bold text-blue-900">
                {supplierData.active_supplier}
              </p>
            </div>
            <Activity className="h-8 w-8 text-blue-400" />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-green-600">
                Active (ON)
              </p>
              <p className="text-2xl font-bold text-green-900">
                {supplierData.total_on_supplier}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>

        <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-xl border border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-red-600">
                Inactive (OFF)
              </p>
              <p className="text-2xl font-bold text-red-900">
                {supplierData.total_off_supplier}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Active Suppliers List */}
      {supplierData.on_supplier_list.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
            Active Suppliers ({supplierData.total_on_supplier})
          </h4>
          <div className="flex flex-wrap gap-2">
            {supplierData.on_supplier_list.map((supplier, index) => (
              <div
                key={index}
                className="px-3 py-2 bg-green-100 border border-green-300 rounded-lg text-green-800 font-medium text-sm flex items-center space-x-2"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{supplier}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inactive Suppliers List */}
      {supplierData.off_supplier_list.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <XCircle className="h-4 w-4 text-red-600 mr-2" />
            Inactive Suppliers ({supplierData.total_off_supplier})
          </h4>
          <div className="flex flex-wrap gap-2">
            {supplierData.off_supplier_list.map((supplier, index) => (
              <div
                key={index}
                className="px-3 py-2 bg-red-100 border border-red-300 rounded-lg text-red-800 font-medium text-sm flex items-center space-x-2"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>{supplier}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
