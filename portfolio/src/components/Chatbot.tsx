"use client";

import React from "react";
import type { ChatbotProps } from "../types/chatbot";
import { ChatInterface } from "./chatbot/ChatInterface";

// Main Chatbot component - now just a simple wrapper around the modular ChatInterface
export default function Chatbot({ isOpen, onClose }: ChatbotProps) {
  return <ChatInterface isOpen={isOpen} onClose={onClose} />;
}
