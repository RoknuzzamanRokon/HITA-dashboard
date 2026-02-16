/**
 * Admin Free Trials Management Page
 * Full-featured admin panel for managing free trial requests
 */

"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/lib/contexts/auth-context";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  Loader2,
  Check,
  X,
  MessageSquare,
  Calendar,
  User,
  Building2,
  Mail,
  Phone,
  Globe,
  AlertCircle,
  RefreshCw,
  FileText,
} from "lucide-react";

interface TrialRequest {
  id: string;
  username: string;
  business_name: string;
  email: string;
  phone_number: string;
  message?: string;
  status: string;
  request_date: string;
  ip_address?: string;
  user_agent?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export default function FreeTrialsAdminPage() {
  const { isAuthenticated, user, token } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState<TrialRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<TrialRequest | null>(
    null,
  );
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<
    "approve" | "reject" | "contact" | null
  >(null);
  const [actionNotes, setActionNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    fetchRequests();
  }, [isAuthenticated, filter]);

  const fetchRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get token from auth context
      const authToken = token || "mock_admin_token";

      const params = new URLSearchParams();
      if (filter !== "all") {
        params.append("status", filter);
      }

      console.log("🔄 Fetching requests with filter:", filter);
      console.log("🔑 Using token:", authToken ? "Token present" : "No token");

      const response = await fetch(
        `/api/v1/admin/free-trial/requests?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        },
      );

      const data = await response.json();
      console.log("📥 Response:", data);

      if (response.ok) {
        // Handle backend response format: { total, skip, limit, data: [...] }
        if (data.data && Array.isArray(data.data)) {
          setRequests(data.data);
        } else if (data.success && data.data && data.data.requests) {
          // Fallback format: { success: true, data: { requests: [...] } }
          setRequests(data.data.requests);
        } else if (Array.isArray(data)) {
          // Fallback format: [...]
          setRequests(data);
        } else if (data.requests) {
          // Fallback format: { requests: [...] }
          setRequests(data.requests);
        } else {
          setRequests([]);
        }
      } else {
        const errorData = data;
        setError(
          errorData.message || errorData.error || "Failed to fetch requests",
        );
      }
    } catch (error: any) {
      console.error("❌ Error fetching requests:", error);
      setError(
        "Unable to connect to backend API. Please ensure the backend is running at http://localhost:8001",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    requestId: string,
    newStatus: string,
    notes: string,
  ) => {
    setActionLoading(true);
    setError(null);
    try {
      // Get backend API URL from environment
      const BACKEND_API_URL =
        process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001";
      const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "v1.0";

      // Get token from auth context
      const authToken = token || "mock_admin_token";

      console.log("🔄 Updating request:", requestId, "to status:", newStatus);
      console.log("🔑 Using token:", authToken ? "Token present" : "No token");

      const response = await fetch(
        `${BACKEND_API_URL}/${API_VERSION}/free-trial/requests/${requestId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({
            status: newStatus,
            notes: notes,
          }),
        },
      );

      const data = await response.json();
      console.log("📥 Update response:", data);

