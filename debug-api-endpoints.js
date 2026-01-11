/**
 * Debug script to test different API endpoint variations
 *
 * This will help us understand why different endpoints return different results
 */

// Use built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

const API_BASE = "http://127.0.0.1:8001/v1.0";
const TEST_USER = {
  username: "jakaria_123",
  password: "jakaria_123",
};

async function loginUser(username, password) {
  const loginResponse = await fetch(`${API_BASE}/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `username=${username}&password=${password}`,
  });

  if (!loginResponse.ok) {
    const errorText = await loginResponse.text();
    throw new Error(`Login failed: ${loginResponse.status} - ${errorText}`);
  }

  const loginData = await loginResponse.json();
  return loginData.access_token;
}

async function testEndpoint(token, url, description) {
  console.log(`\n🔍 Testing: ${description}`);
  console.log(`📡 URL: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log(`📊 Status: ${response.status}`);
    console.log(`📊 Headers:`, Object.fromEntries(response.headers.entries()));

    if (response.ok) {
      const data = await response.json();
      console.log(`📊 Response:`, JSON.stringify(data, null, 2));

      if (data.notifications) {
        console.log(`📋 Notifications count: ${data.notifications.length}`);
        data.notifications.forEach((n, i) => {
          console.log(
            `  ${i + 1}. ID: ${n.id} | "${n.title}" | Status: ${
              n.status
            } | User: ${n.user_id}`
          );
        });
      }
    } else {
      const errorText = await response.text();
      console.error(`❌ Error: ${errorText}`);
    }
  } catch (error) {
    console.error(`❌ Request failed: ${error.message}`);
  }
}

async function debugApiEndpoints() {
  console.log("🔍 === DEBUGGING API ENDPOINTS ===\n");

  try {
    // Login
    console.log("👤 Logging in as jakaria_123...");
    const token = await loginUser(TEST_USER.username, TEST_USER.password);
    console.log("✅ Login successful");

    // Test different endpoint variations
    const endpoints = [
      {
        url: `${API_BASE}/notifications/`,
        description: "Basic notifications endpoint",
      },
      {
        url: `${API_BASE}/notifications/?limit=50`,
        description: "Notifications with limit=50",
      },
      {
        url: `${API_BASE}/notifications/?page=1&limit=50`,
        description: "Notifications with page=1&limit=50",
      },
      {
        url: `${API_BASE}/notifications/?page=1&limit=10`,
        description: "Notifications with page=1&limit=10",
      },
      {
        url: `${API_BASE}/notifications/?limit=100`,
        description: "Notifications with limit=100",
      },
      {
        url: `${API_BASE}/notifications/unread-count`,
        description: "Unread count endpoint",
      },
    ];

    for (const endpoint of endpoints) {
      await testEndpoint(token, endpoint.url, endpoint.description);
      // Small delay between requests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    console.log("\n🎯 === ENDPOINT COMPARISON SUMMARY ===");
    console.log(
      "If different endpoints return different results, this indicates:"
    );
    console.log("1. Backend pagination logic issue");
    console.log("2. Default parameter handling problem");
    console.log("3. Database query inconsistency");
    console.log("4. Caching issue between endpoints");
  } catch (error) {
    console.error("❌ Debug failed with error:", error.message);
    console.error("❌ Stack trace:", error.stack);
  }
}

// Run the debug
debugApiEndpoints().catch(console.error);
