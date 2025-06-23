const fs = require("fs");
const FormData = require("form-data");

async function testImageEmail() {
  try {
    const formData = new FormData();

    // Add a test image file
    formData.append("image", fs.createReadStream("./public/profilepic.jpeg"), {
      filename: "test-image.jpeg",
      contentType: "image/jpeg",
    });

    formData.append(
      "message",
      "This is a test image upload from the portfolio chatbot"
    );
    formData.append("email", "test@example.com");
    formData.append("name", "Test User");

    const response = await fetch("http://localhost:3000/api/send-image", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();
    console.log("Response status:", response.status);
    console.log("Response:", result);
  } catch (error) {
    console.error("Error testing image email:", error);
  }
}

testImageEmail();
