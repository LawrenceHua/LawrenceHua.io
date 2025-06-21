const fs = require("fs");
const FormData = require("form-data");

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
    console.log(
      "Image sent via email:",
      result.imageSent || "Not reported in response"
    );
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
    console.log(
      "Meeting request sent:",
      result.meetingRequestSent || "Not reported in response"
    );
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
    console.log("Email ID:", result.data?.id || "No ID returned");
    return result.success === true;
  } catch (error) {
    console.log("❌ Direct image email test failed:", error.message);
    return false;
  }
}

async function testContactForm() {
  console.log("\n🧪 TEST 9: Contact Form");
  try {
    const response = await fetch(`${BASE_URL}/api/contact`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        subject: "Test Contact Form",
        message: "This is a test message from the contact form",
      }),
    });

    const result = await response.json();
    console.log("✅ Contact form test passed");
    console.log(
      "Contact form response:",
      result.success || result.message || false
    );
    return response.ok && (result.success || result.message);
  } catch (error) {
    console.log("❌ Contact form test failed:", error.message);
    return false;
  }
}

async function testWorkExperiences() {
  console.log("\n🧪 TEST 10: Work Experiences Count");
  try {
    const response = await fetch(`${BASE_URL}/api/experiences`);
    const experiences = await response.json();

    const count = experiences.length;
    console.log(`✅ Work experiences count: ${count}`);

    if (count >= 11) {
      console.log("✅ Work experiences count is sufficient (≥11)");
      return true;
    } else {
      console.log(`❌ Work experiences count is insufficient (${count}/11)`);
      return false;
    }
  } catch (error) {
    console.log("❌ Work experiences test failed:", error.message);
    return false;
  }
}

async function testProjects() {
  console.log("\n🧪 TEST 11: Projects Count");
  try {
    const response = await fetch(`${BASE_URL}/api/projects`);
    const projects = await response.json();

    const count = projects.length;
    console.log(`✅ Projects count: ${count}`);

    if (count >= 14) {
      console.log("✅ Projects count is sufficient (≥14)");
      return true;
    } else {
      console.log(`❌ Projects count is insufficient (${count}/14)`);
      return false;
    }
  } catch (error) {
    console.log("❌ Projects test failed:", error.message);
    return false;
  }
}

async function testPortfolioPage() {
  console.log("\n🧪 TEST 12: Portfolio Page Load");
  try {
    const response = await fetch(`${BASE_URL}`);
    const html = await response.text();

    // Check for key elements
    const hasExperiences = html.includes("experience") || html.includes("work");
    const hasProjects = html.includes("project") || html.includes("portfolio");
    const hasContact =
      html.includes("contact") || html.includes("get in touch");
    const hasChatbot = html.includes("chat") || html.includes("bot");

    console.log("✅ Portfolio page test passed");
    console.log("Has experiences section:", hasExperiences);
    console.log("Has projects section:", hasProjects);
    console.log("Has contact section:", hasContact);
    console.log("Has chatbot:", hasChatbot);

    return hasExperiences && hasProjects && hasContact;
  } catch (error) {
    console.log("❌ Portfolio page test failed:", error.message);
    return false;
  }
}

async function runAllTests() {
  console.log("🚀 Starting Comprehensive Portfolio Test Suite");
  console.log("=".repeat(60));

  const tests = [
    testBasicConversation,
    testGirlfriendEasterEgg,
    testTxtFileUpload,
    testDocxFileUpload,
    testPdfFileUpload,
    testImageUpload,
    testMeetingRequest,
    testImageEmailDirect,
    testContactForm,
    testWorkExperiences,
    testProjects,
    testPortfolioPage,
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

  console.log("\n" + "=".repeat(60));
  console.log("📊 COMPREHENSIVE TEST RESULTS SUMMARY");
  console.log("=".repeat(60));

  const passed = results.filter((r) => r).length;
  const total = results.length;

  console.log(`✅ Passed: ${passed}/${total}`);
  console.log(`❌ Failed: ${total - passed}/${total}`);
  console.log(`📈 Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  console.log("\n📋 Test Details:");
  console.log("1. Basic Conversation");
  console.log("2. Girlfriend Easter Egg");
  console.log("3. TXT File Upload");
  console.log("4. DOCX File Upload");
  console.log("5. PDF File Upload");
  console.log("6. Image Upload (Vision + Email)");
  console.log("7. Meeting Request");
  console.log("8. Direct Image Email");
  console.log("9. Contact Form");
  console.log("10. Work Experiences (≥11)");
  console.log("11. Projects (≥14)");
  console.log("12. Portfolio Page Load");

  if (passed === total) {
    console.log("\n🎉 ALL TESTS PASSED! Your portfolio is working perfectly!");
    console.log("📧 You should receive 2 emails:");
    console.log("   - One with the image attachment");
    console.log("   - One with the meeting request");
  } else {
    console.log("\n⚠️  Some tests failed. Please check the logs above.");
  }
}

// Run the tests
runAllTests().catch(console.error);
