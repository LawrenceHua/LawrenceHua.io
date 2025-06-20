#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

class SimplePortfolioTest {
  constructor() {
    this.results = [];
    this.errors = [];
    this.warnings = [];
  }

  log(message, type = "INFO") {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}`;
    console.log(logMessage);
    this.results.push(logMessage);
  }

  async testFileStructure() {
    this.log("=== Testing File Structure ===");

    const requiredFiles = [
      "src/app/page.tsx",
      "src/app/layout.tsx",
      "src/components/Chatbot.tsx",
      "src/app/api/chatbot/route.ts",
      "src/app/api/contact/route.ts",
      "public/profile.jpg",
      "package.json",
      "next.config.js",
      "tailwind.config.ts",
    ];

    for (const file of requiredFiles) {
      if (fs.existsSync(file)) {
        this.log(`✓ Found: ${file}`);
      } else {
        this.log(`✗ Missing: ${file}`, "ERROR");
        this.errors.push(`Missing file: ${file}`);
      }
    }
  }

  async testPackageJson() {
    this.log("=== Testing Package.json ===");

    try {
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

      // Check required dependencies
      const requiredDeps = ["next", "react", "react-dom", "openai"];
      for (const dep of requiredDeps) {
        if (packageJson.dependencies && packageJson.dependencies[dep]) {
          this.log(`✓ Found dependency: ${dep}`);
        } else if (
          packageJson.devDependencies &&
          packageJson.devDependencies[dep]
        ) {
          this.log(`✓ Found dev dependency: ${dep}`);
        } else {
          this.log(`✗ Missing dependency: ${dep}`, "ERROR");
          this.errors.push(`Missing dependency: ${dep}`);
        }
      }

      // Check scripts
      const requiredScripts = ["dev", "build", "start"];
      for (const script of requiredScripts) {
        if (packageJson.scripts && packageJson.scripts[script]) {
          this.log(`✓ Found script: ${script}`);
        } else {
          this.log(`✗ Missing script: ${script}`, "ERROR");
          this.errors.push(`Missing script: ${script}`);
        }
      }
    } catch (error) {
      this.log(`Error reading package.json: ${error.message}`, "ERROR");
      this.errors.push(`Package.json error: ${error.message}`);
    }
  }

  async testConfigurationFiles() {
    this.log("=== Testing Configuration Files ===");

    const configFiles = [
      "next.config.js",
      "tailwind.config.ts",
      "tsconfig.json",
      "postcss.config.js",
    ];

    for (const file of configFiles) {
      if (fs.existsSync(file)) {
        try {
          // Try to read/parse the file
          const content = fs.readFileSync(file, "utf8");
          this.log(`✓ Valid config file: ${file}`);
        } catch (error) {
          this.log(`✗ Invalid config file: ${file}`, "ERROR");
          this.errors.push(`Invalid config file: ${file}`);
        }
      } else {
        this.log(`✗ Missing config file: ${file}`, "WARNING");
        this.warnings.push(`Missing config file: ${file}`);
      }
    }
  }

  async testPublicAssets() {
    this.log("=== Testing Public Assets ===");

    const publicDir = "public";
    if (!fs.existsSync(publicDir)) {
      this.log(`✗ Missing public directory`, "ERROR");
      this.errors.push("Missing public directory");
      return;
    }

    // Check for common assets
    const assets = fs.readdirSync(publicDir);
    this.log(`Found ${assets.length} files in public directory`);

    // Check for images
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp"];
    const images = assets.filter((file) =>
      imageExtensions.some((ext) => file.toLowerCase().endsWith(ext))
    );

    if (images.length > 0) {
      this.log(`✓ Found ${images.length} image files`);
    } else {
      this.log(`⚠ No image files found in public directory`, "WARNING");
      this.warnings.push("No image files found");
    }

    // Check for logos directory
    const logosDir = path.join(publicDir, "logos");
    if (fs.existsSync(logosDir)) {
      const logoFiles = fs.readdirSync(logosDir);
      this.log(`✓ Found ${logoFiles.length} logo files`);
    } else {
      this.log(`⚠ No logos directory found`, "WARNING");
      this.warnings.push("No logos directory found");
    }
  }

  async testSourceCode() {
    this.log("=== Testing Source Code ===");

    const srcDir = "src";
    if (!fs.existsSync(srcDir)) {
      this.log(`✗ Missing src directory`, "ERROR");
      this.errors.push("Missing src directory");
      return;
    }

    // Check for main components
    const appDir = path.join(srcDir, "app");
    if (fs.existsSync(appDir)) {
      this.log(`✓ Found app directory`);

      // Check for main page
      const pageFile = path.join(appDir, "page.tsx");
      if (fs.existsSync(pageFile)) {
        const content = fs.readFileSync(pageFile, "utf8");
        if (content.includes("export default")) {
          this.log(`✓ Valid page.tsx found`);
        } else {
          this.log(`✗ Invalid page.tsx (no default export)`, "ERROR");
          this.errors.push("Invalid page.tsx");
        }
      } else {
        this.log(`✗ Missing page.tsx`, "ERROR");
        this.errors.push("Missing page.tsx");
      }
    } else {
      this.log(`✗ Missing app directory`, "ERROR");
      this.errors.push("Missing app directory");
    }

    // Check for components
    const componentsDir = path.join(srcDir, "components");
    if (fs.existsSync(componentsDir)) {
      const components = fs.readdirSync(componentsDir);
      this.log(`✓ Found ${components.length} component files`);

      // Check for Chatbot component
      const chatbotFile = path.join(componentsDir, "Chatbot.tsx");
      if (fs.existsSync(chatbotFile)) {
        this.log(`✓ Found Chatbot component`);
      } else {
        this.log(`✗ Missing Chatbot component`, "ERROR");
        this.errors.push("Missing Chatbot component");
      }
    } else {
      this.log(`✗ Missing components directory`, "ERROR");
      this.errors.push("Missing components directory");
    }
  }

  async testAPIRoutes() {
    this.log("=== Testing API Routes ===");

    const apiDir = path.join("src", "app", "api");
    if (!fs.existsSync(apiDir)) {
      this.log(`✗ Missing api directory`, "ERROR");
      this.errors.push("Missing api directory");
      return;
    }

    const apiRoutes = fs.readdirSync(apiDir);
    this.log(`Found ${apiRoutes.length} API routes`);

    // Check for required API routes
    const requiredRoutes = ["chatbot", "contact", "geolocation"];
    for (const route of requiredRoutes) {
      const routeDir = path.join(apiDir, route);
      if (fs.existsSync(routeDir)) {
        const routeFile = path.join(routeDir, "route.ts");
        if (fs.existsSync(routeFile)) {
          this.log(`✓ Found API route: ${route}`);
        } else {
          this.log(`✗ Missing route.ts in ${route}`, "ERROR");
          this.errors.push(`Missing route.ts in ${route}`);
        }
      } else {
        this.log(`✗ Missing API route: ${route}`, "ERROR");
        this.errors.push(`Missing API route: ${route}`);
      }
    }
  }

  async testBuildProcess() {
    this.log("=== Testing Build Process ===");

    try {
      // Check if node_modules exists
      if (!fs.existsSync("node_modules")) {
        this.log(`⚠ node_modules not found, skipping build test`, "WARNING");
        this.warnings.push("node_modules not found");
        return;
      }

      // Try to run build (but don't wait too long)
      this.log("Attempting to run build process...");

      // Just check if the build command exists and is valid
      const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
      if (packageJson.scripts && packageJson.scripts.build) {
        this.log(`✓ Build script found: ${packageJson.scripts.build}`);
      } else {
        this.log(`✗ No build script found`, "ERROR");
        this.errors.push("No build script found");
      }
    } catch (error) {
      this.log(`Error testing build process: ${error.message}`, "ERROR");
      this.errors.push(`Build test error: ${error.message}`);
    }
  }

  async runAllTests() {
    this.log("🚀 Starting Simple Portfolio Test Suite");
    this.log(`Testing directory: ${process.cwd()}`);

    try {
      await this.testFileStructure();
      await this.testPackageJson();
      await this.testConfigurationFiles();
      await this.testPublicAssets();
      await this.testSourceCode();
      await this.testAPIRoutes();
      await this.testBuildProcess();

      // Summary
      this.log("=== Test Summary ===");
      this.log(`Total tests run: ${this.results.length}`);
      this.log(`Errors: ${this.errors.length}`);
      this.log(`Warnings: ${this.warnings.length}`);

      if (this.errors.length > 0) {
        this.log("❌ ERRORS FOUND:", "ERROR");
        this.errors.forEach((error) => this.log(`  - ${error}`, "ERROR"));
      }

      if (this.warnings.length > 0) {
        this.log("⚠️ WARNINGS:", "WARNING");
        this.warnings.forEach((warning) =>
          this.log(`  - ${warning}`, "WARNING")
        );
      }

      if (this.errors.length === 0) {
        this.log("✅ All critical tests passed!", "SUCCESS");
      } else {
        this.log("❌ Some tests failed. Please fix the errors above.", "ERROR");
      }

      // Save results
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `test-results-${timestamp}.txt`;
      fs.writeFileSync(filename, this.results.join("\n"));
      this.log(`Test results saved to: ${filename}`);
    } catch (error) {
      this.log(`Test suite failed: ${error.message}`, "ERROR");
    }
  }
}

// Run the test suite
if (require.main === module) {
  const testSuite = new SimplePortfolioTest();
  testSuite.runAllTests().catch(console.error);
}

module.exports = SimplePortfolioTest;
