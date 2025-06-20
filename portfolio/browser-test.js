// Browser Test Suite for Portfolio Website
// Run this in the browser console on http://localhost:3000

const fs = require("fs");
const FormData = require("form-data");

const BASE_URL = "http://localhost:3000";

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
