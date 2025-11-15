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
    try {
        if (!dateString || typeof dateString !== 'string') {
            console.warn('calculateDaysSince: Invalid date string', dateString);
            return 0;
        }

        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('calculateDaysSince: Invalid date format', dateString);
            return 0;
        }

        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Sanity check: if days is unreasonably large, return 0
        if (days > 36500) { // More than 100 years
            console.warn('calculateDaysSince: Unreasonable date difference', dateString, days);
            return 0;
        }

        return days;
    } catch (error) {
        console.error('calculateDaysSince: Error calculating days', dateString, error);
        return 0;
    }
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
    try {
        if (!dateString || typeof dateString !== 'string') {
            console.warn('formatChartDate: Invalid date string', dateString);
            return 'Invalid Date';
        }

        const date = new Date(dateString);

        // Check if date is valid
        if (isNaN(date.getTime())) {
            console.warn('formatChartDate: Invalid date format', dateString);
            return 'Invalid Date';
        }

        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch (error) {
        console.error('formatChartDate: Error formatting date', dateString, error);
        return 'Invalid Date';
    }
};

// Helper function: Format package name for display
export const formatPackageName = (type: string): string => {
    try {
        if (!type || typeof type !== 'string') {
            console.warn('formatPackageName: Invalid type', type);
            return 'Unknown Package';
        }

        return type.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    } catch (error) {
        console.error('formatPackageName: Error formatting package name', type, error);
        return 'Unknown Package';
    }
};

// Helper function: Format points with K/M suffixes
export const formatPoints = (points: string | number): string => {
    try {
        if (points === null || points === undefined) {
            console.warn('formatPoints: Null or undefined points value');
            return '0';
        }

        const num = typeof points === "string" ? parseInt(points) : points;

        // Check if parsing resulted in NaN
        if (isNaN(num)) {
            console.warn('formatPoints: Invalid points value', points);
            return '0';
        }

        // Handle negative numbers
        if (num < 0) {
            console.warn('formatPoints: Negative points value', points);
            return '0';
        }

        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
    } catch (error) {
        console.error('formatPoints: Error formatting points', points, error);
        return '0';
    }
};

// Transform supplier data for chart display
export const transformSupplierData = (
    suppliers: SupplierData[] | null | undefined
): SupplierChartData[] => {
    // Handle null/undefined input
    if (!suppliers || !Array.isArray(suppliers)) {
        console.warn('transformSupplierData: Invalid input, returning empty array', suppliers);
        return [];
    }

    // Handle empty array
    if (suppliers.length === 0) {
        return [];
    }

    try {
        return suppliers
            .filter((s) => {
                // Filter out malformed data
                if (!s || typeof s !== 'object') {
                    console.warn('transformSupplierData: Skipping invalid supplier entry', s);
                    return false;
                }
                if (!s.name || typeof s.name !== 'string') {
                    console.warn('transformSupplierData: Skipping supplier with invalid name', s);
                    return false;
                }
                if (typeof s.hotel_count !== 'number' || s.hotel_count < 0) {
                    console.warn('transformSupplierData: Skipping supplier with invalid hotel_count', s);
                    return false;
                }
                if (!s.last_updated || typeof s.last_updated !== 'string') {
                    console.warn('transformSupplierData: Skipping supplier with invalid last_updated', s);
                    return false;
                }
                return true;
            })
            .map((s) => {
                try {
                    return {
                        name: s.name,
                        hotelCount: s.hotel_count,
                        lastUpdated: s.last_updated,
                        daysSinceUpdate: calculateDaysSince(s.last_updated),
                        freshnessColor: getFreshnessColor(s.last_updated),
                    };
                } catch (error) {
                    console.error('transformSupplierData: Error transforming supplier', s, error);
                    // Return fallback data for this supplier
                    return {
                        name: s.name || 'Unknown',
                        hotelCount: s.hotel_count || 0,
                        lastUpdated: s.last_updated || new Date().toISOString(),
                        daysSinceUpdate: 0,
                        freshnessColor: '#666',
                    };
                }
            })
            .sort((a, b) => b.hotelCount - a.hotelCount);
    } catch (error) {
        console.error('transformSupplierData: Critical error during transformation', error);
        return [];
    }
};

