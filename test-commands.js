// Using built-in fetch (Node.js 18+)

async function testMessageCommand() {
  console.log("=== TESTING /message COMMAND FLOW ===\n");

  // Step 1: Send /message command
  console.log("Step 1: Sending /message command...");
  const formData1 = new FormData();
  formData1.append("message", "/message");
  formData1.append("history", "[]");

  const response1 = await fetch("http://localhost:3000/api/chatbot", {
    method: "POST",
    body: formData1,
  });

  const result1 = await response1.json();
  console.log("Response:", result1.response);
  console.log();

  // Step 2: Provide email
  console.log("Step 2: Providing email address...");
  const history2 = [
    { role: "user", content: "/message" },
    { role: "assistant", content: result1.response },
  ];

  const formData2 = new FormData();
  formData2.append("message", "john.recruiter@techcorp.com");
  formData2.append("history", JSON.stringify(history2));

  const response2 = await fetch("http://localhost:3000/api/chatbot", {
    method: "POST",
    body: formData2,
  });

  const result2 = await response2.json();
  console.log("Response:", result2.response);
  console.log();

  // Step 3: Provide message
  console.log("Step 3: Providing message...");
  const history3 = [
    ...history2,
    { role: "user", content: "john.recruiter@techcorp.com" },
    { role: "assistant", content: result2.response },
  ];

  const formData3 = new FormData();
  formData3.append(
    "message",
    "Hi Lawrence, I have an exciting opportunity at TechCorp that would be perfect for your background. Would love to discuss!"
  );
  formData3.append("history", JSON.stringify(history3));

  const response3 = await fetch("http://localhost:3000/api/chatbot", {
    method: "POST",
    body: formData3,
  });

  const result3 = await response3.json();
  console.log("Response:", result3.response);
  console.log();
}

async function testMeetingCommand() {
  console.log("=== TESTING /meeting COMMAND FLOW ===\n");

  // Step 1: Send /meeting command
  console.log("Step 1: Sending /meeting command...");
  const formData1 = new FormData();
  formData1.append("message", "/meeting");
  formData1.append("history", "[]");

  const response1 = await fetch("http://localhost:3000/api/chatbot", {
    method: "POST",
    body: formData1,
  });

  const result1 = await response1.json();
  console.log("Response:", result1.response);
  console.log();

  // Step 2: Provide email
  console.log("Step 2: Providing email address...");
  const history2 = [
    { role: "user", content: "/meeting" },
    { role: "assistant", content: result1.response },
  ];

  const formData2 = new FormData();
  formData2.append("message", "sarah.manager@innovate.co");
  formData2.append("history", JSON.stringify(history2));

  const response2 = await fetch("http://localhost:3000/api/chatbot", {
    method: "POST",
    body: formData2,
  });

  const result2 = await response2.json();
  console.log("Response:", result2.response);
  console.log();

  // Step 3: Provide meeting message
  console.log("Step 3: Providing meeting message...");
  const history3 = [
    ...history2,
    { role: "user", content: "sarah.manager@innovate.co" },
    { role: "assistant", content: result2.response },
  ];

  const formData3 = new FormData();
  formData3.append(
    "message",
    "I would like to discuss a senior data scientist position at Innovate Co. We are impressed with your experience."
  );
  formData3.append("history", JSON.stringify(history3));

  const response3 = await fetch("http://localhost:3000/api/chatbot", {
    method: "POST",
    body: formData3,
  });

  const result3 = await response3.json();
  console.log("Response:", result3.response);
  console.log();

  // Step 4: Provide date/time
  console.log("Step 4: Providing preferred date/time...");
  const history4 = [
    ...history3,
    {
      role: "user",
      content:
        "I would like to discuss a senior data scientist position at Innovate Co. We are impressed with your experience.",
    },
    { role: "assistant", content: result3.response },
  ];

  const formData4 = new FormData();
  formData4.append("message", "Tomorrow at 2pm EST would be perfect");
  formData4.append("history", JSON.stringify(history4));

  const response4 = await fetch("http://localhost:3000/api/chatbot", {
    method: "POST",
    body: formData4,
  });

  const result4 = await response4.json();
  console.log("Response:", result4.response);
  console.log();
}

async function runTests() {
  try {
    await testMessageCommand();
    await testMeetingCommand();
    console.log(
      "✅ All tests completed! Check your email for 2 messages from the chatbot."
    );
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

runTests();
