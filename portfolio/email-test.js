const fs = require("fs");
const FormData = require("form-data");

const BASE_URL = "http://localhost:3001";

async function testDirectImageEmail() {
  console.log("\n🧪 Testing Direct Image Email");
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
    formData.append("message", "Test image email from email test");
    formData.append("email", "test@example.com");
    formData.append("name", "Test User");

    const response = await fetch(`${BASE_URL}/api/send-image`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("✅ Direct image email test passed");
    console.log("Email sent successfully:", result.success);
    console.log("Email ID:", result.data?.id);
    return result.success === true;
  } catch (error) {
    console.log("❌ Direct image email test failed:", error.message);
    return false;
  }
}

async function testMeetingRequest() {
  console.log("\n🧪 Testing Meeting Request Email");
  try {
    const response = await fetch(`${BASE_URL}/api/meeting-request`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requesterName: "Test User",
        requesterEmail: "test@example.com",
        message: "This is a test meeting request from email test",
        company: "Test Company",
        position: "Software Engineer",
      }),
    });

    const result = await response.json();
    console.log("✅ Meeting request test passed");
    console.log("Email sent successfully:", result.success);
    console.log("Email ID:", result.data?.id);
    return result.success === true;
  } catch (error) {
    console.log("❌ Meeting request test failed:", error.message);
    return false;
  }
}

async function testContactForm() {
  console.log("\n🧪 Testing Contact Form Email");
  try {
    const response = await fetch(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        subject: "Test Contact Form from Email Test",
        message: "This is a test message from the contact form email test",
      }),
    });

    const result = await response.json();
    console.log("✅ Contact form test passed");
    console.log("Email sent successfully:", result.message);
    console.log("Email ID:", result.data?.id);
    return response.ok && result.message;
  } catch (error) {
    console.log("❌ Contact form test failed:", error.message);
    return false;
  }
}

async function runEmailTests() {
  console.log("🚀 Starting Email Test Suite");
  console.log("=".repeat(50));

  const tests = [testDirectImageEmail, testMeetingRequest, testContactForm];

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
  console.log("📊 EMAIL TEST RESULTS SUMMARY");
  console.log("=".repeat(50));

  const passed = results.filter((r) => r).length;
  const total = results.length;

  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  if (passed === total) {
    console.log("\n🎉 ALL EMAIL TESTS PASSED!");
    console.log("📧 You should receive 3 emails at lawrencehua2@gmail.com:");
    console.log("   - One with the image attachment");
    console.log("   - One with the meeting request");
    console.log("   - One with the contact form message");
  } else {
    console.log("\n⚠️  Some email tests failed. Please check the logs above.");
  }
}

// Run the tests
runEmailTests().catch(console.error);
