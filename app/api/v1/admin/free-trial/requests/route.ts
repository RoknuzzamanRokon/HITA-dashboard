/**
 * Admin Free Trial Requests API Endpoint (Backend API Integration)
 * Proxies requests to backend API at http://localhost:8001
 */

import { NextRequest, NextResponse } from "next/server";

// Get backend API URL from environment
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "v1.0";

export async function GET(request: NextRequest) {
    try {
        // In production, verify JWT token here
        const authHeader = request.headers.get("authorization");

        // Mock authentication check
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unauthorized",
                    message: "Missing or invalid authentication token",
                },
                { status: 401 }
            );
        }

        // Get query parameters
        const searchParams = request.nextUrl.searchParams;
        const queryString = searchParams.toString();

        console.log("🔄 Fetching admin requests from backend API");

        // Build backend URL with query parameters
        const backendUrl = `${BACKEND_API_URL}/${API_VERSION}/free-trial/requests${queryString ? `?${queryString}` : ""}`;

        // Forward request to backend API
        const backendResponse = await fetch(backendUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                // Forward authorization header to backend
                "Authorization": authHeader,
            },
        });

        const backendData = await backendResponse.json();

        console.log("📥 Backend response:", backendData);

        if (!backendResponse.ok) {
            return NextResponse.json(
                {
                    success: false,
                    error: backendData.error || "Failed to fetch requests",
                    message: backendData.message || "Unable to fetch requests",
                },
                { status: backendResponse.status }
            );
        }

        // Pass through the backend response as-is
        // Backend format: { total, skip, limit, data: [...] }
        return NextResponse.json(backendData, { status: 200 });
    } catch (error: any) {
        console.error("❌ Error fetching trial requests:", error);

        if (error.code === "ECONNREFUSED" || error.message.includes("fetch failed")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Backend API unavailable",
                    message: "Unable to connect to backend server at " + BACKEND_API_URL,
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
                message: "Unable to fetch requests",
            },
            { status: 500 }
        );
    }
}
