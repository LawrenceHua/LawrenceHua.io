#!/usr/bin/env node

const FormData = require("form-data");
const fs = require("fs");

const BASE_URL = "http://localhost:3000";

// Test counter and results
let testCount = 0;
let passedTests = 0;
let failedTests = 0;
const testResults = [];

// Helper function for logging
function log(message, type = "INFO") {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${type}] ${message}`;
  console.log(logMessage);
}

// Helper function to send chat message
async function sendChatMessage(message, history = []) {
  try {
    const formData = new FormData();
    formData.append("message", message);
    formData.append("history", JSON.stringify(history));

    const response = await fetch(`${BASE_URL}/api/chatbot`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error sending chat message:", error);
    return null;
  }
}

// Helper function to send chat message with image
async function sendChatMessageWithImage(message, imageFile, history = []) {
  try {
    const formData = new FormData();
    formData.append("message", message);
    formData.append("history", JSON.stringify(history));
    formData.append("files", imageFile);

    const response = await fetch(`${BASE_URL}/api/chatbot`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("Error sending chat message with image:", error);
    return null;
  }
}

// Helper function to create a test image file
function createTestImageFile() {
  // Create a simple canvas and convert to blob
  const canvas = document.createElement("canvas");
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext("2d");

  // Draw a simple test image
  ctx.fillStyle = "#ff0000";
  ctx.fillRect(0, 0, 50, 50);
  ctx.fillStyle = "#00ff00";
  ctx.fillRect(50, 0, 50, 50);
  ctx.fillStyle = "#0000ff";
  ctx.fillRect(0, 50, 50, 50);
  ctx.fillStyle = "#ffff00";
  ctx.fillRect(50, 50, 50, 50);

  // Add some text
  ctx.fillStyle = "#000000";
  ctx.font = "12px Arial";
  ctx.fillText("Test Job", 10, 25);
  ctx.fillText("Posting", 10, 75);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const file = new File([blob], "test-job-posting.png", {
        type: "image/png",
      });
      resolve(file);
    });
  });
}

// Test function wrapper
async function runTest(testName, testFunction) {
  testCount++;
  log(`🧪 Running Test ${testCount}: ${testName}`);

  try {
    const result = await testFunction();
    if (result) {
      passedTests++;
      log(`✅ Test ${testCount} PASSED: ${testName}`, "PASS");
      testResults.push({ test: testName, status: "PASSED", error: null });
    } else {
      failedTests++;
      log(`❌ Test ${testCount} FAILED: ${testName}`, "FAIL");
      testResults.push({
        test: testName,
        status: "FAILED",
        error: "Test returned false",
      });
    }
  } catch (error) {
    failedTests++;
    log(
      `❌ Test ${testCount} FAILED: ${testName} - Error: ${error.message}`,
      "FAIL"
    );
    testResults.push({
      test: testName,
      status: "FAILED",
      error: error.message,
    });
  }

  // Add delay between tests
  await new Promise((resolve) => setTimeout(resolve, 1000));
}

// Test 1: Basic Chatbot Response
async function testBasicResponse() {
  const response = await sendChatMessage("Hello!");
  return (
    response && response.response && response.response.includes("Lawrence")
  );
}

// Test 2: Fun Fact Request
async function testFunFact() {
  const response = await sendChatMessage("Tell me a fun fact");
  return (
    response &&
    response.response &&
    response.response.includes("Fun Fact About Lawrence")
  );
}

// Test 3: Experience Question
async function testExperienceQuestion() {
  const response = await sendChatMessage("Tell me about Lawrence's experience");
  return (
    response &&
    response.response &&
    (response.response.includes("Product Manager") ||
      response.response.includes("AI") ||
      response.response.includes("Expired Solutions"))
  );
}

// Test 4: Skills Question
async function testSkillsQuestion() {
  const response = await sendChatMessage(
    "What are Lawrence's technical skills?"
  );
  return (
    response &&
    response.response &&
    (response.response.includes("Python") ||
      response.response.includes("AI") ||
      response.response.includes("Product"))
  );
}

// Test 5: Projects Question
async function testProjectsQuestion() {
  const response = await sendChatMessage("Show me Lawrence's projects");
  return (
    response &&
    response.response &&
    (response.response.includes("Expired Solutions") ||
      response.response.includes("Tutora") ||
      response.response.includes("button-expired"))
  );
}

// Test 6: Amazon MTurk Question
async function testMTurkQuestion() {
  const response = await sendChatMessage(
    "Tell me about Lawrence's Amazon MTurk work"
  );
  return (
    response &&
    response.response &&
    (response.response.includes("Amazon") ||
      response.response.includes("MTurk") ||
      response.response.includes("AI Evaluation") ||
      response.response.includes("button-mturk"))
  );
}

// Test 7: Message Flow - Complete Flow
async function testCompleteMessageFlow() {
  let history = [];

  // Step 1: Start message flow
  let response = await sendChatMessage("/message", history);
  if (!response || !response.response.includes("What's your name")) {
    log("❌ Message flow step 1 failed: " + JSON.stringify(response));
    return false;
  }
  history.push({ role: "user", content: "/message" });
  history.push({ role: "assistant", content: response.response });

  // Step 2: Provide name
  response = await sendChatMessage("John Doe", history);
  if (!response || !response.response.includes("What company are you with")) {
    log("❌ Message flow step 2 failed: " + JSON.stringify(response));
    return false;
  }
  history.push({ role: "user", content: "John Doe" });
  history.push({ role: "assistant", content: response.response });

  // Step 3: Provide company
  response = await sendChatMessage("Tech Corp", history);
  if (!response || !response.response.includes("email address")) {
    log("❌ Message flow step 3 failed: " + JSON.stringify(response));
    return false;
  }
  history.push({ role: "user", content: "Tech Corp" });
  history.push({ role: "assistant", content: response.response });

  // Step 4: Provide email
  response = await sendChatMessage("john.doe@techcorp.com", history);
  if (!response || !response.response.includes("What's your message")) {
    log("❌ Message flow step 4 failed: " + JSON.stringify(response));
    return false;
  }
  history.push({ role: "user", content: "john.doe@techcorp.com" });
  history.push({ role: "assistant", content: response.response });

  // Step 5: Provide message
  response = await sendChatMessage(
    "I'd like to discuss a product manager role.",
    history
  );
  if (!response || !response.response.includes("Message Sent Successfully")) {
    log("❌ Message flow step 5 failed: " + JSON.stringify(response));
    return false;
  }

  log("✅ Complete message flow successful");
  return true;
}

// Test 8: Message Flow - Company "None"
async function testMessageFlowWithNoCompany() {
  let history = [];

  // Start message flow
  let response = await sendChatMessage("/message", history);
  history.push({ role: "user", content: "/message" });
  history.push({ role: "assistant", content: response.response });

  // Provide name
  response = await sendChatMessage("Jane Smith", history);
  history.push({ role: "user", content: "Jane Smith" });
  history.push({ role: "assistant", content: response.response });

  // Provide "none" for company
  response = await sendChatMessage("none", history);
  if (!response || !response.response.includes("email address")) {
    log(
      "❌ Message flow with 'none' company failed: " + JSON.stringify(response)
    );
    return false;
  }
  history.push({ role: "user", content: "none" });
  history.push({ role: "assistant", content: response.response });

  // Continue with email
  response = await sendChatMessage("jane@email.com", history);
  history.push({ role: "user", content: "jane@email.com" });
  history.push({ role: "assistant", content: response.response });

  // Provide message
  response = await sendChatMessage("Looking for AI opportunities", history);
  return response && response.response.includes("Message Sent Successfully");
}

// Test 9: Meeting Flow - Complete Flow
async function testCompleteMeetingFlow() {
  let history = [];

  // Step 1: Start meeting flow
  let response = await sendChatMessage("/meeting", history);
  if (!response || !response.response.includes("What's your name")) {
    log("❌ Meeting flow step 1 failed");
    return false;
  }
  history.push({ role: "user", content: "/meeting" });
  history.push({ role: "assistant", content: response.response });

  // Step 2: Provide name
  response = await sendChatMessage("Alice Johnson", history);
  if (!response || !response.response.includes("What company are you with")) {
    log("❌ Meeting flow step 2 failed");
    return false;
  }
  history.push({ role: "user", content: "Alice Johnson" });
  history.push({ role: "assistant", content: response.response });

  // Step 3: Provide company
  response = await sendChatMessage("Startup Inc", history);
  if (!response || !response.response.includes("email address")) {
    log("❌ Meeting flow step 3 failed");
    return false;
  }
  history.push({ role: "user", content: "Startup Inc" });
  history.push({ role: "assistant", content: response.response });

  // Step 4: Provide email
  response = await sendChatMessage("alice@startup.com", history);
  if (
    !response ||
    !response.response.includes("what would you like to discuss")
  ) {
    log("❌ Meeting flow step 4 failed");
    return false;
  }
  history.push({ role: "user", content: "alice@startup.com" });
  history.push({ role: "assistant", content: response.response });

  // Step 5: Provide meeting topic
  response = await sendChatMessage("Discuss product strategy role", history);
  if (
    !response ||
    !response.response.includes("when would you like to schedule")
  ) {
    log("❌ Meeting flow step 5 failed");
    return false;
  }
  history.push({ role: "user", content: "Discuss product strategy role" });
  history.push({ role: "assistant", content: response.response });

  // Step 6: Provide datetime
  response = await sendChatMessage("Tuesday at 2 PM EST", history);
  if (
    !response ||
    !response.response.includes("Meeting Request Sent Successfully")
  ) {
    log("❌ Meeting flow step 6 failed");
    return false;
  }

  log("✅ Complete meeting flow successful");
  return true;
}

// Test 10: Image Upload Test
async function testImageUpload() {
  try {
    // Create test image
    const testImage = await createTestImageFile();

    // Send image with message
    const response = await sendChatMessageWithImage(
      "This is a job posting",
      testImage,
      []
    );

    if (!response || !response.response) {
      log("❌ Image upload failed - no response");
      return false;
    }

    if (!response.response.includes("IMAGE UPLOADED & ANALYZED")) {
      log("❌ Image upload failed - incorrect response format");
      return false;
    }

    if (!response.imageAnalyzed) {
      log("❌ Image upload failed - imageAnalyzed flag not set");
      return false;
    }

    log("✅ Image upload successful");
    return true;
  } catch (error) {
    log("❌ Image upload failed with error: " + error.message);
    return false;
  }
}

// Test 11: Recruiter Questions - Various Scenarios
async function testRecruiterQuestions() {
  const recruiterQuestions = [
    "Is Lawrence available for full-time roles?",
    "What's Lawrence's experience with AI?",
    "Has Lawrence worked with machine learning?",
    "Tell me about Lawrence's leadership experience",
    "What companies has Lawrence worked for?",
    "Does Lawrence have startup experience?",
    "What's Lawrence's educational background?",
    "Can Lawrence work remotely?",
    "What's Lawrence's strongest skill?",
    "How does Lawrence approach product management?",
  ];

  for (let i = 0; i < recruiterQuestions.length; i++) {
    const question = recruiterQuestions[i];
    const response = await sendChatMessage(question);

    if (!response || !response.response) {
      log(`❌ Recruiter question ${i + 1} failed: "${question}"`);
      return false;
    }

    // Check for reasonable response length and content
    if (response.response.length < 50) {
      log(
        `❌ Recruiter question ${i + 1} got very short response: "${question}"`
      );
      return false;
    }

    log(`✅ Recruiter question ${i + 1} answered: "${question}"`);
    await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay between questions
  }

  return true;
}

// Test 12: Edge Cases and Error Handling
async function testEdgeCases() {
  const edgeCases = [
    "", // Empty message
    "   ", // Whitespace only
    "a".repeat(5000), // Very long message
    "🚀🎯💼📊🤖", // Only emojis
    "/invalidcommand", // Invalid command
  ];

  for (let i = 0; i < edgeCases.length; i++) {
    const testCase = edgeCases[i];
    const response = await sendChatMessage(testCase);

    if (!response) {
      log(`❌ Edge case ${i + 1} failed to get response`);
      return false;
    }

    // Should get some kind of response, not crash
    if (typeof response.response !== "string") {
      log(`❌ Edge case ${i + 1} got invalid response type`);
      return false;
    }

    log(`✅ Edge case ${i + 1} handled gracefully`);
    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  return true;
}

// Test 13: Button Interactions Test
async function testButtonInteractions() {
  const response = await sendChatMessage("Tell me about Lawrence's projects");

  if (!response || !response.response) {
    return false;
  }

  // Check for button markup
  const hasExpiredButton = response.response.includes("button-expired");
  const hasTutoraButton = response.response.includes("button-tutora");
  const hasPMButton = response.response.includes("button-pmhappyhour");
  const hasMTurkButton = response.response.includes("button-mturk");

  if (
    !hasExpiredButton &&
    !hasTutoraButton &&
    !hasPMButton &&
    !hasMTurkButton
  ) {
    log("❌ No project buttons found in response");
    return false;
  }

  log("✅ Project buttons detected in response");
  return true;
}

// Test 14: Conversation Context Test
async function testConversationContext() {
  let history = [];

  // First message
  let response = await sendChatMessage(
    "What's Lawrence's background?",
    history
  );
  if (!response) return false;

  history.push({ role: "user", content: "What's Lawrence's background?" });
  history.push({ role: "assistant", content: response.response });

  // Follow-up question that should reference context
  response = await sendChatMessage("What about his current projects?", history);
  if (!response || !response.response) return false;

  // Should provide relevant information about projects
  const hasProjectInfo =
    response.response.includes("Expired") ||
    response.response.includes("Tutora") ||
    response.response.includes("PM Happy Hour");

  return hasProjectInfo;
}

// Main test runner
async function runAllTests() {
  log("🚀 Starting Comprehensive Chatbot Test Suite");
  log("=".repeat(60));

  // Run all tests
  await runTest("Basic Chatbot Response", testBasicResponse);
  await runTest("Fun Fact Request", testFunFact);
  await runTest("Experience Question", testExperienceQuestion);
  await runTest("Skills Question", testSkillsQuestion);
  await runTest("Projects Question", testProjectsQuestion);
  await runTest("Amazon MTurk Question", testMTurkQuestion);
  await runTest("Complete Message Flow", testCompleteMessageFlow);
  await runTest("Message Flow with No Company", testMessageFlowWithNoCompany);
  await runTest("Complete Meeting Flow", testCompleteMeetingFlow);
  await runTest("Image Upload", testImageUpload);
  await runTest("Recruiter Questions", testRecruiterQuestions);
  await runTest("Edge Cases", testEdgeCases);
  await runTest("Button Interactions", testButtonInteractions);
  await runTest("Conversation Context", testConversationContext);

  // Print final results
  log("=".repeat(60));
  log("🎯 TEST RESULTS SUMMARY");
  log("=".repeat(60));
  log(`Total Tests: ${testCount}`);
  log(`Passed: ${passedTests} ✅`);
  log(`Failed: ${failedTests} ❌`);
  log(`Success Rate: ${((passedTests / testCount) * 100).toFixed(1)}%`);

  if (failedTests > 0) {
    log("\n📋 FAILED TESTS:");
    testResults
      .filter((t) => t.status === "FAILED")
      .forEach((test) => {
        log(`   ❌ ${test.test}${test.error ? ` - ${test.error}` : ""}`);
      });
  }

  log("\n🏁 Test Suite Complete!");

  return {
    total: testCount,
    passed: passedTests,
    failed: failedTests,
    successRate: (passedTests / testCount) * 100,
    results: testResults,
  };
}

// Export for use
if (typeof module !== "undefined" && module.exports) {
  module.exports = { runAllTests, sendChatMessage, sendChatMessageWithImage };
}

// Auto-run if in browser environment
if (typeof window !== "undefined") {
  window.runChatbotTests = runAllTests;
  window.sendChatMessage = sendChatMessage;
  window.sendChatMessageWithImage = sendChatMessageWithImage;
}

// Auto-run if in Node environment and called directly
if (typeof require !== "undefined" && require.main === module) {
  runAllTests().catch(console.error);
}
