/**
 * Verification script to test the hotel dashboard integration
 * Run this with: node verify-dashboard.js
 */

const https = require("https");
const http = require("http");

// Load environment variables from .env.local if available
const fs = require("fs");
const path = require("path");

let API_BASE_URL = "http://127.0.0.1:8002";
let API_VERSION = "v1.0";

try {
  const envPath = path.join(__dirname, ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const apiBaseMatch = envContent.match(/NEXT_PUBLIC_API_BASE_URL=(.+)/);
    const apiVersionMatch = envContent.match(/NEXT_PUBLIC_API_VERSION=(.+)/);

    if (apiBaseMatch) API_BASE_URL = apiBaseMatch[1].trim();
    if (apiVersionMatch) API_VERSION = apiVersionMatch[1].trim();
  }
} catch (err) {
  console.log("Using default API configuration");
}

const BACKEND_URL = `${API_BASE_URL}/${API_VERSION}/hotels/check-my-active-suppliers-info`;
const FRONTEND_URL = "http://localhost:3000/dashboard/hotels";
const TEST_TOKEN =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1cnNhbXJva28iLCJ1c2VyX2lkIjoiMWEyMDNjY2RhNCIsInJvbGUiOiJzdXBlcl91c2VyIiwiZXhwIjoxNzY0MjM3NDE2LCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzYyNDM3NDE2fQ.Ri1GAYk-PYv9rrwnYcjNxemUyKOIRbFoI2QtBgmjsOI";

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname + urlObj.search,
      method: options.method || "GET",
      headers: options.headers || {},
    };

    const req = http.request(requestOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const jsonData = JSON.parse(data);
          resolve({ status: res.statusCode, data: jsonData });
        } catch (e) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on("error", (err) => {
      reject(err);
    });

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function testBackendAPI() {
  console.log("🔄 Testing backend API...");

  try {
    const response = await makeRequest(BACKEND_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${TEST_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    if (response.status === 200) {
      console.log("✅ Backend API is working!");
      console.log(
        `📊 Total Hotels: ${
          response.data.supplierAnalytics?.totalHotelsAccessible?.toLocaleString() ||
          "N/A"
        }`
      );
      console.log(
        `🏢 Active Suppliers: ${
          response.data.supplierAnalytics?.activeSuppliers || "N/A"
        }`
      );
      console.log(
        `📈 Coverage: ${
          response.data.supplierAnalytics?.accessCoveragePercentage || "N/A"
        }%`
      );

      // Show top 3 suppliers
      if (response.data.accessibleSuppliers) {
        console.log("🔝 Top Suppliers:");
        response.data.accessibleSuppliers
          .sort((a, b) => b.totalHotels - a.totalHotels)
          .slice(0, 3)
          .forEach((supplier, index) => {
            console.log(
              `   ${index + 1}. ${
                supplier.supplierName
              }: ${supplier.totalHotels.toLocaleString()} hotels`
            );
          });
      }

      return true;
    } else {
      console.log(`❌ Backend API failed with status: ${response.status}`);
      console.log("Response:", response.data);
      return false;
    }
  } catch (error) {
    console.log(`❌ Backend API error: ${error.message}`);
    return false;
  }
}

async function testFrontendServer() {
  console.log("🔄 Testing frontend server...");

  try {
    const response = await makeRequest(FRONTEND_URL, {
      method: "GET",
      headers: {
        "User-Agent": "Node.js verification script",
      },
    });

    if (response.status === 200) {
      console.log("✅ Frontend server is running!");
      return true;
    } else {
      console.log(`❌ Frontend server returned status: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Frontend server error: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🚀 Hotel Dashboard Integration Verification\n");

  const backendOk = await testBackendAPI();
  console.log("");

  const frontendOk = await testFrontendServer();
  console.log("");

  if (backendOk && frontendOk) {
    console.log("🎉 All systems are working!");
    console.log("");
    console.log("📋 Next Steps:");
    console.log(
      "1. Open http://localhost:3000/dashboard/hotels in your browser"
    );
    console.log(
      '2. Check that the statistics cards show real data (not "N/A")'
    );
    console.log(
      '3. Verify the "Top Suppliers" section displays actual supplier names'
    );
    console.log("4. Look at browser console for API call logs");
    console.log("");
    console.log("🔍 Expected Data in Dashboard:");
    console.log("- Total Hotels: ~5.7M");
    console.log("- Active Hotels: ~4.9M (85% of total)");
    console.log("- Pending Hotels: ~577K (10% of total)");
    console.log("- Recent Updates: ~288K (5% of total)");
  } else {
    console.log("❌ Some systems are not working properly");
    console.log("");
    console.log("🔧 Troubleshooting:");
    if (!backendOk) {
      console.log(`- Check if backend server is running on ${API_BASE_URL}`);
      console.log("- Verify the token is valid and not expired");
    }
    if (!frontendOk) {
      console.log(
        "- Check if frontend server is running on http://localhost:3000"
      );
      console.log('- Run "npm run dev" to start the frontend server');
    }
  }
}

main().catch(console.error);
