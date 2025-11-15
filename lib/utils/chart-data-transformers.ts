// TypeScript interfaces for API response data models
export interface SupplierData {
    name: string;
    hotel_count: number;
    last_updated: string;
}

export interface PackageData {
    type: string;
    description: string;
    example_points: string;
}

export interface TimeSeriesDataPoint {
    date: string;
    value: number;
}

export interface DashboardApiResponse {
    platform_overview: {
        total_users: number;
        total_hotels: number;
        total_mappings: number;
        available_suppliers: SupplierData[];
        available_packages: PackageData[];
    };
    activity_metrics: {
        user_logins: {
            total_count: number;
            last_login: string | null;
            time_series: TimeSeriesDataPoint[];
        };
        api_requests: {
            total_count: number;
            time_series: TimeSeriesDataPoint[];
        };
    };
    platform_trends: {
        user_registrations: {
            title: string;
            unit: string;
            data_type: string;
            time_series: TimeSeriesDataPoint[];
        };
    };
}

// TypeScript interfaces for transformed chart data models
export interface SupplierChartData {
    name: string;
    hotelCount: number;
    lastUpdated: string;
    daysSinceUpdate: number;
    freshnessColor: string;
}

export interface TimeSeriesChartData {
    date: string;
    value: number;
    fullDate: string;
}

export interface PackageChartData {
    type: string;
    description: string;
    points: number;
    formattedPoints: string;
}

export interface CombinedActivityData {
    date: string;
    registrations: number;
    logins: number;
    apiRequests: number;
}

// Helper function: Calculate days since a given date
export const calculateDaysSince = (dateString: string): number => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper function: Get color based on data freshness
export const getFreshnessColor = (dateString: string): string => {
    const days = calculateDaysSince(dateString);
    if (days <= 7) return "#10b981"; // green
    if (days <= 30) return "#f59e0b"; // yellow
    return "#ef4444"; // red
};

// Helper function: Format date for chart display
export const formatChartDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// Helper function: Format package name for display
export const formatPackageName = (type: string): string => {
    return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

// Helper function: Format points with K/M suffixes
export const formatPoints = (points: string | number): string => {
    const num = typeof points === "string" ? parseInt(points) : points;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
};

// Transform supplier data for chart display
export const transformSupplierData = (
    suppliers: SupplierData[]
): SupplierChartData[] => {
    return suppliers
        .map((s) => ({
            name: s.name,
            hotelCount: s.hotel_count,
            lastUpdated: s.last_updated,
            daysSinceUpdate: calculateDaysSince(s.last_updated),
            freshnessColor: getFreshnessColor(s.last_updated),
        }))
        .sort((a, b) => b.hotelCount - a.hotelCount);
};

// Transform time series data for line charts
export const transformTimeSeriesData = (
    timeSeries: TimeSeriesDataPoint[]
): TimeSeriesChartData[] => {
    return timeSeries.map((item) => ({
        date: formatChartDate(item.date),
        value: item.value,
        fullDate: item.date,
    }));
};

// Transform package data for chart display
export const transformPackageData = (
    packages: PackageData[]
): PackageChartData[] => {
    return packages
        .map((p) => ({
            type: formatPackageName(p.type),
            description: p.description,
            points: parseInt(p.example_points),
            formattedPoints: formatPoints(p.example_points),
        }))
        .sort((a, b) => b.points - a.points);
};
