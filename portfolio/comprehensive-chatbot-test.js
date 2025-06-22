#!/usr/bin/env node

const FormData = require("form-data");
const fs = require("fs");

const BASE_URL = "http://localhost:3000";

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

async function sendImageMessage(message, imagePath, history = []) {
  try {
    const formData = new FormData();
    formData.append("message", message);
    formData.append("history", JSON.stringify(history));
    formData.append("files", fs.createReadStream(imagePath));

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
    console.error("Error sending image message:", error);
    return null;
  }
}

async function testMessageCommand() {
  console.log("📧 TEST 1: /message Command Flow");
  console.log("================================");

  let history = [];

  // Step 1: Send /message command
  console.log("Step 1: Sending /message command...");
  let result = await sendChatMessage("/message", history);
  if (!result) return false;

  console.log("✅ Response:", result.response);
  history.push({ role: "user", content: "/message" });
  history.push({ role: "assistant", content: result.response });
  await delay(500);

  // Step 2: Test invalid email validation
  console.log("\nStep 2: Testing invalid email (ea)...");
  result = await sendChatMessage("ea", history);
  if (!result) return false;

  console.log("✅ Response:", result.response);
  history.push({ role: "user", content: "ea" });
  history.push({ role: "assistant", content: result.response });
  await delay(500);

  // Step 3: Provide valid email
  console.log("\nStep 3: Providing valid email...");
  result = await sendChatMessage("sarah.recruiter@techcorp.com", history);
  if (!result) return false;

  console.log("✅ Response:", result.response);
  history.push({ role: "user", content: "sarah.recruiter@techcorp.com" });
  history.push({ role: "assistant", content: result.response });
  await delay(500);

  // Step 4: Provide message content
  console.log("\nStep 4: Providing message content...");
  const messageContent =
    "Hi Lawrence! I'm Sarah from TechCorp. We have an exciting AI Product Manager position that would be perfect for your background. Your experience with AI platforms and product management at Carnegie Mellon really caught our attention. Would love to discuss this opportunity with you!";
  result = await sendChatMessage(messageContent, history);
  if (!result) return false;

  console.log("✅ Response:", result.response);
  console.log("✅ Contact Sent:", result.contactSent || false);

  return (
    result.contactSent || result.response.includes("Message Sent Successfully")
  );
}

async function testMeetingCommand() {
  console.log("\n\n📅 TEST 2: /meeting Command Flow");
  console.log("=================================");

  let history = [];

  // Step 1: Send /meeting command
  console.log("Step 1: Sending /meeting command...");
  let result = await sendChatMessage("/meeting", history);
  if (!result) return false;

  console.log("✅ Response:", result.response);
  history.push({ role: "user", content: "/meeting" });
  history.push({ role: "assistant", content: result.response });
  await delay(500);

  // Step 2: Provide valid email
  console.log("\nStep 2: Providing email address...");
  result = await sendChatMessage("michael.cto@innovateco.com", history);
  if (!result) return false;

  console.log("✅ Response:", result.response);
  history.push({ role: "user", content: "michael.cto@innovateco.com" });
  history.push({ role: "assistant", content: result.response });
  await delay(500);

  // Step 3: Provide meeting message
  console.log("\nStep 3: Providing meeting message...");
  const meetingMessage =
    "I would like to schedule a meeting to discuss the CTO position at InnovateCo. We are very impressed with your technical leadership experience and AI product expertise. We're looking for someone to lead our product engineering team.";
  result = await sendChatMessage(meetingMessage, history);
  if (!result) return false;

  console.log("✅ Response:", result.response);
  history.push({ role: "user", content: meetingMessage });
  history.push({ role: "assistant", content: result.response });
  await delay(500);

  // Step 4: Provide date/time
  console.log("\nStep 4: Providing preferred date/time...");
  result = await sendChatMessage(
    "Friday, June 28th at 2:00 PM EST would be perfect",
    history
  );
  if (!result) return false;

  console.log("✅ Response:", result.response);
  console.log("✅ Meeting Requested:", result.meetingRequested || false);

  return (
    result.meetingRequested ||
    result.response.includes("Meeting Request Sent Successfully")
  );
}

async function testImageUpload() {
  console.log("\n\n🖼️  TEST 3: Image Upload & Analysis");
  console.log("===================================");

  const imagePath =
    "/Users/lawrencehua/Desktop/LawrenceHua.io/expired_solutions_logo.jpeg";

  // Check if image exists
  if (!fs.existsSync(imagePath)) {
    console.log("❌ Image file not found:", imagePath);
    return false;
  }

  console.log("Step 1: Uploading image for analysis...");
  const message =
    "Hi! I found this interesting project logo and wanted to learn more about Lawrence's work on this. Can you analyze this image and tell me about the project? I'm particularly interested in the AI/computer vision aspects.";

  const result = await sendImageMessage(message, imagePath, []);
  if (!result) return false;

  console.log("✅ Response:", result.response.substring(0, 200) + "...");
  console.log("✅ Image Analyzed:", result.imageAnalyzed || false);

  return result.imageAnalyzed || result.response.includes("image");
}

async function main() {
  console.log("🧪 COMPREHENSIVE CHATBOT FUNCTIONALITY TEST");
  console.log("==========================================");
  console.log("Testing all chatbot features to generate 3 emails:");
  console.log("1. Message email via /message command");
  console.log("2. Meeting request email via /meeting command");
  console.log("3. Image analysis email via image upload");
  console.log("");

  const results = {
    message: false,
    meeting: false,
    image: false,
  };

  try {
    // Test 1: Message command
    results.message = await testMessageCommand();
    await delay(2000);

    // Test 2: Meeting command
    results.meeting = await testMeetingCommand();
    await delay(2000);

    // Test 3: Image upload
    results.image = await testImageUpload();

    // Summary
    console.log("\n\n📊 TEST RESULTS SUMMARY");
    console.log("========================");
    console.log("✅ Message Command:", results.message ? "PASSED" : "FAILED");
    console.log("✅ Meeting Command:", results.meeting ? "PASSED" : "FAILED");
    console.log("✅ Image Upload:", results.image ? "PASSED" : "FAILED");

    const passedTests = Object.values(results).filter((r) => r).length;
    console.log("\n📧 Expected Emails: 3");
    console.log("📧 Successful Tests:", passedTests);

    if (passedTests === 3) {
      console.log("\n🎉 ALL TESTS PASSED! You should receive 3 emails.");
    } else {
      console.log(
        "\n⚠️  Some tests failed. You may receive fewer than 3 emails."
      );
    }
  } catch (error) {
    console.error("Error during testing:", error);
  }
}

if (require.main === module) {
  main();
}
