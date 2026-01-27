/**
 * Enhanced debug script for notification timestamp and mark-as-read issues
 * Run this in the browser console to debug notification problems
 */

// Function to debug notification timestamps
function debugNotificationTimestamps() {
  console.log("🔍 Starting notification timestamp debug...");

  // Check if we're on a page with notifications
  const notificationElements = document.querySelectorAll("[data-timestamp]");

  if (notificationElements.length === 0) {
    console.log(
      "❌ No notification elements found with data-timestamp attribute",
    );
    console.log("🔍 Looking for RealTimeTimestamp components...");

    // Try to find any timestamp-related elements
    const timestampElements = document.querySelectorAll(
      '*[class*="timestamp"], *[title*="202"]',
    );
    console.log(
      `📊 Found ${timestampElements.length} potential timestamp elements`,
    );

    timestampElements.forEach((element, index) => {
      console.log(`Element ${index + 1}:`, {
        element: element,
        textContent: element.textContent,
        title: element.title,
        className: element.className,
      });
    });

    return;
  }

  console.log(
    `📊 Found ${notificationElements.length} notification timestamp elements`,
  );

  notificationElements.forEach((element, index) => {
    const timestamp = element.getAttribute("data-timestamp");
    const displayText = element.textContent;

    console.group(`📅 Notification ${index + 1}`);
    console.log("Raw timestamp:", timestamp);
    console.log("Display text:", displayText);
    console.log("Parsed date:", new Date(timestamp).toLocaleString());

    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffMinutes = (now - notificationTime) / (1000 * 60);

    console.log(`⏱️ Time difference: ${diffMinutes.toFixed(2)} minutes ago`);

    if (diffMinutes < 1) {
      console.log('✅ Should show "Just now" or seconds');
    } else if (diffMinutes < 60) {
      console.log(`✅ Should show "${Math.floor(diffMinutes)}m ago"`);
    } else if (diffMinutes < 1440) {
      console.log(`✅ Should show "${Math.floor(diffMinutes / 60)}h ago"`);
    }

    console.groupEnd();
  });
}

// Function to check notification state
function debugNotificationState() {
  console.log("🔍 Checking notification state...");

  // Check localStorage for cached notifications
  const cachedNotifications = localStorage.getItem("notifications");
  if (cachedNotifications) {
    try {
      const parsed = JSON.parse(cachedNotifications);
      console.log("💾 Cached notifications:", parsed);
    } catch (e) {
      console.log("❌ Error parsing cached notifications:", e);
    }
  } else {
    console.log("📭 No cached notifications found");
  }

  // Check sessionStorage as well
  const sessionNotifications = sessionStorage.getItem("notifications");
  if (sessionNotifications) {
    try {
      const parsed = JSON.parse(sessionNotifications);
      console.log("�️ Session notifications:", parsed);
    } catch (e) {
      console.log("❌ Error parsing session notifications:", e);
    }
  }
}

// Function to simulate notification click
function debugNotificationClick(notificationId) {
  console.log(`🖱️ Simulating click on notification ${notificationId}`);

  // Find notification element
  const notificationElement = document.querySelector(
    `[data-notification-id="${notificationId}"]`,
  );
  if (notificationElement) {
    console.log("📍 Found notification element:", notificationElement);
    notificationElement.click();
  } else {
    console.log("❌ Notification element not found");

    // Try to find by other means
    const allNotifications = document.querySelectorAll(
      '[class*="notification"], [class*="p-4"]',
    );
    console.log(
      `📊 Found ${allNotifications.length} potential notification elements`,
    );
  }
}

// Function to check API responses
function debugApiCalls() {
  console.log("🔍 Monitoring API calls...");

  // Override fetch to log notification API calls
  const originalFetch = window.fetch;
  window.fetch = function (...args) {
    const url = args[0];
    if (typeof url === "string" && url.includes("notifications")) {
      console.log("📡 Notification API call:", url);
      return originalFetch.apply(this, args).then((response) => {
        console.log("📡 Notification API response:", response);
        return response
          .clone()
          .json()
          .then((data) => {
            console.log("📡 Notification API data:", data);
            return response;
          })
          .catch(() => response);
      });
    }
    return originalFetch.apply(this, args);
  };

  console.log("✅ API monitoring enabled");
}

// Function to inspect notification data structure
function inspectNotificationData() {
  console.log("🔍 Inspecting notification data structure...");

  // Try to find notification data in React components
  const notificationCards = document.querySelectorAll(
    '[class*="p-4"][class*="rounded-lg"]',
  );
  console.log(
    `📊 Found ${notificationCards.length} potential notification cards`,
  );

  // Look for any global notification state
  if (
    window.React &&
    window.React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
  ) {
    console.log(
      "⚛️ React detected, but state inspection requires React DevTools",
    );
  }

  // Check for any exposed notification data
  if (window.notifications) {
    console.log("📋 Found global notifications:", window.notifications);
  }

  // Check for notification-related console logs
  console.log(
    "📝 Check browser console for notification-related logs with these prefixes:",
  );
  console.log("  📤 - Using sent_at timestamp");
  console.log("  📅 - Using created_at timestamp");
  console.log("  📖 - Marking notification as read");
  console.log("  ✅ - Operation successful");
  console.log("  ❌ - Error occurred");
}

// Export functions for manual use
window.debugNotificationTimestamps = debugNotificationTimestamps;
window.debugNotificationState = debugNotificationState;
window.debugNotificationClick = debugNotificationClick;
window.debugApiCalls = debugApiCalls;
window.inspectNotificationData = inspectNotificationData;

console.log("🛠️ Enhanced notification debug tools loaded!");
console.log("📋 Available functions:");
console.log("  - debugNotificationTimestamps() - Check timestamp display");
console.log("  - debugNotificationState() - Check notification state");
console.log("  - debugNotificationClick(id) - Simulate notification click");
console.log("  - debugApiCalls() - Monitor API calls");
console.log("  - inspectNotificationData() - Inspect data structure");
console.log("");
console.log("💡 Quick start:");
console.log("  1. Run debugApiCalls() to monitor API requests");
console.log("  2. Run debugNotificationTimestamps() to check timestamps");
console.log("  3. Click on a notification and check console logs");
console.log(
  "  4. Use the Debug button on notifications page for detailed inspection",
);