// Transform time series data for line charts
export const transformTimeSeriesData = (
    timeSeries: TimeSeriesDataPoint[] | null | undefined
): TimeSeriesChartData[] => {
    // Handle null/undefined input
    if (!timeSeries || !Array.isArray(timeSeries)) {
        console.warn('transformTimeSeriesData: Invalid input, returning empty array', timeSeries);
        return [];
    }

    // Handle empty array
    if (timeSeries.length === 0) {
        return [];
    }

    try {
        return timeSeries
            .filter((item) => {
                // Filter out malformed data
                if (!item || typeof item !== 'object') {
                    console.warn('transformTimeSeriesData: Skipping invalid item', item);
                    return false;
                }
                if (!item.date || typeof item.date !== 'string') {
                    console.warn('transformTimeSeriesData: Skipping item with invalid date', item);
                    return false;
                }
                if (typeof item.value !== 'number' || item.value < 0) {
                    console.warn('transformTimeSeriesData: Skipping item with invalid value', item);
                    return false;
                }
                // Validate date format
                const dateObj = new Date(item.date);
                if (isNaN(dateObj.getTime())) {
                    console.warn('transformTimeSeriesData: Skipping item with unparseable date', item);
                    return false;
                }
                return true;
            })
            .map((item) => {
                try {
                    return {
                        date: formatChartDate(item.date),
                        value: item.value,
                        fullDate: item.date,
                    };
                } catch (error) {
                    console.error('transformTimeSeriesData: Error transforming item', item, error);
                    // Return fallback data
                    return {
                        date: 'Invalid',
                        value: 0,
                        fullDate: item.date || new Date().toISOString(),
                    };
                }
            });
    } catch (error) {
        console.error('transformTimeSeriesData: Critical error during transformation', error);
        return [];
    }
};

// Transform package data for chart display
export const transformPackageData = (
    packages: PackageData[] | null | undefined
): PackageChartData[] => {
    // Handle null/undefined input
    if (!packages || !Array.isArray(packages)) {
        console.warn('transformPackageData: Invalid input, returning empty array', packages);
        return [];
    }

    // Handle empty array
    if (packages.length === 0) {
        return [];
    }

    try {
        return packages
            .filter((p) => {
                // Filter out malformed data
                if (!p || typeof p !== 'object') {
                    console.warn('transformPackageData: Skipping invalid package entry', p);
                    return false;
                }
                if (!p.type || typeof p.type !== 'string') {
                    console.warn('transformPackageData: Skipping package with invalid type', p);
                    return false;
                }
                if (!p.description || typeof p.description !== 'string') {
                    console.warn('transformPackageData: Skipping package with invalid description', p);
                    return false;
                }
                if (!p.example_points) {
                    console.warn('transformPackageData: Skipping package with missing example_points', p);
                    return false;
                }
                return true;
            })
            .map((p) => {
                try {
                    const points = parseInt(p.example_points);
                    // Validate parsed points
                    if (isNaN(points) || points < 0) {
                        console.warn('transformPackageData: Invalid points value, using 0', p);
                        return {
                            type: formatPackageName(p.type),
                            description: p.description,
                            points: 0,
                            formattedPoints: '0',
                        };
                    }
                    return {
                        type: formatPackageName(p.type),
                        description: p.description,
                        points,
                        formattedPoints: formatPoints(p.example_points),
                    };
                } catch (error) {
                    console.error('transformPackageData: Error transforming package', p, error);
                    // Return fallback data
                    return {
                        type: p.type || 'Unknown',
                        description: p.description || 'No description',
                        points: 0,
                        formattedPoints: '0',
                    };
                }
            })
            .sort((a, b) => b.points - a.points);
    } catch (error) {
        console.error('transformPackageData: Critical error during transformation', error);
        return [];
    }
};
