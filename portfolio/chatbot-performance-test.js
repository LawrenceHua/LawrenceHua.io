#!/usr/bin/env node

const FormData = require("form-data");
const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));
const fs = require("fs");
const path = require("path");

// Test configuration
const BASE_URL = "http://localhost:3003"; // Adjust port if needed
const CHATBOT_API = `${BASE_URL}/api/chatbot`;

// Test scenarios
const testScenarios = [
  {
    name: "Quick Message Request",
    type: "message",
    input: "I want to work with Lawrence on a project",
    expectedFeatures: ["contact intent", "message flow"],
  },
  {
    name: "Quick Meeting Request",
    type: "meeting",
    input: "Can we schedule a meeting to discuss opportunities?",
    expectedFeatures: ["contact intent", "meeting flow"],
  },
  {
    name: "Skills Question",
    type: "skills",
    input: "What are Lawrence's main technical skills?",
    expectedFeatures: ["skills extraction", "knowledge base"],
  },
  {
    name: "Experience Question",
    type: "experience",
    input: "Tell me about Lawrence's work experience",
    expectedFeatures: ["experience summary", "timeline data"],
  },
  {
    name: "Project Question",
    type: "projects",
    input: "What projects has Lawrence worked on?",
    expectedFeatures: ["project listing", "technical details"],
  },
  {
    name: "File Upload - Text",
    type: "file_upload",
    input: "Please analyze this document for Lawrence",
    file: "test-doc.txt",
    expectedFeatures: ["file processing", "content analysis"],
  },
  {
    name: "File Upload - PDF",
    type: "file_upload",
    input: "Review this PDF document",
    file: "test-doc.pdf",
    expectedFeatures: ["PDF parsing", "content extraction"],
  },
  {
    name: "Complex Analysis",
    type: "complex",
    input:
      "Compare Lawrence's skills to typical product manager requirements and suggest areas for growth",
    expectedFeatures: ["multi-step reasoning", "comparative analysis"],
  },
];

// Performance metrics
const metrics = {
  totalTests: 0,
  passed: 0,
  failed: 0,
  totalTime: 0,
  averageTime: 0,
  results: [],
};

// Helper function to create test file if it doesn't exist
const createTestFile = (filename) => {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    if (filename.endsWith(".txt")) {
      fs.writeFileSync(
        filePath,
        "This is a test document for chatbot file upload testing. It contains sample content for analysis."
      );
    } else if (filename.endsWith(".pdf")) {
      // Create a simple text file as PDF placeholder
      fs.writeFileSync(
        filePath,
        "PDF placeholder - This represents a PDF document for testing purposes."
      );
    }
  }
  return filePath;
};

