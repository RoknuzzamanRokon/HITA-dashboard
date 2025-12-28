/**
 * Simple mock backend server for testing authentication
 * Run with: node mock-backend-server.js
 */

const http = require("http");
const url = require("url");
const querystring = require("querystring");

// Mock users database
const MOCK_USERS = {
  ursamroko: {
    id: "577935608",
    username: "ursamroko",
    password: "password123",
    role: "general_user",
    email: "ursamroko@example.com",
  },
  admin: {
    id: "1",
    username: "admin",
    password: "admin123",
    role: "super_user",
    email: "admin@example.com",
  },
  demo: {
    id: "2",
    username: "demo",
    password: "demo123",
    role: "admin_user",
    email: "demo@example.com",
  },
};

// Generate JWT-like token (simplified for testing)
function generateJWT(user) {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const payload = {
    sub: user.username,
    user_id: user.id,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    iat: Math.floor(Date.now() / 1000),
    type: "access",
  };

  // Simple base64 encoding (not cryptographically secure, just for testing)
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
    "base64url"
  );
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );
  const signature = "mock_signature_" + Date.now();

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// CORS headers
function setCORSHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

// Parse request body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk.toString();
    });
    req.on("end", () => {
      resolve(body);
    });
    req.on("error", reject);
  });
}

