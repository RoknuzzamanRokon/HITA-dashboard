// Direct API test script for all general users endpoint
// Run with: node test-general-users-api.js

const API_URL = "http://127.0.0.1:8002/v1.0/user/all-general-user";

// Replace with your actual token
const AUTH_TOKEN = "YOUR_TOKEN_HERE";

async function testAPI() {
  console.log("🔍 Testing API endpoint:", API_URL);
  console.log("🔑 Using token:", AUTH_TOKEN.substring(0, 20) + "...");

  try {
    const response = await fetch(API_URL, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${AUTH_TOKEN}`,
        "Content-Type": "application/json",
      },
    });

    console.log("📡 Response status:", response.status);
    console.log(
      "📡 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    const data = await response.json();

    console.log("\n✅ Response data:");
    console.log(JSON.stringify(data, null, 2));

    console.log("\n📊 Data structure:");
    console.log("- Has users:", !!data.users);
    console.log("- Users count:", data.users?.length || 0);
    console.log("- Has pagination:", !!data.pagination);
    console.log("- Has statistics:", !!data.statistics);
    console.log("- Has requested_by:", !!data.requested_by);
    console.log("- Has timestamp:", !!data.timestamp);

    if (data.users && data.users.length > 0) {
      console.log("\n👤 First user sample:");
      console.log(JSON.stringify(data.users[0], null, 2));

      console.log("\n📈 Statistics:");
      console.log("- Total users:", data.pagination?.total || 0);
      console.log("- Unpaid users:", data.statistics?.total_unpaid_users || 0);
      console.log("- Showing:", data.statistics?.showing || 0);

      console.log("\n👥 All users:");
      data.users.forEach((user, idx) => {
        console.log(`${idx + 1}. ${user.username} (${user.email})`);
        console.log(`   Role: ${user.role} | Active: ${user.is_active}`);
        console.log(
          `   Points: ${user.points?.current_points}/${user.points?.total_points} | Status: ${user.points?.paid_status}`
        );
        console.log(
          `   Requests: ${user.total_requests} | Activity: ${user.activity_status}`
        );
      });
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error("Stack:", error.stack);
  }
}

testAPI();
