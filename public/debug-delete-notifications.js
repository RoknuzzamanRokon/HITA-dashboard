/**
 * Comprehensive Debug Script for Delete Notification Issue
 *
 * This script will help debug the delete notification issue for user jakaria_123
 *
 * Usage:
 * 1. Login as jakaria_123 (password: jakaria_123)
 * 2. Open browser console (F12)
 * 3. Load this script:
 *    const script = document.createElement("script");
 *    script.src = "/debug-delete-notifications.js";
 *    document.head.appendChild(script);
 * 4. Run: debugDeleteNotifications()
 */

window.debugDeleteNotifications = async function () {
  console.log("🔍 === COMPREHENSIVE DELETE NOTIFICATION DEBUG ===");
  console.log("🎯 Testing delete functionality for current user");

  const token = localStorage.getItem("admin_auth_token");
  if (!token) {
    console.error("❌ No auth token found. Please login first.");
    return;
  }

  console.log("✅ Auth token found:", token.substring(0, 20) + "...");

  try {
    // Step 1: Get current user info
    console.log("\n👤 === STEP 1: GET CURRENT USER INFO ===");
    const userResponse = await fetch(
      "http://127.0.0.1:8001/v1.0/user/check-me",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("👤 User API response status:", userResponse.status);

    if (!userResponse.ok) {
      console.error("❌ Failed to get user info:", userResponse.status);
      const errorText = await userResponse.text();
      console.error("❌ Error details:", errorText);
      return;
    }

    const userData = await userResponse.json();
    console.log("👤 Current user data:", {
      id: userData.id,
      username: userData.username,
      role: userData.user_status,
      is_active: userData.is_active,
    });

    // Step 2: Get all notifications for this user
    console.log("\n📋 === STEP 2: GET USER NOTIFICATIONS ===");
    const notificationsResponse = await fetch(
      "http://127.0.0.1:8001/v1.0/notifications/?limit=50",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(
      "📋 Notifications API response status:",
      notificationsResponse.status
    );

    if (!notificationsResponse.ok) {
      console.error(
        "❌ Failed to get notifications:",
        notificationsResponse.status
      );
      const errorText = await notificationsResponse.text();
      console.error("❌ Error details:", errorText);
      return;
    }

    const notificationsData = await notificationsResponse.json();
    console.log("📋 Notifications response:", {
      total: notificationsData.total,
      count: notificationsData.notifications?.length,
      has_next: notificationsData.has_next,
      has_prev: notificationsData.has_prev,
    });

    if (
      !notificationsData.notifications ||
      notificationsData.notifications.length === 0
    ) {
      console.log("📋 No notifications found for this user");
      console.log("💡 Creating a test notification first...");

      // Create a test notification
      const createResponse = await fetch(
        "http://127.0.0.1:8001/v1.0/notifications/admin/create",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userData.id,
            type: "system",
            title: "Test Delete Notification",
            message: "This is a test notification for delete functionality",
            priority: "medium",
            meta_data: {
              source: "debug_script",
              created_for_testing: true,
              test_user: userData.username,
            },
          }),
        }
      );

      if (createResponse.ok) {
        const createdNotification = await createResponse.json();
        console.log("✅ Test notification created:", createdNotification);

        // Refresh notifications list
        const refreshResponse = await fetch(
          "http://127.0.0.1:8001/v1.0/notifications/?limit=50",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          notificationsData.notifications = refreshData.notifications;
          console.log("🔄 Refreshed notifications list");
        }
      } else {
        console.error(
          "❌ Failed to create test notification:",
          createResponse.status
        );
        const errorText = await createResponse.text();
        console.error("❌ Create error details:", errorText);
        return;
      }
    }

    // Display all notifications
    console.log("📋 User's notifications:");
    notificationsData.notifications.forEach((n, i) => {
      console.log(
        `  ${i + 1}. ID: ${n.id} | "${n.title}" | Status: ${n.status} | User: ${
          n.user_id
        } | Created: ${n.created_at}`
      );
    });

    // Step 3: Test delete on first notification
    const firstNotification = notificationsData.notifications[0];
    console.log(
      `\n🗑️ === STEP 3: TEST DELETE NOTIFICATION ${firstNotification.id} ===`
    );
    console.log("🎯 Target notification:", {
      id: firstNotification.id,
      title: firstNotification.title,
      user_id: firstNotification.user_id,
      status: firstNotification.status,
      created_at: firstNotification.created_at,
    });

    // Verify ownership
    if (firstNotification.user_id !== userData.id) {
      console.warn(
        "⚠️ WARNING: Notification user_id doesn't match current user!"
      );
      console.warn(`  Notification user_id: ${firstNotification.user_id}`);
      console.warn(`  Current user id: ${userData.id}`);
      console.warn("  This might cause permission denied error");
    } else {
      console.log("✅ Notification ownership verified");
    }

    // Attempt delete
    console.log(
      `🗑️ Attempting to delete notification ${firstNotification.id}...`
    );
    const deleteResponse = await fetch(
      `http://127.0.0.1:8001/v1.0/notifications/${firstNotification.id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`🗑️ Delete response status: ${deleteResponse.status}`);
    console.log(
      `🗑️ Delete response headers:`,
      Object.fromEntries(deleteResponse.headers.entries())
    );

    if (deleteResponse.ok) {
      console.log(
        `✅ Delete request successful for notification ${firstNotification.id}`
      );

      // Step 4: Verify deletion
      console.log("\n🔍 === STEP 4: VERIFY DELETION ===");

      // Wait a moment for backend to process
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const verifyResponse = await fetch(
        "http://127.0.0.1:8001/v1.0/notifications/?limit=50",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json();
        const stillExists = verifyData.notifications?.find(
          (n) => n.id === firstNotification.id
        );

        console.log("🔍 Verification results:");
        console.log(
          `  - Total notifications after delete: ${
            verifyData.notifications?.length || 0
          }`
        );
        console.log(
          `  - Deleted notification still exists: ${
            stillExists ? "YES (❌ PROBLEM!)" : "NO (✅ SUCCESS)"
          }`
        );

        if (stillExists) {
          console.error("❌ PROBLEM: Notification still exists after delete!");
          console.error(
            "❌ This indicates the backend delete operation failed"
          );
        } else {
          console.log("✅ SUCCESS: Notification was successfully deleted");
        }

        // Show remaining notifications
        console.log("📋 Remaining notifications:");
        if (verifyData.notifications && verifyData.notifications.length > 0) {
          verifyData.notifications.forEach((n, i) => {
            console.log(
              `  ${i + 1}. ID: ${n.id} | "${n.title}" | Status: ${n.status}`
            );
          });
        } else {
          console.log("  (No notifications remaining)");
        }
      } else {
        console.error("❌ Failed to verify deletion:", verifyResponse.status);
      }
    } else {
      // Delete failed - analyze the error
      console.error(
        `❌ Delete request failed with status: ${deleteResponse.status}`
      );

      const errorText = await deleteResponse.text();
      console.error("❌ Error response body:", errorText);

      try {
        const errorJson = JSON.parse(errorText);
        console.error("❌ Parsed error details:", errorJson);

        // Analyze specific error types
        if (deleteResponse.status === 404) {
          console.error("🔍 404 Analysis: Notification not found");
          console.error("  Possible causes:");
          console.error("  - Notification was already deleted");
          console.error("  - Notification ID doesn't exist");
          console.error("  - Database inconsistency");
        } else if (deleteResponse.status === 403) {
          console.error("🔍 403 Analysis: Permission denied");
          console.error("  Possible causes:");
          console.error("  - User doesn't own this notification");
          console.error("  - User doesn't have delete permissions");
          console.error("  - Backend permission logic issue");
        } else if (deleteResponse.status === 401) {
          console.error("🔍 401 Analysis: Authentication failed");
          console.error("  Possible causes:");
          console.error("  - Token expired");
          console.error("  - Invalid token");
          console.error("  - Backend authentication issue");
        }
      } catch (parseError) {
        console.error("❌ Could not parse error response as JSON");
      }
    }

    // Step 5: Test frontend notification system
    console.log("\n🖥️ === STEP 5: TEST FRONTEND NOTIFICATION SYSTEM ===");

    // Check if useNotifications hook is available
    if (window.React && window.React.version) {
      console.log("⚛️ React detected, testing frontend hooks...");

      // Try to trigger a refresh of the notifications
      const refreshEvent = new CustomEvent("refreshNotifications");
      window.dispatchEvent(refreshEvent);
      console.log("🔄 Triggered frontend notification refresh");
    }

    // Check localStorage for any cached data
    console.log("💾 LocalStorage check:");
    const keys = Object.keys(localStorage);
    const relevantKeys = keys.filter(
      (key) =>
        key.includes("notification") ||
        key.includes("auth") ||
        key.includes("user")
    );

    relevantKeys.forEach((key) => {
      const value = localStorage.getItem(key);
      console.log(
        `  ${key}: ${value ? value.substring(0, 50) + "..." : "null"}`
      );
    });

    console.log("\n🎯 === DEBUG SUMMARY ===");
    console.log("✅ User authentication: Working");
    console.log("✅ Notification fetching: Working");
    console.log(
      `${deleteResponse.ok ? "✅" : "❌"} Notification deletion: ${
        deleteResponse.ok ? "Working" : "Failed"
      }`
    );

    if (!deleteResponse.ok) {
      console.log("\n💡 RECOMMENDATIONS:");
      console.log("1. Check backend logs for detailed error information");
      console.log("2. Verify user permissions in the backend");
      console.log(
        "3. Check if notification ownership is correctly implemented"
      );
      console.log("4. Test with a different user to see if it's user-specific");
    }
  } catch (error) {
    console.error("❌ Debug script failed:", error);
    console.error("❌ Error details:", error.message);
    console.error("❌ Stack trace:", error.stack);
  }
};

// Also create a simple test function for quick testing
window.quickDeleteTest = async function (notificationId) {
  console.log(`🚀 Quick delete test for notification ${notificationId}`);

  const token = localStorage.getItem("admin_auth_token");
  if (!token) {
    console.error("❌ No auth token found");
    return;
  }

  try {
    const response = await fetch(
      `http://127.0.0.1:8001/v1.0/notifications/${notificationId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response: ${text}`);

    return response.ok;
  } catch (error) {
    console.error("❌ Quick test failed:", error);
    return false;
  }
};

console.log("🔍 Delete notification debug script loaded!");
console.log("📋 Available functions:");
console.log("  - debugDeleteNotifications() - Comprehensive debug test");
console.log(
  "  - quickDeleteTest(id) - Quick delete test for specific notification"
);
console.log("");
console.log("💡 Usage:");
console.log("1. Login as jakaria_123 (password: jakaria_123)");
console.log("2. Run: debugDeleteNotifications()");
