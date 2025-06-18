"use client";

import { useState, useEffect } from "react";
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
      text: "Hello! I'm Lawrence's virtual assistant. How can I help you today?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    if (!inputValue.trim()) return;
    setError(null);
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      isUser: true,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    try {
      const res = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage.text,
          history: messages.map(({ text, isUser }) => ({ text, isUser })),
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
      setMessages(prev => [...prev, aiMessage]);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
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
            <Card className="w-72 sm:w-80 h-80 sm:h-96 shadow-lg border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                  <Icons.bot className="h-4 w-4 sm:h-5 sm:w-5" />
                  Virtual Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-48 sm:h-64 px-3 sm:px-4">
                  <div className="space-y-2 sm:space-y-3 pb-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          "flex",
                          message.isUser ? "justify-end" : "justify-start"
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[85%] rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm",
                            message.isUser
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          )}
                        >
                          {message.text}
                        </div>
                      </div>
                    ))}
                    {isTyping && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-lg px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm flex items-center gap-2">
                          <Icons.spinner className="animate-spin h-4 w-4 mr-1" />
                          <span>Thinking...</span>
                        </div>
                      </div>
                    )}
                    {error && (
                      <div className="flex justify-center">
                        <div className="bg-destructive/10 text-destructive rounded-lg px-2 py-1 text-xs">
                          {error}
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <div className="p-3 sm:p-4 border-t">
                  <div className="flex gap-2">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="flex-1 text-xs sm:text-sm"
                      disabled={isTyping}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      size="sm"
                    >
                      <Icons.send className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  </div>
                </div>
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