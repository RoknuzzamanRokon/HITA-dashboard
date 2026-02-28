#!/usr/bin/env node

/**
 * Maintenance Mode Toggle Script
 * Quickly enable or disable maintenance mode
 */

const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const command = args[0];

const envPath = path.join(process.cwd(), ".env.local");

function readEnvFile() {
  if (!fs.existsSync(envPath)) {
    console.log("❌ .env.local file not found!");
    console.log("Creating .env.local from .env.example...");

    const examplePath = path.join(process.cwd(), ".env.example");
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      console.log("✅ Created .env.local");
    } else {
      console.log("❌ .env.example not found either!");
      process.exit(1);
    }
  }

  return fs.readFileSync(envPath, "utf-8");
}

function writeEnvFile(content) {
  fs.writeFileSync(envPath, content, "utf-8");
}

function enableMaintenance() {
  console.log("🔧 Enabling maintenance mode...\n");

  let content = readEnvFile();

  // Check if NEXT_PUBLIC_MAINTENANCE_MODE exists
  if (content.includes("NEXT_PUBLIC_MAINTENANCE_MODE")) {
    // Replace existing value
    content = content.replace(
      /NEXT_PUBLIC_MAINTENANCE_MODE=.*/,
      "NEXT_PUBLIC_MAINTENANCE_MODE=true",
    );
  } else {
    // Add new line
    content +=
      "\n# Maintenance Mode - Set to true to enable maintenance page\n";
    content += "NEXT_PUBLIC_MAINTENANCE_MODE=true\n";
  }

  writeEnvFile(content);

  console.log("✅ Maintenance mode ENABLED");
  console.log("\n📋 Next steps:");
  console.log("   1. Restart your dev server:");
  console.log("      - Stop: Ctrl+C");
  console.log("      - Clear cache: Remove-Item -Recurse -Force .next");
  console.log("      - Start: npm run dev");
  console.log("   2. Visit any page - you'll see the maintenance page");
  console.log("\n💡 To disable: node scripts/toggle-maintenance.js off");
}

function disableMaintenance() {
  console.log("🔓 Disabling maintenance mode...\n");

  let content = readEnvFile();

  // Replace existing value
  if (content.includes("NEXT_PUBLIC_MAINTENANCE_MODE")) {
    content = content.replace(
      /NEXT_PUBLIC_MAINTENANCE_MODE=.*/,
      "NEXT_PUBLIC_MAINTENANCE_MODE=false",
    );
  } else {
    // Add new line
    content +=
      "\n# Maintenance Mode - Set to true to enable maintenance page\n";
    content += "NEXT_PUBLIC_MAINTENANCE_MODE=false\n";
  }

  writeEnvFile(content);

  console.log("✅ Maintenance mode DISABLED");
  console.log("\n📋 Next steps:");
  console.log("   1. Restart your dev server:");
  console.log("      - Stop: Ctrl+C");
  console.log("      - Clear cache: Remove-Item -Recurse -Force .next");
  console.log("      - Start: npm run dev");
  console.log("   2. Visit any page - site should work normally");
  console.log("\n💡 To enable: node scripts/toggle-maintenance.js on");
}

function showStatus() {
  console.log("📊 Current Maintenance Mode Status:\n");

  const content = readEnvFile();
  const match = content.match(/NEXT_PUBLIC_MAINTENANCE_MODE=(.*)/);

  if (match) {
    const value = match[1].trim();
    if (value === "true") {
      console.log("   🔧 Status: ENABLED");
      console.log("   All visitors will see the maintenance page");
      console.log("\n💡 To disable: node scripts/toggle-maintenance.js off");
    } else {
      console.log("   ✅ Status: DISABLED");
      console.log("   Site is accessible normally");
      console.log("\n💡 To enable: node scripts/toggle-maintenance.js on");
    }
  } else {
    console.log("   ⚠️  Status: NOT SET (defaults to disabled)");
    console.log("\n💡 To enable: node scripts/toggle-maintenance.js on");
  }
}

function showHelp() {
  console.log("🔧 Maintenance Mode Toggle Script\n");
  console.log("Usage:");
  console.log("  node scripts/toggle-maintenance.js <command>\n");
  console.log("Commands:");
  console.log("  on       Enable maintenance mode");
  console.log("  off      Disable maintenance mode");
  console.log("  status   Show current status");
  console.log("  help     Show this help message\n");
  console.log("Examples:");
  console.log("  node scripts/toggle-maintenance.js on");
  console.log("  node scripts/toggle-maintenance.js off");
  console.log("  node scripts/toggle-maintenance.js status\n");
  console.log("📚 For more info: docs/MAINTENANCE_MODE_GUIDE.md");
}

// Main execution
switch (command) {
  case "on":
  case "enable":
    enableMaintenance();
    break;
  case "off":
  case "disable":
    disableMaintenance();
    break;
  case "status":
    showStatus();
    break;
  case "help":
  case "--help":
  case "-h":
    showHelp();
    break;
  default:
    console.log("❌ Invalid command\n");
    showHelp();
    process.exit(1);
}
