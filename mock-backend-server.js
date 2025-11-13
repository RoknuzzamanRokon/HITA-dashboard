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
