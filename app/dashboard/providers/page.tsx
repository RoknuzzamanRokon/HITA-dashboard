"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  MapPin,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Clock,
  Database,
  UserCheck,
} from "lucide-react";
import { useAuth } from "@/lib/contexts/auth-context";
import { ProviderUpdatesApi } from "@/lib/api/provider-updates";
import type {
  HotelMapping,
  UpdatedProvider,
  ProviderIdentityRequest,
  ProviderMappingResponse,
} from "@/lib/api/provider-updates";
import { useMemoryMonitor } from "@/lib/hooks/use-memory-monitor";
import { apiClient } from "@/lib/api/client";

export default function ProviderUpdatePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memory monitoring
  const {
    memoryInfo,
    isLowMemory,
    isHighMemory,
    checkMemoryForOperation,
    getRecommendedLimit,
    clearMemory: clearMemoryHook,
    getWarningMessage,
    usagePercentage,
  } = useMemoryMonitor();

  // State for different sections
  const [allIttids, setAllIttids] = useState<HotelMapping[]>([]);
  const [ittidStats, setIttidStats] = useState<{
    totalSuppliers: number;
    totalIttids: number;
  } | null>(null);
  const [updatedProviders, setUpdatedProviders] = useState<UpdatedProvider[]>(
    []
  );
  const [providerUpdateInfo, setProviderUpdateInfo] = useState<{
    totalHotel: number;
    showHotelsThisPage: number;
    totalPage: number;
    currentPage: number;
  } | null>(null);
  const [providerCurrentPage, setProviderCurrentPage] = useState(1);
  const [providerTotalPages, setProviderTotalPages] = useState(1);

  // Country mapping pagination state
  const [countryCurrentPage, setCountryCurrentPage] = useState(1);
  const [countryTotalPages, setCountryTotalPages] = useState(1);
  const [countryMappingInfo, setCountryMappingInfo] = useState<{
    totalHotel: number;
    supplier: string;
    countryIso: string;
  } | null>(null);
  const [selectedHotel, setSelectedHotel] = useState<any>(null);

  // Memory management states
  const [memoryWarning, setMemoryWarning] = useState<string | null>(null);
  const maxDisplayItems = getRecommendedLimit();

  // Filter states
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("restel");
  const [searchIttid, setSearchIttid] = useState("");
  const [activeSuppliers, setActiveSuppliers] = useState<string[]>([]);
  const [suppliersLoading, setSuppliersLoading] = useState(false);

  // Provider Identity states
  const [providerIdentityName, setProviderIdentityName] = useState("hotelbeds");
  const [providerIdentityId, setProviderIdentityId] = useState("1");
  const [providerIdentityResult, setProviderIdentityResult] =
    useState<any>(null);
  const [lastApiResponse, setLastApiResponse] = useState<any>(null);

  // Provider Mapping states
  const [providerMappingIttid, setProviderMappingIttid] = useState("10000004");
  const [providerMappingResult, setProviderMappingResult] =
    useState<ProviderMappingResponse | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(100); // Start with smaller chunks
  const [totalPages, setTotalPages] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  const [activeTab, setActiveTab] = useState<
    | "all-ittids"
    | "updates"
    | "mapping"
    | "provider-identity"
    | "provider-mapping"
  >("provider-identity");

  useEffect(() => {
    // Set default dates (last 30 days)
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    setToDate(today.toISOString().split("T")[0]);
    setFromDate(thirtyDaysAgo.toISOString().split("T")[0]);

    // Fetch active suppliers on component mount
    fetchActiveSuppliers();
  }, []);

  // Function to get display name for suppliers
  const getSupplierDisplayName = (supplier: string): string => {
    const displayNames: Record<string, string> = {
      booking: "Booking.com",
      expedia: "Expedia",
      agoda: "Agoda",
      hotelbeds: "Hotelbeds",
      tbohotel: "TBO Hotel",
      restel: "Restel",
      ean: "EAN",
      goglobal: "GoGlobal",
      grnconnect: "GRN Connect",
      hotelston: "Hotelston",
      hyperguestdirect: "Hyperguest Direct",
      illusionshotel: "Illusions Hotel",
      innstanttravel: "Innstant Travel",
      itt: "ITT",
      juniperhotel: "Juniper Hotel",
      kiwihotel: "Kiwi Hotel",
      letsflyhotel: "Letsfly Hotel",
      mgholiday: "MG Holiday",
      paximumhotel: "Paxium Hotel",
      ratehawkhotel: "Ratehawk Hotel",
      roomerang: "Roomerang",
      stuba: "Stuba",
      dotw: "DOTW",
    };

    return (
      displayNames[supplier.toLowerCase()] ||
      supplier.charAt(0).toUpperCase() + supplier.slice(1)
    );
  };

  const fetchActiveSuppliers = async () => {
    setSuppliersLoading(true);
    try {
      const response = await apiClient.get<any>(
        "/user/check-active-my-supplier"
      );
      console.log("🔍 Active suppliers response:", response);

      if (response.success && response.data) {
        const suppliers = response.data.on_supplier_list || [];
        setActiveSuppliers(suppliers);

        // Set default supplier to first available one if current selection is not in the list
        if (suppliers.length > 0 && !suppliers.includes(selectedSupplier)) {
          setSelectedSupplier(suppliers[0]);
        }

        console.log(
          `✅ Loaded ${suppliers.length} active suppliers:`,
          suppliers
        );
      } else {
        console.warn("⚠️ Failed to fetch active suppliers:", response.error);
        // Fallback to default suppliers if API fails
        setActiveSuppliers(["restel", "booking", "expedia"]);
      }
    } catch (error) {
      console.error("❌ Error fetching active suppliers:", error);
      // Fallback to default suppliers if API fails
      setActiveSuppliers(["restel", "booking", "expedia"]);
    } finally {
      setSuppliersLoading(false);
    }
  };

  const fetchAllIttids = async (pageToFetch?: number) => {
    setLoading(true);
    setError(null);
    setMemoryWarning(null);

    const targetPage = pageToFetch || currentPage;

    try {
      const response = await ProviderUpdatesApi.getAllIttids({
        page: targetPage,
      });

      if (response.success && response.data) {
        console.log("🔍 Backend response:", response.data);

        // Backend returns AllIttidResponse with ittid_list, convert to HotelMapping format
        const ittidList = response.data.ittid_list || [];
        const totalItems = response.data.total_ittid || ittidList.length;

        // Memory safety check
        if (!checkMemoryForOperation(ittidList.length)) {
          setError(
            `Cannot load ${ittidList.length.toLocaleString()} items. Would exceed memory limit. Try using pagination or filters.`
          );
          return;
        }

        // Implement client-side pagination for memory safety
        const startIndex = (targetPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, ittidList.length);
        const pageItems = ittidList.slice(startIndex, endIndex);

        // Further limit if memory constraints require it
        const memoryLimit = Math.min(pageItems.length, maxDisplayItems);
        const limitedList = pageItems.slice(0, memoryLimit);
        const isMemoryLimited = pageItems.length > maxDisplayItems;

        const hotelMappings: HotelMapping[] = limitedList.map(
          (ittid: string, index: number) => ({
            ittid,
            hotelName: `Hotel ${ittid}`, // Placeholder since backend doesn't return hotel names
            countryCode: "N/A", // Placeholder
            supplier: "N/A", // Placeholder
            status: "active" as const,
            lastUpdated: new Date().toISOString(),
          })
        );

        setAllIttids(hotelMappings);
        setIttidStats({
          totalSuppliers: response.data.total_supplier || 0,
          totalIttids: totalItems,
        });

        // Calculate pagination info based on the full dataset
        const calculatedTotalPages = Math.ceil(ittidList.length / itemsPerPage);
        setTotalPages(calculatedTotalPages);
        setHasMoreData(targetPage < calculatedTotalPages);

        // Update current page if it was passed as parameter
        if (pageToFetch && pageToFetch !== currentPage) {
          setCurrentPage(pageToFetch);
        }

        if (isMemoryLimited) {
          setMemoryWarning(
            `Memory limit active: Showing ${limitedList.length} of ${
              pageItems.length
            } items on page ${targetPage}. Total dataset: ${totalItems.toLocaleString()} items.`
          );
        } else {
          // Show pagination info
          setMemoryWarning(
            `Page ${targetPage} of ${calculatedTotalPages} • Showing ${
              limitedList.length
            } items • Total: ${totalItems.toLocaleString()} items from ${
              response.data.total_supplier
            } suppliers`
          );
        }

        console.log(
          `✅ Loaded ${limitedList.length} ITTIDs from ${response.data.total_supplier} suppliers (limited: ${isMemoryLimited})`
        );

        // Memory monitoring is handled by the hook
      } else {
        setError(response.error?.message || "Failed to fetch ITTID data");
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("memory")) {
        setError(
          "Out of memory error. Try using pagination or filters to reduce data size."
        );
      } else {
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUpdatedProviders = async (pageToFetch?: number) => {
    if (!fromDate || !toDate) {
      setError("Please select both from and to dates");
      return;
    }

    setLoading(true);
    setError(null);

    const targetPage = pageToFetch || providerCurrentPage;

    try {
      const response = await ProviderUpdatesApi.getUpdatedProviderInfo({
        fromDate,
        toDate,
        page: targetPage,
        limitPerPage: itemsPerPage,
      });

      if (response.success && response.data) {
        console.log("🔍 Provider updates response:", response.data);

        // Handle the actual API response structure
        let updates: UpdatedProvider[] = [];
        if (
          response.data.provider_mappings &&
          Array.isArray(response.data.provider_mappings)
        ) {
          updates = response.data.provider_mappings.map((mapping: any) => ({
            ittid: mapping.ittid,
            providerName: mapping.provider_name,
            providerId: mapping.provider_id || "N/A",
            updateDate: new Date().toISOString(), // API doesn't provide update date, using current date
            details: mapping,
          }));
        } else {
          console.warn(
            "⚠️ No provider_mappings found in response:",
            response.data
          );
          updates = [];
        }

        console.log(`✅ Setting ${updates.length} provider updates`);
        console.log(
          `📊 API Info: Page ${response.data.current_page} of ${response.data.total_page}, showing ${response.data.show_hotels_this_page} of ${response.data.total_hotel} total hotels`
        );

        // Store API response info
        setProviderUpdateInfo({
          totalHotel: response.data.total_hotel || 0,
          showHotelsThisPage:
            response.data.show_hotels_this_page || updates.length,
          totalPage: response.data.total_page || 1,
          currentPage: response.data.current_page || 1,
        });

        // Update pagination state
        setProviderCurrentPage(response.data.current_page || targetPage);
        setProviderTotalPages(response.data.total_page || 1);

        // Update current page if it was passed as parameter
        if (pageToFetch && pageToFetch !== providerCurrentPage) {
          setProviderCurrentPage(pageToFetch);
        }

        setUpdatedProviders(updates);
      } else {
        console.error("❌ Provider updates request failed:", response.error);
        setError(
          response.error?.message || "Failed to fetch updated provider data"
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch updates");
    } finally {
      setLoading(false);
    }
  };

  // Memory cleanup function
  const clearMemory = () => {
    setAllIttids([]);
    setUpdatedProviders([]);
    setSelectedHotel(null);
    setMemoryWarning(null);
    setProviderUpdateInfo(null);
    setProviderCurrentPage(1);
    setProviderTotalPages(1);

    // Use the hook's clear memory function
    clearMemoryHook();
  };

  const fetchMappingByCountry = async (pageToFetch?: number) => {
    if (!selectedCountry || !selectedSupplier) {
      setError("Please select both country and supplier");
      return;
    }

    setLoading(true);
    setError(null);
    setMemoryWarning(null);

    const targetPage = pageToFetch || countryCurrentPage;

    try {
      const response = await ProviderUpdatesApi.getBasicInfoByCountry({
        supplier: selectedSupplier,
        country_iso: selectedCountry,
      });

      if (response.success && response.data) {
        console.log("🔍 Country mapping response:", response.data);

        const hotelData = response.data.data || [];
        const totalHotels = response.data.total_hotel || hotelData.length;

        // Memory safety check
        if (!checkMemoryForOperation(hotelData.length)) {
          setError(
            `Cannot load ${hotelData.length.toLocaleString()} items. Would exceed memory limit. Try using pagination or filters.`
          );
          return;
        }

        // Implement client-side pagination for memory safety
        const startIndex = (targetPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, hotelData.length);
        const pageItems = hotelData.slice(startIndex, endIndex);

        // Further limit if memory constraints require it
        const memoryLimit = Math.min(pageItems.length, maxDisplayItems);
        const limitedList = pageItems.slice(0, memoryLimit);
        const isMemoryLimited = pageItems.length > maxDisplayItems;

        // Convert hotel data to HotelMapping format
        const hotelMappings: HotelMapping[] = limitedList.map(
          (hotel: any, index: number) => {
            // Extract ITTID from supplier-specific array (e.g., hotel.restel[0])
            const supplierKey = Object.keys(hotel).find(
              (key) => key === selectedSupplier
            );
            const ittidArray = supplierKey ? hotel[supplierKey] : [];
            const ittid =
              Array.isArray(ittidArray) && ittidArray.length > 0
                ? ittidArray[0]
                : `UNKNOWN_${index}`;

            return {
              ittid,
              hotelName: hotel.name || "Unknown Hotel",
              countryCode: selectedCountry,
              supplier: selectedSupplier,
              status: "active" as const,
              lastUpdated: new Date().toISOString(),
              address: hotel.addr,
              latitude: hotel.lat,
              longitude: hotel.lon,
              propertyType: hotel.ptype,
              photo: hotel.photo,
              starRating: hotel.star,
              vervotech: hotel.vervotech,
              giata: hotel.giata,
            };
          }
        );

        setAllIttids(hotelMappings);

        // Store country mapping info
        setCountryMappingInfo({
          totalHotel: totalHotels,
          supplier: response.data.supplier,
          countryIso: response.data.country_iso,
        });

        // Calculate pagination info based on the full dataset
        const calculatedTotalPages = Math.ceil(hotelData.length / itemsPerPage);
        setCountryCurrentPage(targetPage);
        setCountryTotalPages(calculatedTotalPages);

        // Update current page if it was passed as parameter
        if (pageToFetch && pageToFetch !== countryCurrentPage) {
          setCountryCurrentPage(pageToFetch);
        }

        if (isMemoryLimited) {
          setMemoryWarning(
            `Memory limit active: Showing ${limitedList.length} of ${
              pageItems.length
            } items on page ${targetPage}. Total dataset: ${totalHotels.toLocaleString()} hotels.`
          );
        } else {
          // Show pagination info
          setMemoryWarning(
            `Page ${targetPage} of ${calculatedTotalPages} • Showing ${
              limitedList.length
            } hotels • Total: ${totalHotels.toLocaleString()} hotels in ${selectedCountry} from ${selectedSupplier}`
          );
        }

        console.log(
          `✅ Loaded ${limitedList.length} hotels from ${selectedSupplier} in ${selectedCountry} (limited: ${isMemoryLimited})`
        );
      } else {
        setError(response.error?.message || "Failed to fetch mapping data");
      }
    } catch (err) {
      if (err instanceof Error && err.message.includes("memory")) {
        setError(
          "Out of memory error. Try selecting a smaller country or use filters."
        );
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to fetch mapping data"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const searchHotelByIttid = async () => {
    if (!searchIttid) {
      setError("Please enter an ITTID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await ProviderUpdatesApi.getHotelMappingByIttid({
        ittid: searchIttid,
      });

      if (response.success && response.data) {
        setSelectedHotel(response.data.hotel || null);
      } else {
        setError(response.error?.message || "Failed to fetch hotel mapping");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch hotel data"
      );
    } finally {
      setLoading(false);
    }
  };

  const searchByProviderIdentity = async () => {
    if (!providerIdentityName || !providerIdentityId) {
      setError("Please enter both provider name and provider ID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const request: ProviderIdentityRequest = {
        provider_hotel_identity: [
          {
            provider_name: providerIdentityName,
            provider_id: providerIdentityId,
          },
        ],
      };

      console.log("🔍 Sending provider identity request:", request);
      console.log(
        `🔍 Provider: ${providerIdentityName}, ID: ${providerIdentityId}`
      );

      const response =
        await ProviderUpdatesApi.getHotelMappingByProviderIdentity(request);

      console.log("📡 Provider identity response:", response);

      // Store the raw response for debugging
      setLastApiResponse(response);

      if (response.success) {
        console.log("✅ API call successful, processing data...");

        if (response.data) {
          // The backend returns an array directly, so we need to handle it properly
          const responseData = Array.isArray(response.data)
            ? response.data[0]
            : response.data;
          console.log("✅ Setting provider identity result:", responseData);
          setProviderIdentityResult(responseData);
        } else {
          console.log("⚠️ API call successful but no data returned");
          setError("API call successful but no data was returned");
        }
      } else {
        // console.error("❌ Provider identity request failed:", response);
        // console.error("❌ Error details:", response.error);
        // console.error(
        //   "❌ Full response object:",
        //   JSON.stringify(response, null, 2)
        // );

        // Better error message handling
        let errorMessage = "Failed to fetch provider identity mapping";

        if (response.error?.message) {
          errorMessage = response.error.message;
        } else if (response.error?.status === 404) {
          errorMessage =
            "Cannot find mapping for the requested provider in our system. Please check if the provider name and ID are correct.";
        } else if (response.error?.status) {
          errorMessage = `Server error (${response.error.status}): ${
            response.error.message || "Unknown error"
          }`;
        } else {
          // If we have no error details, show the full response for debugging
          errorMessage = `API request failed. Check console for details. Response: ${JSON.stringify(
            response
          )}`;
        }

        setError(errorMessage);
      }
    } catch (err) {
      console.error("❌ Provider identity request error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch provider identity data"
      );
    } finally {
      setLoading(false);
    }
  };

  const searchProviderMapping = async () => {
    if (!providerMappingIttid) {
      setError("Please enter an ITTID");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log(
        "🔍 Sending provider mapping request for ITTID:",
        providerMappingIttid
      );

      const response = await ProviderUpdatesApi.getProviderMappingByIttid({
        ittid: providerMappingIttid,
      });

      console.log("📡 Provider mapping response:", response);

      if (response.success && response.data) {
        console.log("✅ Setting provider mapping result:", response.data);
        setProviderMappingResult(response.data);
      } else {
        console.error("❌ Provider mapping request failed:", response.error);
        setError(
          response.error?.message || "Failed to fetch provider mapping data"
        );
      }
    } catch (err) {
      console.error("❌ Provider mapping request error:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch provider mapping data"
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "inactive":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Database className="h-4 w-4 text-gray-500" />;
    }
  };

  const getChangeTypeColor = (type: string) => {
    switch (type) {
      case "new":
        return "bg-green-100 text-green-800";
      case "updated":
        return "bg-blue-100 text-blue-800";
      case "deleted":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Provider Updates
            </h1>
            <p className="text-gray-600">
              Manage hotel mappings and track provider updates
            </p>
          </div>

          {/* Memory Management Panel */}
          <div className="bg-gray-50 rounded-lg p-4 min-w-64">
            <h3 className="text-sm font-medium text-gray-900 mb-2">
              Memory Management
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Display limit:</span>
                <span className={isLowMemory ? "text-red-600 font-medium" : ""}>
                  {maxDisplayItems.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Items per page:</span>
                <span>{itemsPerPage}</span>
              </div>
              <div className="flex justify-between">
                <span>Status:</span>
                <span
                  className={isLowMemory ? "text-red-600" : "text-green-600"}
                >
                  {isLowMemory ? "Low Memory" : "Normal"}
                </span>
              </div>
            </div>
            <button
              onClick={clearMemory}
              className="mt-3 w-full px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs"
            >
              Clear Memory
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              {
                id: "provider-identity",
                label: "Provider Identity",
                icon: UserCheck,
              },
              {
                id: "provider-mapping",
                label: "Provider Mapping",
                icon: Search,
              },
              { id: "mapping", label: "Country Mapping", icon: MapPin },
              { id: "all-ittids", label: "All ITTIDs", icon: Database },
              { id: "updates", label: "Provider Updates", icon: RefreshCw },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <tab.icon className="h-4 w-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Memory Warning Display */}
      {memoryWarning && (
        <div
          className={`mb-6 border rounded-lg p-4 ${
            isLowMemory
              ? "bg-red-50 border-red-200"
              : "bg-yellow-50 border-yellow-200"
          }`}
        >
          <div className="flex items-center">
            <AlertCircle
              className={`h-5 w-5 mr-2 ${
                isLowMemory ? "text-red-500" : "text-yellow-500"
              }`}
            />
            <span className={isLowMemory ? "text-red-700" : "text-yellow-700"}>
              {memoryWarning}
            </span>
          </div>
          {isLowMemory && (
            <div className="mt-2 text-sm text-red-600">
              <p>Recommendations:</p>
              <ul className="list-disc list-inside ml-4">
                <li>Use pagination to load smaller chunks</li>
                <li>Apply filters to reduce dataset size</li>
                <li>Close other browser tabs to free memory</li>
                <li>Refresh the page to clear memory</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Country Mapping Tab */}
      {activeTab === "mapping" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Hotel Mapping by Country
                </h2>
                {countryMappingInfo && (
                  <div className="text-sm text-gray-600">
                    <p>
                      Total: {countryMappingInfo.totalHotel.toLocaleString()}{" "}
                      hotels in {countryMappingInfo.countryIso} from{" "}
                      {getSupplierDisplayName(countryMappingInfo.supplier)}
                      {allIttids.length > 0 && ` (showing ${allIttids.length})`}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  disabled={loading}
                >
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                  <option value={250}>250 per page</option>
                  <option value={500}>500 per page</option>
                  {!isLowMemory && <option value={1000}>1000 per page</option>}
                </select>
                <button
                  onClick={() => fetchMappingByCountry()}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <MapPin
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  {loading ? "Loading..." : "Get Mapping"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Supplier
                  </label>
                  <button
                    onClick={fetchActiveSuppliers}
                    disabled={suppliersLoading}
                    className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    title="Refresh suppliers list"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${
                        suppliersLoading ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={suppliersLoading}
                >
                  {suppliersLoading ? (
                    <option value="">Loading suppliers...</option>
                  ) : activeSuppliers.length > 0 ? (
                    activeSuppliers.map((supplier) => (
                      <option key={supplier} value={supplier}>
                        {getSupplierDisplayName(supplier)}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="restel">Restel</option>
                      <option value="booking">Booking.com</option>
                      <option value="expedia">Expedia</option>
                    </>
                  )}
                </select>
                {activeSuppliers.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {activeSuppliers.length} active suppliers loaded
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country ISO Code
                </label>
                <input
                  type="text"
                  placeholder="e.g., TH, US, GB"
                  value={selectedCountry}
                  onChange={(e) =>
                    setSelectedCountry(e.target.value.toUpperCase())
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {allIttids.length > 0 && (
              <div className="space-y-4">
                {/* Performance info */}
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Displaying {allIttids.length.toLocaleString()} hotels
                  </span>
                  <span className="text-gray-500">
                    Memory: {memoryInfo ? `${usagePercentage}%` : "N/A"}
                  </span>
                </div>

                <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supplier Id
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Hotel Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Star Rating
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Supplier
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allIttids.slice(0, itemsPerPage).map((hotel, index) => (
                        <tr
                          key={`${hotel.ittid}-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {hotel.ittid}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              {hotel.photo && (
                                <img
                                  src={hotel.photo}
                                  alt={hotel.hotelName}
                                  className="h-8 w-8 rounded object-cover mr-2"
                                  onError={(e) => {
                                    (
                                      e.target as HTMLImageElement
                                    ).style.display = "none";
                                  }}
                                />
                              )}
                              <span>{hotel.hotelName}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {hotel.propertyType || "N/A"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              {hotel.starRating ? (
                                <>
                                  <span>{hotel.starRating}</span>
                                  <span className="text-yellow-400 ml-1">
                                    ★
                                  </span>
                                </>
                              ) : (
                                "N/A"
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {getSupplierDisplayName(hotel.supplier)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination controls */}
                {countryTotalPages > 1 && (
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      Showing {allIttids.length} items on page{" "}
                      {countryCurrentPage} of {countryTotalPages}
                      <br />
                      Total:{" "}
                      {countryMappingInfo?.totalHotel.toLocaleString() ||
                        0}{" "}
                      hotels
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newPage = Math.max(1, countryCurrentPage - 1);
                          fetchMappingByCountry(newPage);
                        }}
                        disabled={countryCurrentPage === 1 || loading}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                        Page {countryCurrentPage} of {countryTotalPages}
                      </span>
                      <button
                        onClick={() => {
                          const newPage = Math.min(
                            countryTotalPages,
                            countryCurrentPage + 1
                          );
                          fetchMappingByCountry(newPage);
                        }}
                        disabled={
                          countryCurrentPage >= countryTotalPages || loading
                        }
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                      >
                        {loading ? "Loading..." : "Next"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick page navigation */}
                {countryTotalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <span className="text-sm text-gray-600">Jump to page:</span>
                    <input
                      type="number"
                      min="1"
                      max={countryTotalPages}
                      value={countryCurrentPage}
                      onChange={(e) => {
                        const page = Math.max(
                          1,
                          Math.min(
                            countryTotalPages,
                            parseInt(e.target.value) || 1
                          )
                        );
                        setCountryCurrentPage(page);
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                      disabled={loading}
                    />
                    <button
                      onClick={() => fetchMappingByCountry(countryCurrentPage)}
                      disabled={loading}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      Go
                    </button>
                  </div>
                )}
              </div>
            )}

            {!loading &&
              allIttids.length === 0 &&
              selectedCountry &&
              selectedSupplier && (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No hotels found</p>
                  <p className="text-sm">
                    No hotels found for{" "}
                    {getSupplierDisplayName(selectedSupplier)} in{" "}
                    {selectedCountry}. Try a different country code or supplier.
                  </p>
                </div>
              )}
          </div>
        </div>
      )}

      {/* All ITTIDs Tab */}
      {activeTab === "all-ittids" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  All ITTID Records
                </h2>
                {ittidStats && (
                  <div className="text-sm text-gray-600">
                    <p>
                      Total: {ittidStats.totalIttids.toLocaleString()} ITTIDs
                      from {ittidStats.totalSuppliers} suppliers
                      {allIttids.length > 0 && ` (showing ${allIttids.length})`}
                    </p>
                    {isLowMemory && (
                      <p className="text-red-600 font-medium">
                        ⚠️ Memory limit active - showing reduced dataset
                      </p>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  disabled={loading}
                >
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                  <option value={250}>250 per page</option>
                  <option value={500}>500 per page</option>
                  {!isLowMemory && <option value={1000}>1000 per page</option>}
                </select>
                <button
                  onClick={() => fetchAllIttids()}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  {loading ? "Loading..." : "Fetch All ITTIDs"}
                </button>
              </div>
            </div>

            {allIttids.length > 0 && (
              <div className="space-y-4">
                {/* Performance info */}
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Displaying {allIttids.length.toLocaleString()} items
                  </span>
                  <span className="text-gray-500">
                    Memory: {memoryInfo ? `${usagePercentage}%` : "N/A"}
                  </span>
                </div>

                <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ITTID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allIttids.slice(0, itemsPerPage).map((hotel, index) => (
                        <tr
                          key={`${hotel.ittid}-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {hotel.ittid}
                          </td>

                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            <div className="flex items-center">
                              {getStatusIcon(hotel.status)}
                              <span className="ml-2 capitalize">
                                {hotel.status}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(hotel.lastUpdated).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination controls */}
                {ittidStats && ittidStats.totalIttids > itemsPerPage && (
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      Showing {allIttids.length} items on page {currentPage} of{" "}
                      {totalPages}
                      <br />
                      Total: {ittidStats.totalIttids.toLocaleString()} items
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newPage = Math.max(1, currentPage - 1);
                          fetchAllIttids(newPage);
                        }}
                        disabled={currentPage === 1 || loading}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                        Page {currentPage} of {totalPages}
                      </span>
                      <button
                        onClick={() => {
                          const newPage = Math.min(totalPages, currentPage + 1);
                          fetchAllIttids(newPage);
                        }}
                        disabled={
                          currentPage >= totalPages || loading || !hasMoreData
                        }
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                      >
                        {loading ? "Loading..." : "Next"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick page navigation */}
                {ittidStats && totalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <span className="text-sm text-gray-600">Jump to page:</span>
                    <input
                      type="number"
                      min="1"
                      max={totalPages}
                      value={currentPage}
                      onChange={(e) => {
                        const page = Math.max(
                          1,
                          Math.min(totalPages, parseInt(e.target.value) || 1)
                        );
                        setCurrentPage(page);
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                      disabled={loading}
                    />
                    <button
                      onClick={() => fetchAllIttids(currentPage)}
                      disabled={loading}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      Go
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Provider Updates Tab */}
      {activeTab === "updates" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Provider Updates
                </h2>
                {providerUpdateInfo && (
                  <div className="text-sm text-gray-600">
                    <p>
                      Total: {providerUpdateInfo.totalHotel.toLocaleString()}{" "}
                      hotels from provider mappings
                      {updatedProviders.length > 0 &&
                        ` (showing ${updatedProviders.length})`}
                    </p>
                    <p className="text-xs text-gray-500">
                      Date range: {fromDate} to {toDate}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                  disabled={loading}
                >
                  <option value={50}>50 per page</option>
                  <option value={100}>100 per page</option>
                  <option value={250}>250 per page</option>
                  <option value={500}>500 per page</option>
                  {!isLowMemory && <option value={1000}>1000 per page</option>}
                </select>
                <button
                  onClick={() => fetchUpdatedProviders()}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <Calendar
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  {loading ? "Loading..." : "Get Updates"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {updatedProviders.length > 0 ? (
              <div className="space-y-4">
                {/* Performance info */}
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Displaying {updatedProviders.length.toLocaleString()} items
                  </span>
                  <span className="text-gray-500">
                    Memory: {memoryInfo ? `${usagePercentage}%` : "N/A"}
                  </span>
                </div>

                <div className="overflow-x-auto max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ITTID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Provider
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Provider ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Update Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {updatedProviders.map((update, index) => (
                        <tr
                          key={`${update.ittid}-${index}`}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {update.ittid}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {update.providerName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {update.providerId}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(update.updateDate).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination controls */}
                {providerTotalPages > 1 && (
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-700">
                      Showing {updatedProviders.length} items on page{" "}
                      {providerCurrentPage} of {providerTotalPages}
                      <br />
                      Total:{" "}
                      {providerUpdateInfo?.totalHotel.toLocaleString() ||
                        0}{" "}
                      items
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const newPage = Math.max(1, providerCurrentPage - 1);
                          fetchUpdatedProviders(newPage);
                        }}
                        disabled={providerCurrentPage === 1 || loading}
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                      >
                        Previous
                      </button>
                      <span className="px-3 py-1 text-sm bg-gray-100 rounded">
                        Page {providerCurrentPage} of {providerTotalPages}
                      </span>
                      <button
                        onClick={() => {
                          const newPage = Math.min(
                            providerTotalPages,
                            providerCurrentPage + 1
                          );
                          fetchUpdatedProviders(newPage);
                        }}
                        disabled={
                          providerCurrentPage >= providerTotalPages || loading
                        }
                        className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 hover:bg-gray-50"
                      >
                        {loading ? "Loading..." : "Next"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Quick page navigation */}
                {providerTotalPages > 1 && (
                  <div className="flex justify-center items-center gap-2 mt-4">
                    <span className="text-sm text-gray-600">Jump to page:</span>
                    <input
                      type="number"
                      min="1"
                      max={providerTotalPages}
                      value={providerCurrentPage}
                      onChange={(e) => {
                        const page = Math.max(
                          1,
                          Math.min(
                            providerTotalPages,
                            parseInt(e.target.value) || 1
                          )
                        );
                        setProviderCurrentPage(page);
                      }}
                      className="w-16 px-2 py-1 border border-gray-300 rounded text-sm text-center"
                      disabled={loading}
                    />
                    <button
                      onClick={() => fetchUpdatedProviders(providerCurrentPage)}
                      disabled={loading}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      Go
                    </button>
                  </div>
                )}
              </div>
            ) : (
              !loading && (
                <div className="text-center py-8 text-gray-500">
                  <Database className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">
                    No provider updates found
                  </p>
                  <p className="text-sm">
                    Try selecting different dates or check if there are any
                    updates available for the selected period.
                  </p>
                  {fromDate && toDate && (
                    <p className="text-xs mt-2">
                      Searched from {fromDate} to {toDate}
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      )}

      {/* Provider Identity Tab */}
      {activeTab === "provider-identity" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Provider Identity Mapping
                </h2>
                <p className="text-sm text-gray-600">
                  Search hotel mapping using provider name and ID
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={searchByProviderIdentity}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  <UserCheck
                    className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                  />
                  {loading ? "Searching..." : "Search"}
                </button>
                <button
                  onClick={() => {
                    setProviderIdentityResult(null);
                    setProviderMappingResult(null);
                    setError(null);
                    setLastApiResponse(null);
                  }}
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Provider Name
                  </label>
                  <button
                    onClick={fetchActiveSuppliers}
                    disabled={suppliersLoading}
                    className="text-xs text-blue-600 hover:text-blue-800 disabled:opacity-50"
                    title="Refresh suppliers list"
                  >
                    <RefreshCw
                      className={`h-3 w-3 ${
                        suppliersLoading ? "animate-spin" : ""
                      }`}
                    />
                  </button>
                </div>
                <select
                  value={providerIdentityName}
                  onChange={(e) => setProviderIdentityName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={suppliersLoading}
                >
                  {suppliersLoading ? (
                    <option value="">Loading suppliers...</option>
                  ) : activeSuppliers.length > 0 ? (
                    activeSuppliers.map((supplier) => (
                      <option key={supplier} value={supplier}>
                        {getSupplierDisplayName(supplier)}
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="agoda">Agoda</option>
                      <option value="booking">Booking.com</option>
                      <option value="expedia">Expedia</option>
                      <option value="restel">Restel</option>
                      <option value="hotelbeds">Hotelbeds</option>
                    </>
                  )}
                </select>
                {activeSuppliers.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    {activeSuppliers.length} active suppliers loaded
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provider ID
                </label>
                <input
                  type="text"
                  placeholder="e.g., 1134459"
                  value={providerIdentityId}
                  onChange={(e) => setProviderIdentityId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the provider's internal hotel ID
                </p>
              </div>
            </div>

            {/* Results Display */}
            {providerIdentityResult && (
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Mapping Results
                  </h3>
                  <span className="text-sm text-gray-500">
                    Provider: {getSupplierDisplayName(providerIdentityName)} |
                    ID: {providerIdentityId}
                  </span>
                </div>

                {/* If the result has structured data, display it in a more user-friendly way */}
                {providerIdentityResult.provider_mappings &&
                  Array.isArray(providerIdentityResult.provider_mappings) && (
                    <div className="overflow-x-auto border border-gray-200 rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              ITTID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Provider Mapping ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Provider
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Provider ID
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Created At
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {providerIdentityResult.provider_mappings.map(
                            (mapping: any, index: number) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {mapping.ittid || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {mapping.provider_mapping_id || "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {getSupplierDisplayName(
                                    mapping.provider_name ||
                                      providerIdentityName
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {mapping.provider_id || providerIdentityId}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {mapping.created_at
                                    ? new Date(
                                        mapping.created_at
                                      ).toLocaleDateString()
                                    : "N/A"}
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}
              </div>
            )}

            {!loading &&
              !providerIdentityResult &&
              providerIdentityName &&
              providerIdentityId && (
                <div className="text-center py-8 text-gray-500">
                  <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No results yet</p>
                  <p className="text-sm">
                    Click "Search" to find hotel mapping for{" "}
                    {getSupplierDisplayName(providerIdentityName)} ID:{" "}
                    {providerIdentityId}
                  </p>
                </div>
              )}

            {!providerIdentityName || !providerIdentityId ? (
              <div className="text-center py-8 text-gray-500">
                <UserCheck className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Provider Identity Search</p>
                <p className="text-sm">
                  Enter both provider name and provider ID to search for hotel
                  mappings
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Provider Mapping Tab */}
      {activeTab === "provider-mapping" && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Provider Mapping by ITTID
                </h2>
                <p className="text-sm text-gray-600">
                  Get comprehensive provider mapping information for a specific
                  ITTID
                </p>
              </div>
              <button
                onClick={searchProviderMapping}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                <Search
                  className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`}
                />
                {loading ? "Searching..." : "Search"}
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ITTID
              </label>
              <input
                type="text"
                placeholder="e.g., 10000004"
                value={providerMappingIttid}
                onChange={(e) => setProviderMappingIttid(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter the ITTID to get all provider mappings
              </p>
            </div>

            {/* Results Display */}
            {providerMappingResult && (
              <div className="mt-6 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    Mapping Results
                  </h3>
                  <span className="text-sm text-gray-500">
                    ITTID: {providerMappingResult.ittid} |{" "}
                    {providerMappingResult.total_supplier} Suppliers
                  </span>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <Database className="h-8 w-8 text-blue-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-blue-900">
                          ITTID
                        </p>
                        <p className="text-lg font-bold text-blue-700">
                          {providerMappingResult.ittid}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <UserCheck className="h-8 w-8 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-green-900">
                          Total Suppliers
                        </p>
                        <p className="text-lg font-bold text-green-700">
                          {providerMappingResult.total_supplier}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <MapPin className="h-8 w-8 text-purple-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-purple-900">
                          Active Mappings
                        </p>
                        <p className="text-lg font-bold text-purple-700">
                          {providerMappingResult.provider_mappings.length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Provider List */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Available Providers:
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {providerMappingResult.provider_list.map(
                      (provider, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {getSupplierDisplayName(provider)}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* Provider Mappings Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Provider Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Provider ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {providerMappingResult.provider_mappings.map(
                        (mapping, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              <div className="flex items-center">
                                <UserCheck className="h-4 w-4 text-green-500 mr-2" />
                                {getSupplierDisplayName(mapping.provider_name)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <code className="bg-gray-100 px-2 py-1 rounded text-xs">
                                {mapping.provider_id}
                              </code>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(
                                mapping.updated_at
                              ).toLocaleDateString()}{" "}
                              {new Date(
                                mapping.updated_at
                              ).toLocaleTimeString()}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!loading && !providerMappingResult && providerMappingIttid && (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No results yet</p>
                <p className="text-sm">
                  Click "Search" to find provider mappings for ITTID:{" "}
                  {providerMappingIttid}
                </p>
              </div>
            )}

            {!providerMappingIttid && (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Provider Mapping Search</p>
                <p className="text-sm">
                  Enter an ITTID to get comprehensive provider mapping
                  information
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
