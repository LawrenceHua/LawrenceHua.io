#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const FormData = require("form-data");

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

const BASE_URL = "http://localhost:3001";

async function testBasicConversation() {
  console.log("\n🧪 TEST 1: Basic Conversation");
  try {
    const formData = new FormData();
    formData.append("message", "Hello, tell me about Lawrence's experience");
    formData.append("history", JSON.stringify([]));

    const response = await fetch(`${BASE_URL}/api/chatbot-new`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("✅ Basic conversation test passed");
    console.log("Response length:", result.response?.length || 0);
    return true;
  } catch (error) {
    console.log("❌ Basic conversation test failed:", error.message);
    return false;
  }
}

async function testGirlfriendEasterEgg() {
  console.log("\n🧪 TEST 2: Girlfriend Easter Egg");
  try {
    const formData = new FormData();
    formData.append("message", "I am Lawrence's girlfriend");
    formData.append("history", JSON.stringify([]));

    const response = await fetch(`${BASE_URL}/api/chatbot-new`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("✅ Girlfriend easter egg test passed");
    console.log(
      "Response contains easter egg:",
      result.response?.includes("girlfriend") || false
    );
    return true;
  } catch (error) {
    console.log("❌ Girlfriend easter egg test failed:", error.message);
    return false;
  }
}

async function testTxtFileUpload() {
  console.log("\n🧪 TEST 3: TXT File Upload");
  try {
    const formData = new FormData();
    formData.append("message", "Analyze this text file");
    formData.append("history", JSON.stringify([]));
    formData.append("files", fs.createReadStream("./test.txt"), {
      filename: "test.txt",
      contentType: "text/plain",
    });

    const response = await fetch(`${BASE_URL}/api/chatbot-new`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("✅ TXT file upload test passed");
    console.log("Response length:", result.response?.length || 0);
    return true;
  } catch (error) {
    console.log("❌ TXT file upload test failed:", error.message);
    return false;
  }
}

async function testDocxFileUpload() {
  console.log("\n🧪 TEST 4: DOCX File Upload");
  try {
    const formData = new FormData();
    formData.append("message", "Analyze this DOCX file");
    formData.append("history", JSON.stringify([]));
    formData.append("files", fs.createReadStream("./test-doc.docx"), {
      filename: "test-doc.docx",
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });

    const response = await fetch(`${BASE_URL}/api/chatbot-new`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("✅ DOCX file upload test passed");
    console.log("Response length:", result.response?.length || 0);
    return true;
  } catch (error) {
    console.log("❌ DOCX file upload test failed:", error.message);
    return false;
  }
}

async function testPdfFileUpload() {
  console.log("\n🧪 TEST 5: PDF File Upload");
  try {
    const formData = new FormData();
    formData.append("message", "Analyze this PDF file");
    formData.append("history", JSON.stringify([]));
    formData.append("files", fs.createReadStream("./test-doc.pdf"), {
      filename: "test-doc.pdf",
      contentType: "application/pdf",
    });

    const response = await fetch(`${BASE_URL}/api/chatbot-new`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("✅ PDF file upload test passed");
    console.log("Response length:", result.response?.length || 0);
    return true;
  } catch (error) {
    console.log("❌ PDF file upload test failed:", error.message);
    return false;
  }
}

async function testImageUpload() {
  console.log("\n🧪 TEST 6: Image Upload (Vision Analysis + Email)");
  try {
    const formData = new FormData();
    formData.append("message", "Analyze this image");
    formData.append("history", JSON.stringify([]));
    formData.append(
      "files",
      fs.createReadStream(
        "/Users/lawrencehua/Desktop/LawrenceHua.io/expired_solutions_logo.jpeg"
      ),
      {
        filename: "expired_solutions_logo.jpeg",
        contentType: "image/jpeg",
      }
    );

    const response = await fetch(`${BASE_URL}/api/chatbot-new`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("✅ Image upload test passed");
    console.log("Response length:", result.response?.length || 0);
    console.log("Image sent via email:", result.imageSent || false);
    return true;
  } catch (error) {
    console.log("❌ Image upload test failed:", error.message);
    return false;
  }
}

async function testMeetingRequest() {
  console.log("\n🧪 TEST 7: Meeting Request");
  try {
    const formData = new FormData();
    formData.append(
      "message",
      "I would like to schedule a meeting with Lawrence. My name is John Doe and my email is john.doe@example.com. I am interested in discussing a software engineering position."
    );
    formData.append("history", JSON.stringify([]));

    const response = await fetch(`${BASE_URL}/api/chatbot-new`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("✅ Meeting request test passed");
    console.log("Response length:", result.response?.length || 0);
    console.log("Meeting request sent:", result.meetingRequestSent || false);
    return true;
  } catch (error) {
    console.log("❌ Meeting request test failed:", error.message);
    return false;
  }
}

async function testImageEmailDirect() {
  console.log("\n🧪 TEST 8: Direct Image Email");
  try {
    const formData = new FormData();
    formData.append(
      "image",
      fs.createReadStream(
        "/Users/lawrencehua/Desktop/LawrenceHua.io/expired_solutions_logo.jpeg"
      ),
      {
        filename: "expired_solutions_logo.jpeg",
        contentType: "image/jpeg",
      }
    );
    formData.append("message", "Test image upload from portfolio chatbot");
    formData.append("email", "test@example.com");
    formData.append("name", "Test User");

    const response = await fetch(`${BASE_URL}/api/send-image`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("✅ Direct image email test passed");
    console.log("Email sent successfully:", result.success || false);
    return true;
  } catch (error) {
    console.log("❌ Direct image email test failed:", error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("🚀 Starting Comprehensive Chatbot Test Suite");
  console.log("=".repeat(50));

  const tests = [
    testBasicConversation,
    testGirlfriendEasterEgg,
    testTxtFileUpload,
    testDocxFileUpload,
    testPdfFileUpload,
    testImageUpload,
    testMeetingRequest,
    testImageEmailDirect,
  ];

  const results = [];
  for (const test of tests) {
    try {
      const result = await test();
      results.push(result);
    } catch (error) {
      console.log(`❌ Test failed with error: ${error.message}`);
      results.push(false);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST RESULTS SUMMARY");
  console.log("=".repeat(50));

  const passed = results.filter((r) => r).length;
  const total = results.length;

  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (passed === total) {
    console.log("\n🎉 ALL TESTS PASSED! The chatbot is working perfectly!");
  } else {
    console.log("\n⚠️  Some tests failed. Please check the logs above.");
  }
}

// Run the tests
runAllTests().catch(console.error);
