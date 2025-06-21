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
import Chatbot from "../components/Chatbot";

export default function TestPage() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <main className="min-h-screen bg-white dark:bg-slate-950">
      <ModernNavigation />

      <HeroSection />

      <AboutSection />

      <SkillsSection />

      <TimelineSection />

      <ProjectsSection />

      <TestimonialsSection />

      <ContactSection />

      <Chatbot isOpen={isChatbotOpen} onClose={() => setIsChatbotOpen(false)} />
    </main>
  );
}
