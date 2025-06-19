"use client";

// @jsxImportSource react
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@repo/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/card";
import { Input } from "@repo/ui/input";
import { ScrollArea } from "@repo/ui/scroll-area";
import { Icons } from "@repo/ui/icons";
import { cn } from "@repo/ui";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hi! I'm Lawrence's AI assistant. I can help you learn more about his experience, skills, and projects.\n**For recruiters: You can also share files with me for analysis.**\nWhat would you like to know?`,
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attachment, setAttachment] = useState<File | null>(null);

  useEffect(() => {
    const handleOpenChatbot = () => {
      setIsOpen(true);
    };
    window.addEventListener('open-chatbot', handleOpenChatbot);
    return () => {
      window.removeEventListener('open-chatbot', handleOpenChatbot);
    };
  }, []);

  const handleSendMessage = async () => {
    if (!inputValue.trim() && !attachment) return;
    setError(null);
    let userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
    if (attachment) {
      userMessage = {
        ...userMessage,
        text: inputValue ? `${inputValue}\n[Attachment: ${attachment.name}]` : `[Attachment: ${attachment.name}]`,
      };
    }
    setMessages((prev: Message[]) => [...prev, userMessage]);
    setInputValue("");
    setAttachment(null);
    setIsTyping(true);

    // TODO: Send attachment to backend if needed
    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.text,
          history: messages.map(({ text, isUser }: { text: string; isUser: boolean }) => ({ text, isUser })),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unknown error");
      }
      const data = await res.json();
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.message,
        isUser: false,
        timestamp: new Date(),
      };
      setMessages((prev: Message[]) => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="mb-4"
          >
            <Card className="w-80 sm:w-96 h-[32rem] sm:h-[36rem] shadow-2xl border bg-white dark:bg-neutral-900 flex flex-col justify-between">
              <CardHeader className="pb-2 border-b bg-gradient-to-r from-blue-50 via-white to-blue-50 dark:from-neutral-800 dark:via-neutral-900 dark:to-neutral-800">
                <CardTitle className="text-lg flex items-center gap-2 font-semibold text-black dark:text-white">
                  <Icons.bot className="h-5 w-5" />
                  Lawrence's AI Assistant
                </CardTitle>
                <div className="mt-1 text-xs text-gray-600 dark:text-gray-300 font-medium">
                  Your private, professional assistant
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col">
                <ScrollArea className="h-full px-4 py-2">
                  <div className="space-y-3 pb-4">
                    {messages.map((message: Message, idx: number) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.isUser ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-2xl px-4 py-2 text-sm break-words",
                            message.isUser
                              ? "bg-blue-600 text-white shadow-md"
                              : "bg-gray-100 dark:bg-neutral-800 text-black dark:text-white shadow"
                          )}
                          style={{
                            fontWeight: !message.isUser && idx === 0 ? 500 : undefined,
                            fontSize: idx === 0 ? '1rem' : undefined,
                            lineHeight: 1.5,
                          }}
                        >
                          {!message.isUser && idx === 0 ? (
                            <span dangerouslySetInnerHTML={{ __html: message.text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') }} />
                          ) : (
                            message.text
                          )}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-neutral-800 rounded-2xl px-4 py-2 text-sm flex items-center gap-2 text-black dark:text-white">
                          <Icons.spinner className="animate-spin h-4 w-4 mr-1" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    )}
                    {error && (
                      <div className="flex justify-center">
                        <div className="bg-red-100 text-red-700 rounded-lg px-2 py-1 text-xs">
                          {error}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <form
                  className="p-4 border-t bg-white dark:bg-neutral-900 flex flex-col gap-2"
                  style={{ position: 'sticky', bottom: 0, zIndex: 10 }}
                  onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
                  autoComplete="off"
                >
                  <div className="flex gap-2 items-end">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 text-base bg-gray-50 dark:bg-neutral-800 text-black dark:text-white rounded-2xl px-4 py-2 border border-gray-200 dark:border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      disabled={isTyping}
                      style={{ minHeight: 44 }}
                    />
                    <input
                      type="file"
                      id="chatbot-attachment"
                      style={{ display: 'none' }}
                      onChange={e => setAttachment(e.target.files?.[0] || null)}
                      disabled={isTyping}
                    />
                    <label htmlFor="chatbot-attachment" className="cursor-pointer text-xs text-blue-600 underline px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-neutral-800 transition">
                      <Icons.paperclip className="inline h-4 w-4 mr-1 align-text-bottom" />Attach
                    </label>
                    <Button
                      onClick={handleSendMessage}
                      disabled={(!inputValue.trim() && !attachment) || isTyping}
                      size="sm"
                      type="submit"
                      className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 shadow"
                    >
                      <Icons.send className="h-4 w-4" />
                    </Button>
                  </div>
                  {attachment && (
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-700 dark:text-gray-300">
                      <Icons.paperclip className="h-4 w-4" />
                      <span className="truncate max-w-[160px]">{attachment.name}</span>
                      <button
                        type="button"
                        className="ml-2 text-red-500 hover:underline"
                        onClick={() => setAttachment(null)}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="rounded-full w-12 h-12 sm:w-14 sm:h-14 shadow-lg"
        size="lg"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icons.x className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Icons.messageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </div>
  );
} 