"use client";

import Chatbot from "@/components/Chatbot";

export default function ChatbotPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Chatbot isOpen={true} onClose={() => {}} />
    </div>
  );
}
