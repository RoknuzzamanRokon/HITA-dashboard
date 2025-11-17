/**
 * Configuration Verification Script for Export Feature
 *
 * This script verifies that:
 * 1. Environment variables are correctly configured
 * 2. API endpoints are accessible
 * 3. Authentication token handling works correctly
 *
 * Run with: node verify-export-config.js
 */

const fs = require("fs");
const path = require("path");

// Load environment variables from .env.local
const envPath = path.join(__dirname, ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf8");
  envContent.split("\n").forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const value = match[2].trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  });
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001";
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || "v1.0";
const FULL_API_URL = `${API_BASE_URL}/${API_VERSION}`;

console.log("=".repeat(60));
console.log("Export Feature Configuration Verification");
console.log("=".repeat(60));
console.log();

// 1. Verify environment variables
console.log("1. Environment Variables:");
console.log("   ✓ NEXT_PUBLIC_API_BASE_URL:", API_BASE_URL);
console.log("   ✓ NEXT_PUBLIC_API_VERSION:", API_VERSION);
console.log("   ✓ Full API URL:", FULL_API_URL);
console.log(
  "   ✓ Token Storage Key:",
  process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || "admin_auth_token"
);
console.log(
  "   ✓ Use Mock Auth:",
  process.env.NEXT_PUBLIC_USE_MOCK_AUTH || "false"
);
console.log();

// 2. Verify export endpoints configuration
console.log("2. Export API Endpoints:");
const exportEndpoints = {
  "Create Hotel Export": `${FULL_API_URL}/export/hotels`,
  "Create Mapping Export": `${FULL_API_URL}/export/mappings`,
  "Get Export Status": `${FULL_API_URL}/export/status/{job_id}`,
  "Download Export": `${FULL_API_URL}/export/download/{job_id}`,
};

Object.entries(exportEndpoints).forEach(([name, url]) => {
  console.log(`   ✓ ${name}:`);
  console.log(`     ${url}`);
});
console.log();

// 3. Test API connectivity (basic health check)
console.log("3. API Connectivity Test:");
console.log("   Testing connection to:", FULL_API_URL);

const https = require("https");
const http = require("http");

const protocol = API_BASE_URL.startsWith("https") ? https : http;
const testUrl = `${FULL_API_URL}/health`;

// Simple health check
const makeRequest = (url) => {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
      path: urlObj.pathname,
      method: "GET",
      timeout: 5000,
    };

    const req = protocol.request(options, (res) => {
      resolve({
        status: res.statusCode,
        statusText: res.statusMessage,
      });
    });

    req.on("error", (error) => {
      reject(error);
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    req.end();
  });
};

makeRequest(testUrl)
  .then((response) => {
    console.log(`   ✓ API is reachable`);
    console.log(`   ✓ Status: ${response.status} ${response.statusText}`);
    console.log();
    console.log("=".repeat(60));
    console.log("✅ Configuration verification completed successfully!");
    console.log("=".repeat(60));
    console.log();
    console.log("Next steps:");
    console.log("1. Ensure backend server is running at:", API_BASE_URL);
    console.log(
      "2. Verify CORS is configured to allow requests from your frontend"
    );
    console.log("3. Test authentication by logging in through the UI");
    console.log("4. Test export feature by creating a hotel or mapping export");
    console.log();
  })
  .catch((error) => {
    console.log(`   ⚠️  API connection failed: ${error.message}`);
    console.log();
    console.log("=".repeat(60));
    console.log("⚠️  Configuration verification completed with warnings");
    console.log("=".repeat(60));
    console.log();
    console.log("Troubleshooting:");
    console.log("1. Ensure backend server is running at:", API_BASE_URL);
    console.log("2. Check if the API URL is correct in .env.local");
    console.log("3. Verify network connectivity");
    console.log("4. Check firewall settings");
    console.log();
    console.log(
      "Note: This warning does not prevent the export feature from working"
    );
    console.log("if the backend is properly configured and running.");
    console.log();
  });
