"use client";

import React from "react";
import { ModernNavigation } from "../components/ModernNavigation";
import { HeroSection } from "../components/sections/HeroSection";
import { AboutSection } from "../components/sections/AboutSection";
import { SkillsSection } from "../components/sections/SkillsSection";
import { TimelineSection } from "../components/sections/TimelineSection";
import { ProjectsSection } from "../components/sections/ProjectsSection";
import { TestimonialsSection } from "../components/sections/TestimonialsSection";
import { ContactSection } from "../components/sections/ContactSection";
import { FloatingChatbot } from "../components/FloatingChatbot";

export default function ModernHome() {
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

      {/* Floating Chatbot */}
      <FloatingChatbot />
    </main>
  );
}
