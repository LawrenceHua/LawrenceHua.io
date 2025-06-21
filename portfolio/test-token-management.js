#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Copy the token estimation function from the chatbot
function estimateTokens(text) {
  return Math.ceil(text.length / 3.5);
}

function truncateToTokenLimit(text, maxTokens) {
  const estimatedTokens = estimateTokens(text);
  if (estimatedTokens <= maxTokens) {
    return text;
  }

  const maxChars = Math.floor(maxTokens * 3.2);
  const truncated = text.substring(0, maxChars);

  const lastSentence = truncated.lastIndexOf(".");
  const lastNewline = truncated.lastIndexOf("\n");
  const cutPoint = Math.max(lastSentence, lastNewline);

  if (cutPoint > maxChars * 0.7) {
    return text.substring(0, cutPoint + 1);
  }

  return truncated + "...";
}

function getSystemPrompt(maxTokens = 4000) {
  try {
    const filePath = path.join(process.cwd(), "public", "experience.txt");
    console.log("Reading from:", filePath);
    const content = fs.readFileSync(filePath, "utf-8");
    console.log("Original file length:", content.length);
    console.log("Original estimated tokens:", estimateTokens(content));

    if (content.length > 20000) {
      console.log("File is very large, using conservative token limit");
      maxTokens = 2000;
    }

    const truncatedContent = truncateToTokenLimit(content, maxTokens);
    const estimatedTokens = estimateTokens(truncatedContent);
    console.log("Truncated content length:", truncatedContent.length);
    console.log("Truncated estimated tokens:", estimatedTokens);

    return truncatedContent;
  } catch (error) {
    console.error("Error reading file:", error);
    return "You are Lawrence Hua's AI assistant.";
  }
}

// Test the token management
console.log("=== Testing Token Management ===\n");

const systemPrompt = getSystemPrompt(4000);
const userMessage = "Hello, what are Lawrence's skills?";
const userTokens = estimateTokens(userMessage);
const systemTokens = estimateTokens(systemPrompt);
const totalTokens = systemTokens + userTokens + 1000;

console.log("\n=== Token Breakdown ===");
console.log(`System prompt tokens: ${systemTokens}`);
console.log(`User message tokens: ${userTokens}`);
console.log(`Response tokens (estimated): 1000`);
console.log(`Total tokens: ${totalTokens}`);
console.log(`Token limit: 8192`);
console.log(`Under limit: ${totalTokens <= 8192 ? "✅ YES" : "❌ NO"}`);

if (totalTokens > 7000) {
  console.log("\n⚠️ WARNING: Total tokens exceed conservative limit of 7000");
  console.log("The chatbot will use minimal system prompt as fallback");
}

console.log("\n=== Test Complete ===");
