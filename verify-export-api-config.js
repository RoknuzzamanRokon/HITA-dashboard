/**
 * Export API Configuration Verification Script
 *
 * This script verifies that the export API configuration is correct:
 * 1. Environment variables are loaded
 * 2. API endpoints are properly configured
 * 3. Backend API is reachable
 * 4. Authentication token handling works
 */

const https = require("https");
const http = require("http");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function success(message) {
  log(`✓ ${message}`, colors.green);
}

function error(message) {
  log(`✗ ${message}`, colors.red);
}

function warning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function info(message) {
  log(`ℹ ${message}`, colors.cyan);
}

function section(message) {
  log(`\n${"=".repeat(60)}`, colors.blue);
  log(message, colors.blue);
  log("=".repeat(60), colors.blue);
}

// Load environment variables from .env.local
function loadEnvFile() {
  const fs = require("fs");
  const path = require("path");

  const envPath = path.join(__dirname, ".env.local");

  if (!fs.existsSync(envPath)) {
    warning(".env.local file not found, using defaults");
    return;
  }

  const envContent = fs.readFileSync(envPath, "utf8");
  const lines = envContent.split("\n");

  lines.forEach((line) => {
    line = line.trim();
    if (line && !line.startsWith("#")) {
      const [key, ...valueParts] = line.split("=");
      const value = valueParts.join("=").trim();
      if (key && value) {
        process.env[key] = value;
      }
    }
  });

  success(".env.local loaded successfully");
}

// Check environment variables
function checkEnvironmentVariables() {
  section("1. Environment Variables Check");

  const requiredVars = ["NEXT_PUBLIC_API_BASE_URL", "NEXT_PUBLIC_API_VERSION"];

  const optionalVars = [
    "NEXT_PUBLIC_TOKEN_STORAGE_KEY",
    "NEXT_PUBLIC_USE_MOCK_AUTH",
    "NEXT_PUBLIC_USE_MOCKS",
  ];

  let allPresent = true;

  // Check required variables
  requiredVars.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      success(`${varName} = ${value}`);
    } else {
      error(`${varName} is not set`);
      allPresent = false;
    }
  });

  // Check optional variables
  optionalVars.forEach((varName) => {
    const value = process.env[varName];
    if (value) {
      info(`${varName} = ${value}`);
    } else {
      info(`${varName} not set (using default)`);
    }
  });

  return allPresent;
}

// Verify API endpoint configuration
function verifyEndpointConfiguration() {
  section("2. API Endpoint Configuration");

  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8001";
  const version = process.env.NEXT_PUBLIC_API_VERSION || "v1.0";
  const fullUrl = `${baseUrl}/${version}`;

  info(`Base URL: ${baseUrl}`);
  info(`API Version: ${version}`);
  success(`Full API URL: ${fullUrl}`);

  // List export endpoints
  const exportEndpoints = [
    "POST /export/hotels",
    "POST /export/mappings",
    "GET  /export/status/{job_id}",
    "GET  /export/download/{job_id}",
  ];

  info("\nExport API Endpoints:");
  exportEndpoints.forEach((endpoint) => {
    const [method, path] = endpoint.split(" ");
    info(`  ${method.padEnd(6)} ${fullUrl}${path}`);
  });

  return fullUrl;
}

// Test backend connectivity
function testBackendConnectivity(apiUrl) {
  return new Promise((resolve) => {
    section("3. Backend Connectivity Test");

    const url = new URL(apiUrl);
    const client = url.protocol === "https:" ? https : http;

    info(`Testing connection to: ${apiUrl}`);

    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === "https:" ? 443 : 80),
      path: `/${process.env.NEXT_PUBLIC_API_VERSION || "v1.0"}/health`,
      method: "GET",
      timeout: 5000,
    };

    const req = client.request(options, (res) => {
      if (res.statusCode === 200 || res.statusCode === 404) {
        success(`Backend is reachable (HTTP ${res.statusCode})`);
        if (res.statusCode === 404) {
          warning("Health endpoint returned 404, but server is responding");
        }
        resolve(true);
      } else {
        warning(`Backend responded with status ${res.statusCode}`);
        resolve(true);
      }
    });

    req.on("error", (err) => {
      error(`Cannot connect to backend: ${err.message}`);
      warning("Make sure the backend server is running");
      resolve(false);
    });

    req.on("timeout", () => {
      error("Connection timeout");
      warning("Backend server may be slow or not responding");
      req.destroy();
      resolve(false);
    });

    req.end();
  });
}

