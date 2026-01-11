/**
 * Debug script to check notification retrieval issue
 *
 * This will help us understand why the created notification isn't showing up
 * in jakaria_123's notifications list
 */

// Use built-in fetch (Node.js 18+)
const fetch = globalThis.fetch;

const API_BASE = "http://127.0.0.1:8001/v1.0";
const TEST_USER = {
  username: "jakaria_123",
  password: "jakaria_123",
};
const ADMIN_USER = {
  username: "ursamroko",
  password: "ursamroko123",
};

async function loginUser(username, password) {
  console.log(`👤 Logging in as ${username}...`);
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
  console.log(`✅ Login successful for ${username}`);
  return loginData.access_token;
}

async function getCurrentUser(token) {
  const userResponse = await fetch(`${API_BASE}/user/check-me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!userResponse.ok) {
    throw new Error(`Failed to get user info: ${userResponse.status}`);
  }

  return await userResponse.json();
}

async function debugNotificationRetrieval() {
  console.log("🔍 === DEBUGGING NOTIFICATION RETRIEVAL ===\n");

  try {
    // Step 1: Login as both users and get their info
    console.log("👤 Step 1: Getting user information...");
    const adminToken = await loginUser(
      ADMIN_USER.username,
      ADMIN_USER.password
    );
    const userToken = await loginUser(TEST_USER.username, TEST_USER.password);

    const adminUser = await getCurrentUser(adminToken);
    const jakariaUser = await getCurrentUser(userToken);

    console.log(`✅ Admin user: ${adminUser.username} (ID: ${adminUser.id})`);
    console.log(
      `✅ Target user: ${jakariaUser.username} (ID: ${jakariaUser.id})`
    );

    // Step 2: Create a notification with detailed logging
    console.log("\n📝 Step 2: Creating test notification...");
    const notificationPayload = {
      user_id: jakariaUser.id,
      type: "system",
      title: "Debug Test Notification",
      message: "This notification is for debugging retrieval issues",
      priority: "medium",
      meta_data: {
        source: "debug_test",
        created_for: jakariaUser.username,
        created_for_id: jakariaUser.id,
        test_purpose: "debug_retrieval",
        created_at: new Date().toISOString(),
      },
    };

    console.log(
      "📦 Notification payload:",
      JSON.stringify(notificationPayload, null, 2)
    );

    const createResponse = await fetch(
      `${API_BASE}/notifications/admin/create`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${adminToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificationPayload),
      }
    );

    console.log(`📝 Create response status: ${createResponse.status}`);

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error(
        `❌ Failed to create notification: ${createResponse.status} - ${errorText}`
      );
      return;
    }

    const createdNotification = await createResponse.json();
    console.log("✅ Notification created:", {
      id: createdNotification.id,
      user_id: createdNotification.user_id,
      title: createdNotification.title,
      status: createdNotification.status,
    });

    // Step 3: Try to retrieve notifications for jakaria_123
    console.log("\n📋 Step 3: Retrieving notifications for jakaria_123...");

    // Wait a moment for database to sync
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const notificationsResponse = await fetch(
      `${API_BASE}/notifications/?limit=50`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      `📋 Notifications response status: ${notificationsResponse.status}`
    );

    if (!notificationsResponse.ok) {
      const errorText = await notificationsResponse.text();
      console.error(
        `❌ Failed to get notifications: ${notificationsResponse.status} - ${errorText}`
      );
      return;
    }

    const notificationsData = await notificationsResponse.json();
    console.log("📋 Notifications response data:", {
      total: notificationsData.total,
      count: notificationsData.notifications?.length,
      has_next: notificationsData.has_next,
      has_prev: notificationsData.has_prev,
    });

    const notifications = notificationsData.notifications || [];

    if (notifications.length === 0) {
      console.warn("⚠️ No notifications found for jakaria_123");
      console.warn("   This could indicate:");
      console.warn("   1. User ID mismatch between creation and retrieval");
      console.warn("   2. Database synchronization issue");
      console.warn("   3. Backend filtering issue");
      console.warn("   4. Permission issue in retrieval");
    } else {
      console.log(`✅ Found ${notifications.length} notifications`);
      notifications.forEach((n, i) => {
        console.log(
          `  ${i + 1}. ID: ${n.id} | "${n.title}" | Status: ${
            n.status
          } | User: ${n.user_id} | Created: ${n.created_at}`
        );
      });
    }

    // Step 4: Check if our created notification is in the list
    const ourNotification = notifications.find(
      (n) => n.id === createdNotification.id
    );
    if (ourNotification) {
      console.log("✅ Our created notification found in the list");
      console.log("   Notification details:", {
        id: ourNotification.id,
        user_id: ourNotification.user_id,
        title: ourNotification.title,
        status: ourNotification.status,
        created_at: ourNotification.created_at,
      });
    } else {
      console.error("❌ Our created notification NOT found in the list");
      console.error("   Created notification ID:", createdNotification.id);
      console.error("   Created for user_id:", createdNotification.user_id);
      console.error("   Current user ID:", jakariaUser.id);
      console.error(
        "   User IDs match:",
        createdNotification.user_id === jakariaUser.id
      );
    }

    // Step 5: Try to get unread count
    console.log("\n🔢 Step 5: Checking unread count...");
    const unreadResponse = await fetch(
      `${API_BASE}/notifications/unread-count`,
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (unreadResponse.ok) {
      const unreadData = await unreadResponse.json();
      console.log(`🔢 Unread count: ${unreadData.unread_count}`);
    } else {
      console.error(`❌ Failed to get unread count: ${unreadResponse.status}`);
    }

    // Step 6: Try different pagination parameters
    console.log("\n📄 Step 6: Testing different pagination...");
    const paginationTests = [
      { page: 1, limit: 10 },
      { page: 1, limit: 100 },
      { page: 2, limit: 10 },
    ];

    for (const params of paginationTests) {
      const testResponse = await fetch(
        `${API_BASE}/notifications/?page=${params.page}&limit=${params.limit}`,
        {
          headers: {
            Authorization: `Bearer ${userToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (testResponse.ok) {
        const testData = await testResponse.json();
        console.log(
          `📄 Page ${params.page}, Limit ${params.limit}: ${
            testData.notifications?.length || 0
          } notifications`
        );

        if (
          testData.notifications?.find((n) => n.id === createdNotification.id)
        ) {
          console.log(`✅ Found our notification on page ${params.page}`);
        }
      }
    }

    console.log("\n🎯 === DEBUG SUMMARY ===");
    console.log(`✅ Admin authentication: Working`);
    console.log(`✅ User authentication: Working`);
    console.log(
      `✅ Notification creation: Working (ID: ${createdNotification.id})`
    );
    console.log(
      `${notifications.length > 0 ? "✅" : "❌"} Notification retrieval: ${
        notifications.length > 0 ? "Working" : "Failed"
      }`
    );
    console.log(
      `${ourNotification ? "✅" : "❌"} Created notification in list: ${
        ourNotification ? "Yes" : "No"
      }`
    );

    if (!ourNotification) {
      console.log("\n💡 POSSIBLE ISSUES:");
      console.log("1. User ID mismatch between creation and retrieval");
      console.log("2. Database transaction not committed");
      console.log("3. Backend filtering notifications incorrectly");
      console.log("4. Caching issue in backend");
      console.log("5. Different database connections for read/write");
    }
  } catch (error) {
    console.error("❌ Debug failed with error:", error.message);
    console.error("❌ Stack trace:", error.stack);
  }
}

// Run the debug
debugNotificationRetrieval().catch(console.error);
