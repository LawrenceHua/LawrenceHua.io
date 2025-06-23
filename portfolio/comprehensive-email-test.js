const fs = require("fs");
const path = require("path");

// Test configuration
const BASE_URL = "http://localhost:3000";
const TEST_EMAIL = "lhua@andrew.cmu.edu";
const TEST_NAME = "Lawrence Test User";

// Color codes for console output
const colors = {
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  reset: "\x1b[0m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Test 1: Contact API (Message)
async function testContactMessage() {
  log("\n🔍 Testing Contact API (Message)...", "blue");

  try {
    const response = await fetch(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: TEST_NAME,
        email: TEST_EMAIL,
        subject: `Test Message from ${TEST_NAME}`,
        message:
          "This is a test message to verify the contact API is working properly with user confirmation emails. The system should send one email to Lawrence and one confirmation email to the user.",
      }),
    });

    const result = await response.json();

    if (response.ok) {
      log(`✅ Contact Message API Success`, "green");
      log(
        `   📧 Email to Lawrence: ${result.data ? "Sent" : "Failed"}`,
        result.data ? "green" : "red"
      );
      log(
        `   📧 User Confirmation: ${result.userEmailSent ? "Sent" : "Failed"}`,
        result.userEmailSent ? "green" : "red"
      );
      return true;
    } else {
      log(`❌ Contact Message API Failed: ${result.error}`, "red");
      return false;
    }
  } catch (error) {
    log(`❌ Contact Message API Error: ${error.message}`, "red");
    return false;
  }
}

// Test 2: Meeting Request API
async function testMeetingRequest() {
  log("\n🔍 Testing Meeting Request API...", "blue");

  try {
    const response = await fetch(`${BASE_URL}/api/meeting-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requesterName: TEST_NAME,
        requesterEmail: TEST_EMAIL,
        company: "CMU Test Company",
        position: "Test Position",
        message:
          "This is a test meeting request to verify the meeting API is working properly with user confirmation emails. I would like to schedule a 30-minute meeting to discuss potential opportunities.",
        conversationContext:
          "Test conversation context from chatbot interaction",
      }),
    });

    const result = await response.json();

    if (response.ok) {
      log(`✅ Meeting Request API Success`, "green");
      log(
        `   📧 Email to Lawrence: ${result.data ? "Sent" : "Failed"}`,
        result.data ? "green" : "red"
      );
      log(
        `   📧 User Confirmation: ${result.userEmailSent ? "Sent" : "Failed"}`,
        result.userEmailSent ? "green" : "red"
      );
      return true;
    } else {
      log(`❌ Meeting Request API Failed: ${result.error}`, "red");
      return false;
    }
  } catch (error) {
    log(`❌ Meeting Request API Error: ${error.message}`, "red");
    return false;
  }
}

// Test 3: Send Image API
async function testSendImage() {
  log("\n🔍 Testing Send Image API...", "blue");

  try {
    // Create a test image buffer (1x1 PNG)
    const testImageBuffer = Buffer.from([
      0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
      0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
      0x08, 0x06, 0x00, 0x00, 0x00, 0x1f, 0x15, 0xc4, 0x89, 0x00, 0x00, 0x00,
      0x0a, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9c, 0x63, 0x00, 0x01, 0x00, 0x00,
      0x05, 0x00, 0x01, 0x0d, 0x0a, 0x2d, 0xb4, 0x00, 0x00, 0x00, 0x00, 0x49,
      0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
    ]);

    const formData = new FormData();
    formData.append(
      "image",
      new Blob([testImageBuffer], { type: "image/png" }),
      "test-image.png"
    );
    formData.append(
      "message",
      "This is a test image upload to verify the send-image API is working properly with user confirmation emails."
    );
    formData.append("email", TEST_EMAIL);
    formData.append("name", TEST_NAME);

    const response = await fetch(`${BASE_URL}/api/send-image`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (response.ok) {
      log(`✅ Send Image API Success`, "green");
      log(
        `   📧 Email to Lawrence: ${result.data ? "Sent" : "Failed"}`,
        result.data ? "green" : "red"
      );
      log(
        `   📧 User Confirmation: ${result.userEmailSent ? "Sent" : "Failed"}`,
        result.userEmailSent ? "green" : "red"
      );
      return true;
    } else {
      log(`❌ Send Image API Failed: ${result.error}`, "red");
      return false;
    }
  } catch (error) {
    log(`❌ Send Image API Error: ${error.message}`, "red");
    return false;
  }
}

// Test 4: Recruiter Contact API
async function testRecruiterContact() {
  log("\n🔍 Testing Recruiter Contact API...", "blue");

  try {
    const response = await fetch(`${BASE_URL}/api/recruiter-contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recruiterName: TEST_NAME,
        company: "Test Recruiting Company",
        email: TEST_EMAIL,
        message:
          "This is a test recruiter message to verify the recruiter-contact API is working properly with user confirmation emails. I have an exciting opportunity I would like to discuss.",
        conversationContext: "Test conversation context from chatbot",
      }),
    });

    const result = await response.json();

    if (response.ok) {
      log(`✅ Recruiter Contact API Success`, "green");
      log(
        `   📧 Email to Lawrence: ${result.data ? "Sent" : "Failed"}`,
        result.data ? "green" : "red"
      );
      log(
        `   📧 User Confirmation: ${result.userEmailSent ? "Sent" : "Failed"}`,
        result.userEmailSent ? "green" : "red"
      );
      return true;
    } else {
      log(`❌ Recruiter Contact API Failed: ${result.error}`, "red");
      return false;
    }
  } catch (error) {
    log(`❌ Recruiter Contact API Error: ${error.message}`, "red");
    return false;
  }
}