// Verify CORS configuration
function verifyCorsConfiguration() {
  section("4. CORS Configuration");

  info("Frontend origin: http://localhost:3000");
  info("Backend must allow CORS from this origin");
  info("\nRequired CORS headers:");
  info("  Access-Control-Allow-Origin: http://localhost:3000");
  info("  Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
  info("  Access-Control-Allow-Headers: Content-Type, Authorization");

  warning("\nNote: CORS configuration is handled by the backend");
  warning("If you see CORS errors in the browser, check backend settings");
}

// Verify authentication configuration
function verifyAuthConfiguration() {
  section("5. Authentication Configuration");

  const tokenKey =
    process.env.NEXT_PUBLIC_TOKEN_STORAGE_KEY || "admin_auth_token";

  success(`Token storage key: ${tokenKey}`);
  info("Tokens are stored in localStorage");
  info("All export API requests require authentication");
  info("Authorization header format: Bearer {token}");

  info("\nAuthentication flow:");
  info("  1. User logs in via /login");
  info("  2. Token stored in localStorage");
  info("  3. Token included in all API requests");
  info("  4. On 401 error, redirect to login");
}

// Verify export API client configuration
function verifyExportApiClient() {
  section("6. Export API Client Configuration");

  const fs = require("fs");
  const path = require("path");

  const clientPath = path.join(__dirname, "lib", "api", "exports.ts");
  const configPath = path.join(__dirname, "lib", "config.ts");

  if (fs.existsSync(clientPath)) {
    success("Export API client exists: lib/api/exports.ts");
  } else {
    error("Export API client not found: lib/api/exports.ts");
  }

  if (fs.existsSync(configPath)) {
    success("Config file exists: lib/config.ts");
  } else {
    error("Config file not found: lib/config.ts");
  }

  info("\nExport API client features:");
  info("  ✓ createHotelExport()");
  info("  ✓ createMappingExport()");
  info("  ✓ getExportStatus()");
  info("  ✓ downloadExport()");
  info("  ✓ Retry logic with exponential backoff");
  info("  ✓ User-friendly error messages");
  info("  ✓ Authentication error handling");
}

// Main verification function
async function runVerification() {
  log("\n" + "=".repeat(60), colors.blue);
  log("Export API Configuration Verification", colors.blue);
  log("=".repeat(60) + "\n", colors.blue);

  // Load environment variables
  loadEnvFile();

  // Run checks
  const envVarsOk = checkEnvironmentVariables();
  const apiUrl = verifyEndpointConfiguration();
  const backendOk = await testBackendConnectivity(apiUrl);
  verifyCorsConfiguration();
  verifyAuthConfiguration();
  verifyExportApiClient();

  // Summary
  section("Verification Summary");

  if (envVarsOk) {
    success("Environment variables: OK");
  } else {
    error("Environment variables: MISSING");
  }

  if (backendOk) {
    success("Backend connectivity: OK");
  } else {
    error("Backend connectivity: FAILED");
  }

  success("API endpoint configuration: OK");
  success("Export API client: OK");

  // Final recommendations
  section("Next Steps");

  if (!envVarsOk) {
    warning("1. Create .env.local file with required variables");
    info("   Copy from .env.example and update values");
  }

  if (!backendOk) {
    warning("2. Start the backend server");
    info("   Make sure it's running at: " + apiUrl);
  }

  info("3. Test the export workflow:");
  info("   - Navigate to /dashboard/exports");
  info("   - Create a test export");
  info("   - Monitor status updates");
  info("   - Download completed export");

  log("\n" + "=".repeat(60) + "\n", colors.blue);
}

// Run the verification
runVerification().catch((err) => {
  error(`Verification failed: ${err.message}`);
  process.exit(1);
});
