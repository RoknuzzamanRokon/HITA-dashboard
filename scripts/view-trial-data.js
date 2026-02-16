/**
 * View Free Trial Requests Data
 * Run: node scripts/view-trial-data.js
 */

const fs = require("fs");
const path = require("path");

const DATA_FILE = path.join(process.cwd(), "data", "trial-requests.json");

console.log("📊 Free Trial Requests Data\n");
console.log("=".repeat(80));

try {
  if (!fs.existsSync(DATA_FILE)) {
    console.log("❌ No data file found at:", DATA_FILE);
    console.log(
      "💡 Submit a trial request first at: http://localhost:3001/free-trial",
    );
    process.exit(0);
  }

  const data = fs.readFileSync(DATA_FILE, "utf-8");
  const requests = JSON.parse(data);

  if (requests.length === 0) {
    console.log("📭 No trial requests yet");
    console.log(
      "💡 Submit a trial request at: http://localhost:3001/free-trial",
    );
    process.exit(0);
  }

  console.log(`\n✅ Total Requests: ${requests.length}\n`);

  // Statistics
  const stats = {
    pending: requests.filter((r) => r.status === "pending").length,
    approved: requests.filter((r) => r.status === "approved").length,
    rejected: requests.filter((r) => r.status === "rejected").length,
  };

  console.log("📈 Statistics:");
  console.log(`   Pending:  ${stats.pending}`);
  console.log(`   Approved: ${stats.approved}`);
  console.log(`   Rejected: ${stats.rejected}`);
  console.log("\n" + "=".repeat(80) + "\n");

  // Display each request
  requests.forEach((request, index) => {
    console.log(`Request #${index + 1}`);
    console.log(`   ID:            ${request.id}`);
    console.log(`   Username:      ${request.username}`);
    console.log(`   Business:      ${request.business_name}`);
    console.log(`   Email:         ${request.email}`);
    console.log(`   Phone:         ${request.phone_number}`);
    console.log(`   Message:       ${request.message || "(no message)"}`);
    console.log(`   Status:        ${request.status}`);
    console.log(
      `   Request Date:  ${new Date(request.request_date).toLocaleString()}`,
    );
    console.log(`   IP Address:    ${request.ip_address || "unknown"}`);
    console.log("\n" + "-".repeat(80) + "\n");
  });

  console.log(`\n💾 Data file location: ${DATA_FILE}`);
  console.log(
    `📊 View in admin dashboard: http://localhost:3001/dashboard/admin/free-trials\n`,
  );
} catch (error) {
  console.error("❌ Error reading data:", error.message);
  process.exit(1);
}