// Test 5: Resend Contact API (Message)
async function testResendContactMessage() {
  log("\n🔍 Testing Resend Contact API (Message)...", "blue");

  try {
    const response = await fetch(`${BASE_URL}/api/resend-contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: TEST_NAME,
        email: TEST_EMAIL,
        company: "Test Company",
        message:
          "This is a test message via resend-contact API to verify it works properly with user confirmation emails.",
        type: "message",
      }),
    });

    const result = await response.json();

    if (response.ok) {
      log(`✅ Resend Contact Message API Success`, "green");
      log(
        `   📧 Email to Lawrence: ${result.id ? "Sent" : "Failed"}`,
        result.id ? "green" : "red"
      );
      log(
        `   📧 User Confirmation: ${result.userEmailSent ? "Sent" : "Failed"}`,
        result.userEmailSent ? "green" : "red"
      );
      return true;
    } else {
      log(`❌ Resend Contact Message API Failed: ${result.error}`, "red");
      return false;
    }
  } catch (error) {
    log(`❌ Resend Contact Message API Error: ${error.message}`, "red");
    return false;
  }
}

// Test 6: Resend Contact API (Meeting)
async function testResendContactMeeting() {
  log("\n🔍 Testing Resend Contact API (Meeting)...", "blue");

  try {
    const response = await fetch(`${BASE_URL}/api/resend-contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: TEST_NAME,
        email: TEST_EMAIL,
        company: "Test Company",
        message: "This is a test meeting via resend-contact API.",
        type: "meeting",
        dateTime: "December 15, 2024 at 2:00 PM EST",
        meetingType: "30min",
      }),
    });

    const result = await response.json();

    if (response.ok) {
      log(`✅ Resend Contact Meeting API Success`, "green");
      log(
        `   📧 Email to Lawrence: ${result.id ? "Sent" : "Failed"}`,
        result.id ? "green" : "red"
      );
      log(
        `   📧 User Confirmation: ${result.userEmailSent ? "Sent" : "Failed"}`,
        result.userEmailSent ? "green" : "red"
      );
      return true;
    } else {
      log(`❌ Resend Contact Meeting API Failed: ${result.error}`, "red");
      return false;
    }
  } catch (error) {
    log(`❌ Resend Contact Meeting API Error: ${error.message}`, "red");
    return false;
  }
}

// Main test runner
async function runAllTests() {
  log("🚀 Starting Comprehensive Email API Tests", "cyan");
  log(
    `📧 Lawrence's Email: ${process.env.EMAIL_NAME || "lawrencehua2@gmail.com"}`,
    "yellow"
  );
  log(`📧 Test User Email: ${TEST_EMAIL}`, "yellow");
  log("=" * 60, "cyan");

  const results = [];

  // Run all tests
  results.push(await testContactMessage());
  results.push(await testMeetingRequest());
  results.push(await testSendImage());
  results.push(await testRecruiterContact());
  results.push(await testResendContactMessage());
  results.push(await testResendContactMeeting());

  // Summary
  const passed = results.filter((r) => r).length;
  const total = results.length;

  log("\n" + "=" * 60, "cyan");
  log("📊 TEST SUMMARY", "cyan");
  log("=" * 60, "cyan");

  if (passed === total) {
    log(`🎉 ALL TESTS PASSED! (${passed}/${total})`, "green");
    log("\n📧 Expected Emails:", "yellow");
    log(
      `   Lawrence (${process.env.EMAIL_NAME || "lawrencehua2@gmail.com"}): 6 emails`,
      "yellow"
    );
    log(`   User (${TEST_EMAIL}): 6 confirmation emails`, "yellow");
  } else {
    log(`⚠️  SOME TESTS FAILED (${passed}/${total})`, "red");
  }

  log("\n💡 Next Steps:", "blue");
  log("   1. Check both email inboxes", "blue");
  log("   2. Verify email content and formatting", "blue");
  log('   3. Confirm "What Happens Next" section is correct', "blue");
  log("   4. Verify EMAIL_NAME is used in user confirmations", "blue");
}

// Check if server is running
async function checkServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/test`);
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Start tests
(async () => {
  log("🔍 Checking if development server is running...", "yellow");

  const serverRunning = await checkServer();
  if (!serverRunning) {
    log("❌ Development server is not running!", "red");
    log("   Please run: npm run dev", "yellow");
    process.exit(1);
  }

  log("✅ Development server is running", "green");
  await runAllTests();
})();