// Test individual scenario
const testScenario = async (scenario) => {
  console.log(`\n🧪 Testing: ${scenario.name}`);
  console.log(`📝 Input: "${scenario.input}"`);

  const startTime = Date.now();

  try {
    let formData;

    if (scenario.type === "file_upload") {
      // Create FormData for file upload
      formData = new FormData();
      formData.append("message", scenario.input);
      formData.append("history", JSON.stringify([]));

      // Create and attach test file
      const filePath = createTestFile(scenario.file);
      const fileBuffer = fs.readFileSync(filePath);
      formData.append("files", fileBuffer, {
        filename: scenario.file,
        contentType: scenario.file.endsWith(".pdf")
          ? "application/pdf"
          : "text/plain",
      });
    } else {
      // Regular message test
      formData = new FormData();
      formData.append("message", scenario.input);
      formData.append("history", JSON.stringify([]));
    }

    const response = await fetch(CHATBOT_API, {
      method: "POST",
      body: formData,
      headers: formData.getHeaders(),
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const responseText = data.response || "";

    // Analyze response quality
    const analysis = {
      hasResponse: responseText.length > 0,
      responseLength: responseText.length,
      containsRelevantInfo: scenario.expectedFeatures.some((feature) =>
        responseText
          .toLowerCase()
          .includes(feature.toLowerCase().replace(/[^a-z]/g, ""))
      ),
      isContactIntent: data.contactIntent || false,
      isCached: data.cached || false,
    };

    const result = {
      scenario: scenario.name,
      type: scenario.type,
      responseTime,
      success: response.ok && analysis.hasResponse,
      analysis,
      responsePreview:
        responseText.substring(0, 150) +
        (responseText.length > 150 ? "..." : ""),
    };

    // Log results
    console.log(`⏱️  Response Time: ${responseTime}ms`);
    console.log(`✅ Success: ${result.success}`);
    console.log(`📊 Response Length: ${analysis.responseLength} chars`);
    console.log(`🎯 Contact Intent: ${analysis.isContactIntent}`);
    console.log(`💾 Cached: ${analysis.isCached}`);
    console.log(`📖 Preview: "${result.responsePreview}"`);

    if (result.success) {
      metrics.passed++;
      console.log(`✅ PASSED`);
    } else {
      metrics.failed++;
      console.log(`❌ FAILED`);
    }

    metrics.results.push(result);
    metrics.totalTime += responseTime;

    return result;
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    console.log(`❌ ERROR: ${error.message}`);
    console.log(`⏱️  Failed after: ${responseTime}ms`);

    metrics.failed++;
    metrics.totalTime += responseTime;

    const result = {
      scenario: scenario.name,
      type: scenario.type,
      responseTime,
      success: false,
      error: error.message,
      analysis: null,
    };

    metrics.results.push(result);
    return result;
  }
};

// Run all tests
const runPerformanceTests = async () => {
  console.log("🚀 Starting Chatbot Performance Tests...\n");
  console.log(`📡 Testing against: ${CHATBOT_API}`);
  console.log(`📋 Total scenarios: ${testScenarios.length}\n`);

  // Wait for server to be ready
  console.log("⏳ Waiting for server to be ready...");
  try {
    const healthCheck = await fetch(`${BASE_URL}/api/version`);
    if (healthCheck.ok) {
      const version = await healthCheck.json();
      console.log(`✅ Server ready! Version: ${version.version}\n`);
    }
  } catch (error) {
    console.log(`⚠️  Server might not be ready, proceeding anyway...\n`);
  }

  metrics.totalTests = testScenarios.length;

  // Run tests sequentially to avoid overwhelming the API
  for (const scenario of testScenarios) {
    await testScenario(scenario);

    // Brief pause between tests
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Calculate final metrics
  metrics.averageTime = metrics.totalTime / metrics.totalTests;

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 PERFORMANCE TEST SUMMARY");
  console.log("=".repeat(60));
  console.log(`📋 Total Tests: ${metrics.totalTests}`);
  console.log(`✅ Passed: ${metrics.passed}`);
  console.log(`❌ Failed: ${metrics.failed}`);
  console.log(
    `🎯 Success Rate: ${((metrics.passed / metrics.totalTests) * 100).toFixed(1)}%`
  );
  console.log(`⏱️  Total Time: ${metrics.totalTime}ms`);
  console.log(`📈 Average Response Time: ${metrics.averageTime.toFixed(0)}ms`);

  // Performance breakdown by type
  const typeBreakdown = {};
  metrics.results.forEach((result) => {
    if (!typeBreakdown[result.type]) {
      typeBreakdown[result.type] = { times: [], count: 0 };
    }
    typeBreakdown[result.type].times.push(result.responseTime);
    typeBreakdown[result.type].count++;
  });

  console.log("\n📊 Performance by Test Type:");
  Object.entries(typeBreakdown).forEach(([type, data]) => {
    const avgTime = data.times.reduce((a, b) => a + b, 0) / data.count;
    const maxTime = Math.max(...data.times);
    const minTime = Math.min(...data.times);
    console.log(
      `  ${type}: avg ${avgTime.toFixed(0)}ms | min ${minTime}ms | max ${maxTime}ms`
    );
  });

  // Identify optimization opportunities
  console.log("\n🎯 Optimization Opportunities:");
  const slowTests = metrics.results
    .filter((r) => r.responseTime > metrics.averageTime * 1.5)
    .sort((a, b) => b.responseTime - a.responseTime);

  if (slowTests.length > 0) {
    console.log("📉 Slowest responses (>150% of average):");
    slowTests.forEach((test) => {
      console.log(`  • ${test.scenario}: ${test.responseTime}ms`);
    });
  }

  const fastTests = metrics.results
    .filter((r) => r.analysis?.isCached)
    .sort((a, b) => a.responseTime - b.responseTime);

  if (fastTests.length > 0) {
    console.log("🚀 Cached responses (fastest):");
    fastTests.forEach((test) => {
      console.log(`  • ${test.scenario}: ${test.responseTime}ms (cached)`);
    });
  }

  // Target for optimization
  console.log(
    `\n🎯 TARGET: Reduce average response time from ${metrics.averageTime.toFixed(0)}ms to ${(metrics.averageTime / 2).toFixed(0)}ms`
  );

  return metrics;
};

// Export for use in other scripts
if (require.main === module) {
  runPerformanceTests()
    .then((metrics) => {
      console.log("\n✅ Performance testing complete!");
      process.exit(metrics.failed > 0 ? 1 : 0);
    })
    .catch((error) => {
      console.error("\n❌ Performance testing failed:", error);
      process.exit(1);
    });
}

module.exports = { runPerformanceTests, testScenarios, metrics };