      if (response.ok) {
        setSuccess(`Request ${newStatus} successfully!`);
        setShowActionModal(false);
        setActionNotes("");
        fetchRequests(); // Refresh the list

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(
          data.message ||
            data.error ||
            data.detail ||
            `Failed to ${newStatus} request`,
        );
      }
    } catch (error: any) {
      console.error("❌ Error updating request:", error);
      setError(
        "Unable to connect to backend API. Please ensure the backend is running.",
      );
    } finally {
      setActionLoading(false);
    }
  };

  const openActionModal = (
    request: TrialRequest,
    action: "approve" | "reject" | "contact",
  ) => {
    setSelectedRequest(request);
    setActionType(action);
    setShowActionModal(true);
    setActionNotes("");
    setError(null);
  };

  const handleActionSubmit = () => {
    if (!selectedRequest || !actionType) return;

    const statusMap = {
      approve: "approved",
      reject: "rejected",
      contact: "contacted",
    };

    handleUpdateStatus(selectedRequest.id, statusMap[actionType], actionNotes);
  };

  const openDetailModal = (request: TrialRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const exportToCSV = () => {
    const headers = [
      "ID",
      "Business Name",
      "Username",
      "Email",
      "Phone",
      "Status",
      "Request Date",
      "Message",
    ];
    const rows = filteredRequests.map((r) => [
      r.id,
      r.business_name,
      r.username,
      r.email,
      r.phone_number,
      r.status,
      new Date(r.request_date).toLocaleDateString(),
      r.message || "",
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `free-trial-requests-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      approved: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      active: "bg-blue-100 text-blue-800 border-blue-200",
      expired: "bg-gray-100 text-gray-800 border-gray-200",
    };

    const icons = {
      pending: <Clock className="w-4 h-4" />,
      approved: <CheckCircle className="w-4 h-4" />,
      rejected: <XCircle className="w-4 h-4" />,
      active: <CheckCircle className="w-4 h-4" />,
      expired: <XCircle className="w-4 h-4" />,
    };

    return (
      <span
        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${
          styles[status as keyof typeof styles] || styles.pending
        }`}
      >
        {icons[status as keyof typeof icons]}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredRequests = requests.filter((request) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      request.business_name.toLowerCase().includes(search) ||
      request.email.toLowerCase().includes(search) ||
      request.username.toLowerCase().includes(search)
    );
  });

  const stats = {
    total: requests.length,
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-4 sm:px-6 lg:px-0 py-0">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Free Trial Requests
              </h1>
              <p className="text-gray-600">
                Manage and review free trial applications
              </p>
            </div>
            <button
              onClick={fetchRequests}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              Refresh
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-start">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Total Requests</div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.total}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Pending</div>
            <div className="text-3xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Approved</div>
            <div className="text-3xl font-bold text-green-600">
              {stats.approved}
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="text-sm text-gray-600 mb-1">Rejected</div>
            <div className="text-3xl font-bold text-red-600">
              {stats.rejected}
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by business name, email, or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="active">Active</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No trial requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Business
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {request.business_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {request.username}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {request.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {request.phone_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        <div
                          className="text-sm text-gray-600 truncate"
                          title={request.message}
                        >
                          {request.message || (
                            <span className="text-gray-400 italic">
                              No message
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {new Date(request.request_date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openDetailModal(request)}
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                          {request.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  openActionModal(request, "approve")
                                }
                                className="inline-flex items-center gap-1 text-green-600 hover:text-green-700"
                              >
                                <Check className="w-4 h-4" />
                                Approve
                              </button>
                              <button
                                onClick={() =>
                                  openActionModal(request, "reject")
                                }
                                className="inline-flex items-center gap-1 text-red-600 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedRequest && (
          <div className="fixed inset-0 bg-black/70 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Request Details
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Status Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  {getStatusBadge(selectedRequest.status)}
                </div>

                {/* Business Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Business Information
                  </h3>

                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Business Name</div>
                      <div className="text-base font-medium text-gray-900">
                        {selectedRequest.business_name}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Username</div>
                      <div className="text-base font-medium text-gray-900">
                        {selectedRequest.username}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Email</div>
                      <div className="text-base font-medium text-gray-900">
                        {selectedRequest.email}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Phone Number</div>
                      <div className="text-base font-medium text-gray-900">
                        {selectedRequest.phone_number}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Message */}
                {selectedRequest.message && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Message
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 text-gray-700">
                      {selectedRequest.message}
                    </div>
                  </div>
                )}

                {/* Technical Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Technical Details
                  </h3>

                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Request Date</div>
                      <div className="text-base font-medium text-gray-900">
                        {new Date(
                          selectedRequest.request_date,
                        ).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {selectedRequest.ip_address && (
                    <div className="flex items-start gap-3">
                      <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <div className="text-sm text-gray-600">IP Address</div>
                        <div className="text-base font-medium text-gray-900">
                          {selectedRequest.ip_address}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">Request ID</div>
                      <div className="text-base font-mono text-gray-900 text-sm">
                        {selectedRequest.id}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedRequest.notes && (
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Admin Notes
                    </h3>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-gray-700">
                      {selectedRequest.notes}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                {selectedRequest.status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        openActionModal(selectedRequest, "approve");
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Check className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        setShowDetailModal(false);
                        openActionModal(selectedRequest, "reject");
                      }}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <X className="w-5 h-5" />
                      Reject
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Modal (Approve/Reject/Contact) */}
        {showActionModal && selectedRequest && actionType && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">
                    {actionType === "approve" && "Approve Request"}
                    {actionType === "reject" && "Reject Request"}
                    {actionType === "contact" && "Mark as Contacted"}
                  </h2>
                  <button
                    onClick={() => setShowActionModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-sm text-gray-600 mb-1">
                    Business Name
                  </div>
                  <div className="font-medium text-gray-900">
                    {selectedRequest.business_name}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">Email</div>
                  <div className="font-medium text-gray-900">
                    {selectedRequest.email}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    value={actionNotes}
                    onChange={(e) => setActionNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder={`Add notes about this ${actionType}...`}
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  onClick={handleActionSubmit}
                  disabled={actionLoading}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${
                    actionType === "approve"
                      ? "bg-green-600 hover:bg-green-700"
                      : actionType === "reject"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-blue-600 hover:bg-blue-700"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {actionLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {actionType === "approve" && (
                        <Check className="w-5 h-5" />
                      )}
                      {actionType === "reject" && <X className="w-5 h-5" />}
                      {actionType === "contact" && (
                        <MessageSquare className="w-5 h-5" />
                      )}
                      Confirm{" "}
                      {actionType.charAt(0).toUpperCase() + actionType.slice(1)}
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowActionModal(false)}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
