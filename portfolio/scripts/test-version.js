#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Read package.json
const packagePath = path.join(__dirname, "..", "package.json");

try {
  const packageJson = require(packagePath);

  const version = packageJson.version.split(".");
  const major = parseInt(version[0]);
  const minor = parseInt(version[1]);
  const patch = parseInt(version[2]);

  console.log("📦 Current Version Information:");
  console.log(`   Version: ${packageJson.version}`);
  console.log(`   Major: ${major}`);
  console.log(`   Minor: ${minor}`);
  console.log(`   Patch: ${patch}`);
  console.log("");

  // Calculate next versions
  const nextPatch = `${major}.${minor}.${patch + 1}`;
  const nextMinor = `${major}.${minor + 1}.0`;
  const nextMajor = `${major + 1}.0.0`;

  console.log("🔄 Next Versions (Preview - no changes made):");
  console.log(`   Next Patch: ${nextPatch}`);
  console.log(`   Next Minor: ${nextMinor}`);
  console.log(`   Next Major: ${nextMajor}`);
  console.log("");

  console.log("💡 To actually increment the version, run:");
  console.log("   node scripts/version.js");
} catch (error) {
  console.error("❌ Error reading version:", error.message);
  process.exit(1);
}
