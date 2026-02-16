/**
 * Free Trial Request API Endpoint (Backend API Integration)
 * Proxies requests to backend API at http://localhost:8001
 */

import { NextRequest, NextResponse } from "next/server";

// Get backend API URL from environment
const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "v1.0";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, business_name, email, phone_number, message } = body;

        // Frontend validation (backend will also validate)
        const errors: Record<string, string> = {};

        if (!username || username.length < 3) {
            errors.username = "Username must be at least 3 characters";
        }

        if (!business_name || business_name.length < 2) {
            errors.business_name = "Business name must be at least 2 characters";
        }

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            errors.email = "Please enter a valid email address";
        }

        if (!phone_number || !/^[\d\s\-\+\(\)]+$/.test(phone_number)) {
            errors.phone_number = "Please enter a valid phone number";
        }

        // Check for validation errors
        if (Object.keys(errors).length > 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Validation failed",
                    details: errors,
                },
                { status: 400 }
            );
        }

        // Prepare payload for backend API
        const payload: any = {
            username,
            business_name,
            email,
            phone_number,
        };

        // Only include message if provided
        if (message && message.trim()) {
            payload.message = message;
        }

        console.log("🔄 Forwarding request to backend API:", `${BACKEND_API_URL}/${API_VERSION}/api/free-trial/submit`);
        console.log("📦 Payload:", payload);

        // Forward request to backend API
        const backendResponse = await fetch(
            `${BACKEND_API_URL}/${API_VERSION}/api/free-trial/submit`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            }
        );

        const backendData = await backendResponse.json();

        console.log("📥 Backend response status:", backendResponse.status);
        console.log("📥 Backend response data:", backendData);

        // Handle backend errors
        if (!backendResponse.ok) {
            // Check for duplicate email error
            if (backendResponse.status === 409 ||
                (backendData.error && backendData.error.toLowerCase().includes("already exists"))) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "A trial request already exists for this email",
                    },
                    { status: 409 }
                );
            }

            // Check for validation errors from backend
            if (backendResponse.status === 400 && backendData.details) {
                return NextResponse.json(
                    {
                        success: false,
                        error: "Validation failed",
                        details: backendData.details,
                    },
                    { status: 400 }
                );
            }

            // Generic error
            return NextResponse.json(
                {
                    success: false,
                    error: backendData.error || "Failed to submit request",
                    message: backendData.message || "Unable to process request",
                },
                { status: backendResponse.status }
            );
        }

        console.log("✅ Free trial request saved to database successfully");

        // Return success response
        return NextResponse.json(
            {
                success: true,
                message: "Free trial request submitted successfully",
                data: backendData.data || backendData,
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("❌ Error processing free trial request:", error);

        // Check if it's a connection error
        if (error.code === "ECONNREFUSED" || error.message.includes("fetch failed")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Backend API unavailable",
                    message: "Unable to connect to backend server. Please ensure the backend is running at " + BACKEND_API_URL,
                },
                { status: 503 }
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: "Internal server error",
                message: error.message || "Unable to process request",
            },
            { status: 500 }
        );
    }
}

// GET endpoint to retrieve all requests (proxies to backend)
export async function GET(request: NextRequest) {
    try {
        console.log("🔄 Fetching requests from backend API");

        const backendResponse = await fetch(
            `${BACKEND_API_URL}/${API_VERSION}/api/free-trial/requests`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        const backendData = await backendResponse.json();

        if (!backendResponse.ok) {
            return NextResponse.json(
                {
                    success: false,
                    error: backendData.error || "Failed to fetch requests",
                },
                { status: backendResponse.status }
            );
        }

        return NextResponse.json(backendData, { status: 200 });
    } catch (error: any) {
        console.error("❌ Error fetching requests:", error);

        if (error.code === "ECONNREFUSED" || error.message.includes("fetch failed")) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Backend API unavailable",
                    message: "Unable to connect to backend server",
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
