#!/usr/bin/env node

/**
 * Environment Variables Checker
 * Verifies that all required environment variables are properly configured
 */

const fs = require("fs");
const path = require("path");

console.log("🔍 Checking Environment Configuration...\n");

// Check if .env.local exists
const envLocalPath = path.join(process.cwd(), ".env.local");
const envProductionPath = path.join(process.cwd(), ".env.production");

console.log("📁 Checking environment files:");
console.log(
  `  .env.local: ${fs.existsSync(envLocalPath) ? "✅ Found" : "❌ Missing"}`,
);
console.log(
  `  .env.production: ${fs.existsSync(envProductionPath) ? "✅ Found" : "❌ Missing"}`,
);
console.log("");

// Read and parse .env.local
if (fs.existsSync(envLocalPath)) {
  console.log("📋 .env.local contents:");
  const envContent = fs.readFileSync(envLocalPath, "utf-8");
  const lines = envContent
    .split("\n")
    .filter((line) => line.trim() && !line.startsWith("#"));

  const requiredVars = ["NEXT_PUBLIC_API_BASE_URL", "NEXT_PUBLIC_API_VERSION"];

  const foundVars = {};
  lines.forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      foundVars[key.trim()] = value.trim();
    }
  });

  requiredVars.forEach((varName) => {
    if (foundVars[varName]) {
      console.log(`  ✅ ${varName}: ${foundVars[varName]}`);
    } else {
      console.log(`  ❌ ${varName}: Missing!`);
    }
  });
  console.log("");
}

// Check if backend is accessible
console.log("🌐 Checking backend connectivity:");

const http = require("http");

function checkBackend(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname,
      method: "GET",
      timeout: 5000,
    };

    const req = http.request(options, (res) => {
      resolve({ success: true, status: res.statusCode });
    });

    req.on("error", (error) => {
      resolve({ success: false, error: error.message });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({ success: false, error: "Timeout" });
    });

    req.end();
  });
}

// Test local backend
checkBackend("http://127.0.0.1:8001/v1.0/").then((result) => {
  if (result.success) {
    console.log(
      `  ✅ Backend accessible at http://127.0.0.1:8001 (Status: ${result.status})`,
    );
  } else {
    console.log(`  ❌ Backend not accessible: ${result.error}`);
    console.log("     Make sure your backend server is running on port 8001");
  }
  console.log("");

  // Recommendations
  console.log("💡 Recommendations:");
  console.log("  1. Restart your Next.js dev server: npm run dev");
  console.log("  2. Clear Next.js cache: rm -rf .next");
  console.log("  3. Make sure backend server is running");
  console.log("  4. Check browser console for environment variable values");
  console.log("");
  console.log(
    "📚 For more help, see: docs/ENVIRONMENT_VARIABLES_TROUBLESHOOTING.md",
  );
});
