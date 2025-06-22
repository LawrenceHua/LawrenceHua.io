"use client";

import React, { useState } from "react";
import { ModernNavigation } from "../components/ModernNavigation";
import { HeroSection } from "../components/sections/HeroSection";
import { AboutSection } from "../components/sections/AboutSection";
import { SkillsSection } from "../components/sections/SkillsSection";
import { TimelineSection } from "../components/sections/TimelineSection";
import { ProjectsSection } from "../components/sections/ProjectsSection";
import { TestimonialsSection } from "../components/sections/TestimonialsSection";
import { ContactSection } from "../components/sections/ContactSection";
import { FloatingChatbot } from "../components/FloatingChatbot";
import PMTour from "../components/PMTour";

export default function ModernHome() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const handleSendMessage = () => {
    setIsChatbotOpen(true);
    // Wait for chatbot to open, then trigger message flow
    setTimeout(() => {
      // This will trigger the /message command in the chatbot
      const event = new CustomEvent("triggerChatbotCommand", {
        detail: { command: "message" },
      });
      window.dispatchEvent(event);
    }, 500);
  };

  const handleScheduleMeeting = () => {
    setIsChatbotOpen(true);
    // Wait for chatbot to open, then trigger meeting flow
    setTimeout(() => {
      // This will trigger the /meeting command in the chatbot
      const event = new CustomEvent("triggerChatbotCommand", {
        detail: { command: "meeting" },
      });
      window.dispatchEvent(event);
    }, 500);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      {/* Modern Navigation */}
      <ModernNavigation />

      {/* Modern Hero Section */}
      <HeroSection />

      {/* Modern About Section */}
      <AboutSection />

      {/* Modern Skills Section */}
      <SkillsSection />

      {/* Timeline Section */}
      <TimelineSection />

      {/* Projects Section */}
      <ProjectsSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Contact Section */}
      <ContactSection />

      {/* PM Tour Component */}
      <div className="fixed bottom-24 right-6 z-40">
        <PMTour
          onSendMessage={handleSendMessage}
          onScheduleMeeting={handleScheduleMeeting}
        />
      </div>

      {/* Floating Chatbot */}
      <FloatingChatbot isOpen={isChatbotOpen} onOpenChange={setIsChatbotOpen} />
    </main>
  );
}