// Create server
const server = http.createServer(async (req, res) => {
  setCORSHeaders(res);

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  console.log(`${new Date().toISOString()} - ${req.method} ${path}`);

  try {
    // Authentication endpoint
    if (path === "/v1.0/auth/token" && req.method === "POST") {
      const body = await parseBody(req);
      const params = querystring.parse(body);

      const { username, password, grant_type } = params;

      console.log(
        `Login attempt: ${username} / ${password ? "***" : "no password"}`
      );

      if (grant_type !== "password") {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "unsupported_grant_type",
            error_description: "Only password grant type is supported",
          })
        );
        return;
      }

      const user = MOCK_USERS[username];
      if (!user || user.password !== password) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "invalid_grant",
            error_description: "Invalid username or password",
          })
        );
        return;
      }

      // Generate tokens
      const accessToken = generateJWT(user);
      const refreshToken = `refresh_${Date.now()}_${user.id}`;

      const response = {
        access_token: accessToken,
        token_type: "bearer",
        expires_in: 86400, // 24 hours
        refresh_token: refreshToken,
      };

      console.log(`✅ Login successful for ${username}`);
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(response));
      return;
    }

    // User profile endpoint (updated path)
    if (path === "/v1.0/user/check-me" && req.method === "GET") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "unauthorized",
            message: "Missing or invalid authorization header",
          })
        );
        return;
      }

      const token = authHeader.substring(7);

      try {
        // Decode JWT payload (simplified)
        const parts = token.split(".");
        if (parts.length !== 3) {
          throw new Error("Invalid token format");
        }

        const payload = JSON.parse(
          Buffer.from(parts[1], "base64url").toString()
        );
        const user = MOCK_USERS[payload.sub];

        if (!user) {
          throw new Error("User not found");
        }

        const userProfile = {
          id: user.id,
          username: user.username,
          email: user.email,
          user_status: user.role,
          is_active: true,
          available_points: 1000,
          total_points: 1500,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: new Date().toISOString(),
          active_supplier: ["Provider A", "Provider B"],
          last_login: new Date().toISOString(),
        };

        console.log(`✅ User profile retrieved for ${user.username}`);
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(JSON.stringify(userProfile));
        return;
      } catch (error) {
        console.log(`❌ Invalid token: ${error.message}`);
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({ error: "unauthorized", message: "Invalid token" })
        );
        return;
      }
    }

    // User points check endpoint
    if (path === "/v1.0/user/points-check" && req.method === "GET") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "unauthorized",
            message: "Missing or invalid authorization header",
          })
        );
        return;
      }

      const pointsData = {
        current_points: 1000,
        available_points: 1000,
        total_points: 1500,
        used_points: 500,
        last_updated: new Date().toISOString(),
      };

      console.log("✅ User points retrieved");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(pointsData));
      return;
    }

    // User active suppliers check endpoint
    if (
      path === "/v1.0/user/check-active-my-supplier" &&
      req.method === "GET"
    ) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "unauthorized",
            message: "Missing or invalid authorization header",
          })
        );
        return;
      }

      const suppliersData = {
        my_supplier: ["Provider A", "Provider B", "Restel", "Booking.com"],
        active_count: 4,
        last_updated: new Date().toISOString(),
      };

      console.log("✅ User active suppliers retrieved");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(suppliersData));
      return;
    }

    // Health check
    if (path === "/v1.0/health" && req.method === "GET") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({ status: "ok", timestamp: new Date().toISOString() })
      );
      return;
    }

    // Supplier info endpoint
    if (
      path === "/v1.0/hotels/check-my-active-suppliers-info" &&
      req.method === "GET"
    ) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "unauthorized",
            message: "Missing or invalid authorization header",
          })
        );
        return;
      }

      // Mock supplier info data
      const mockSupplierData = {
        userId: "1",
        role: "admin_user",
        accessSummary: {
          totalSuppliersInSystem: 12,
          accessibleSuppliersCount: 8,
          permissionBased: true,
        },
        supplierAnalytics: {
          totalHotelsAccessible: 45678,
          activeSuppliers: 8,
          inactiveSuppliers: 0,
          accessCoveragePercentage: 66.7,
        },
        accessibleSuppliers: [
          {
            supplierName: "Booking.com",
            totalHotels: 15420,
            accessType: "full",
            permissionGrantedAt: "2024-01-15T00:00:00Z",
            lastUpdated: "2024-12-20T10:30:00Z",
            availabilityStatus: "active",
          },
          {
            supplierName: "Expedia",
            totalHotels: 12350,
            accessType: "full",
            permissionGrantedAt: "2024-02-01T00:00:00Z",
            lastUpdated: "2024-12-19T15:45:00Z",
            availabilityStatus: "active",
          },
          {
            supplierName: "Agoda",
            totalHotels: 8900,
            accessType: "limited",
            permissionGrantedAt: "2024-03-10T00:00:00Z",
            lastUpdated: "2024-12-18T09:20:00Z",
            availabilityStatus: "active",
          },
          {
            supplierName: "Hotels.com",
            totalHotels: 5670,
            accessType: "full",
            permissionGrantedAt: "2024-01-20T00:00:00Z",
            lastUpdated: "2024-12-21T08:15:00Z",
            availabilityStatus: "active",
          },
          {
            supplierName: "Priceline",
            totalHotels: 2890,
            accessType: "limited",
            permissionGrantedAt: "2024-04-05T00:00:00Z",
            lastUpdated: "2024-12-15T14:30:00Z",
            availabilityStatus: "active",
          },
          {
            supplierName: "Travelocity",
            totalHotels: 448,
            accessType: "basic",
            permissionGrantedAt: "2024-05-12T00:00:00Z",
            lastUpdated: "2024-11-28T11:45:00Z",
            availabilityStatus: "active",
          },
        ],
        responseMetadata: {
          generatedAt: new Date().toISOString(),
        },
      };

      console.log("✅ Supplier info retrieved");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(mockSupplierData));
      return;
    }

    // Audit my activity endpoint
    if (path.startsWith("/v1.0/audit/my-activity") && req.method === "GET") {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.writeHead(401, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: "unauthorized",
            message: "Missing or invalid authorization header",
          })
        );
        return;
      }

      // Mock audit data
      const mockAuditData = {
        user: {
          id: "1",
          username: "demo",
          email: "demo@example.com",
          role: "admin_user",
          account_created: "2024-01-01T00:00:00Z",
        },
        period: {
          days: 30,
          start_date: "2024-11-21T00:00:00Z",
          end_date: "2024-12-21T00:00:00Z",
        },
        summary: {
          total_activities: 150,
          total_endpoint_calls: 120,
          unique_endpoints_used: 8,
          average_daily_activities: 5.0,
          average_daily_endpoint_calls: 4.0,
          most_active_day: {
            date: "2024-12-15",
            count: 25,
          },
        },
        endpoint_usage: {
          total_calls: 120,
          unique_endpoints: 8,
          top_endpoints: [
            { endpoint: "/v1.0/user/check-me", calls: 45, percentage: 37.5 },
            { endpoint: "/v1.0/hotels/search", calls: 30, percentage: 25.0 },
            {
              endpoint: "/v1.0/user/points-check",
              calls: 20,
              percentage: 16.7,
            },
            { endpoint: "/v1.0/exports/create", calls: 15, percentage: 12.5 },
            { endpoint: "/v1.0/health", calls: 10, percentage: 8.3 },
          ],
          all_endpoints: [
            { endpoint: "/v1.0/user/check-me", calls: 45 },
            { endpoint: "/v1.0/hotels/search", calls: 30 },
            { endpoint: "/v1.0/user/points-check", calls: 20 },
            { endpoint: "/v1.0/exports/create", calls: 15 },
            { endpoint: "/v1.0/health", calls: 10 },
          ],
        },
        http_methods: {
          total: 120,
          breakdown: [
            { method: "GET", count: 100, percentage: 83.3 },
            { method: "POST", count: 20, percentage: 16.7 },
          ],
        },
        status_codes: {
          total: 120,
          breakdown: [
            { status_code: 200, count: 110, percentage: 91.7 },
            { status_code: 401, count: 8, percentage: 6.7 },
            { status_code: 404, count: 2, percentage: 1.6 },
          ],
        },
        timeline: [
          { date: "2024-12-01", count: 5 },
          { date: "2024-12-02", count: 3 },
          { date: "2024-12-03", count: 7 },
          { date: "2024-12-04", count: 4 },
          { date: "2024-12-05", count: 6 },
        ],
        activity_breakdown: [
          {
            action: "login",
            action_label: "User Login",
            count: 30,
            percentage: 20.0,
          },
          {
            action: "api_access",
            action_label: "API Access",
            count: 45,
            percentage: 30.0,
          },
          {
            action: "export",
            action_label: "Data Export",
            count: 15,
            percentage: 10.0,
          },
          {
            action: "search",
            action_label: "Hotel Search",
            count: 60,
            percentage: 40.0,
          },
        ],
        authentication: {
          successful_logins: 28,
          failed_logins: 2,
          logouts: 25,
          success_rate: 93.3,
        },
        patterns: {
          hourly_distribution: [
            { hour: 9, hour_label: "09:00", count: 15 },
            { hour: 10, hour_label: "10:00", count: 20 },
            { hour: 14, hour_label: "14:00", count: 25 },
            { hour: 16, hour_label: "16:00", count: 18 },
          ],
          most_active_hour: 14,
          day_of_week_distribution: [
            { day_of_week: 1, day_name: "Monday", count: 25, percentage: 16.7 },
            {
              day_of_week: 2,
              day_name: "Tuesday",
              count: 30,
              percentage: 20.0,
            },
            {
              day_of_week: 3,
              day_name: "Wednesday",
              count: 35,
              percentage: 23.3,
            },
            {
              day_of_week: 4,
              day_name: "Thursday",
              count: 28,
              percentage: 18.7,
            },
            { day_of_week: 5, day_name: "Friday", count: 32, percentage: 21.3 },
          ],
          most_active_day_of_week: "Wednesday",
        },
        recent_activities: [
          {
            id: 1,
            action: "login",
            action_label: "User Login",
            created_at: "2024-12-21T08:30:00Z",
            ip_address: "192.168.1.100",
            endpoint: null,
            method: null,
            status_code: null,
            details: { success: true },
          },
          {
            id: 2,
            action: "api_access",
            action_label: "API Access",
            created_at: "2024-12-21T08:35:00Z",
            ip_address: "192.168.1.100",
            endpoint: "/v1.0/user/check-me",
            method: "GET",
            status_code: 200,
            details: { success: true },
          },
          {
            id: 3,
            action: "search",
            action_label: "Hotel Search",
            created_at: "2024-12-21T09:15:00Z",
            ip_address: "192.168.1.100",
            endpoint: "/v1.0/hotels/search",
            method: "GET",
            status_code: 200,
            details: { success: true },
          },
          {
            id: 4,
            action: "export",
            action_label: "Data Export",
            created_at: "2024-12-21T10:00:00Z",
            ip_address: "192.168.1.100",
            endpoint: "/v1.0/exports/create",
            method: "POST",
            status_code: 200,
            details: { success: true },
          },
        ],
      };

      console.log("✅ User audit activity retrieved");
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(mockAuditData));
      return;
    }

    // 404 for other endpoints
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "not_found", message: "Endpoint not found" })
    );
  } catch (error) {
    console.error("Server error:", error);
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ error: "internal_server_error", message: error.message })
    );
  }
});

const PORT = 8001;
const HOST = "127.0.0.1";

server.listen(PORT, HOST, () => {
  console.log(`🚀 Mock backend server running on http://${HOST}:${PORT}`);
  console.log("📋 Available endpoints:");
  console.log("  POST /v1.0/auth/token - Authentication");
  console.log("  GET  /v1.0/user/check-me - User profile");
  console.log("  GET  /v1.0/user/points-check - User points");
  console.log("  GET  /v1.0/user/check-active-my-supplier - Active suppliers");
  console.log("  GET  /v1.0/audit/my-activity - User audit activity");
  console.log(
    "  GET  /v1.0/hotels/check-my-active-suppliers-info - Supplier info"
  );
  console.log("  GET  /v1.0/health - Health check");
  console.log("");
  console.log("👤 Test users:");
  Object.values(MOCK_USERS).forEach((user) => {
    console.log(`  ${user.username} / ${user.password} (${user.role})`);
  });
  console.log("");
  console.log("🛑 Press Ctrl+C to stop the server");
});

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down mock backend server...");
  server.close(() => {
    console.log("✅ Server stopped");
    process.exit(0);
  });
});
