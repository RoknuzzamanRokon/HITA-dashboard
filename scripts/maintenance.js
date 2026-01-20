#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const envPath = path.join(process.cwd(), ".env.local");
const maintenanceEnvPath = path.join(process.cwd(), ".env.maintenance");

const command = process.argv[2];

if (command === "enable") {
  // Copy maintenance env to .env.local
  if (fs.existsSync(maintenanceEnvPath)) {
    fs.copyFileSync(maintenanceEnvPath, envPath);
    console.log(
      "✅ Maintenance mode enabled! Restart your development server.",
    );
  } else {
    console.error("❌ .env.maintenance file not found");
  }
} else if (command === "disable") {
  // Read current .env.local and set maintenance to false
  if (fs.existsSync(envPath)) {
    let envContent = fs.readFileSync(envPath, "utf8");
    envContent = envContent.replace(
      /NEXT_PUBLIC_MAINTENANCE_MODE=true/g,
      "NEXT_PUBLIC_MAINTENANCE_MODE=false",
    );
    fs.writeFileSync(envPath, envContent);
    console.log(
      "✅ Maintenance mode disabled! Restart your development server.",
    );
  } else {
    console.error("❌ .env.local file not found");
  }
} else {
  console.log("Usage:");
  console.log(
    "  node scripts/maintenance.js enable   - Enable maintenance mode",
  );
  console.log(
    "  node scripts/maintenance.js disable  - Disable maintenance mode",
  );
}
