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

  console.log("🔄 Next Versions:");
  console.log(`   Next Patch: ${nextPatch}`);
  console.log(`   Next Minor: ${nextMinor}`);
  console.log(`   Next Major: ${nextMajor}`);
  console.log("");

  // Show version progression
  console.log("📈 Version Progression:");
  for (let i = 0; i < 5; i++) {
    const futurePatch = patch + i;
    if (futurePatch < 10) {
      console.log(`   ${major}.${minor}.${futurePatch}`);
    } else {
      const newMinor = minor + Math.floor(futurePatch / 10);
      const newPatch = futurePatch % 10;
      console.log(`   ${major}.${newMinor}.${newPatch}`);
    }
  }

  console.log("");
  console.log("💡 Note: This follows the pattern you requested:");
  console.log("   - Every push increments the patch version");
  console.log("   - Every 10 increments moves to the next minor version");
  console.log("   - Example: 1.0 → 1.9 → 2.0 → 2.9 → 3.0");

  const newPatch = patch + 1;
  const oldVersion = packageJson.version;
  packageJson.version = `${major}.${minor}.${newPatch}`;

  // Write the updated package.json
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));

  console.log("");
  console.log(
    `✅ Version updated from ${oldVersion} to ${packageJson.version}`
  );
  console.log(`📝 Updated file: ${packagePath}`);
} catch (error) {
  console.error("❌ Error updating version:", error.message);
  process.exit(1);
}
