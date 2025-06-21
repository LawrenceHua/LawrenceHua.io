"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import DatePicker from "react-datepicker";
import {
  Mail,
  MessageCircle,
  Calendar,
  ExternalLink,
  Send,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { FaLinkedin, FaGithub, FaFacebookF } from "react-icons/fa6";
import "react-datepicker/dist/react-datepicker.css";

export function ContactSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [meetingData, setMeetingData] = useState({
    name: "",
    email: "",
    company: "",
    selectedDate: null as Date | null,
    selectedTime: "",
    message: "",
    meetingType: "30min",
  });
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [activeForm, setActiveForm] = useState<"none" | "message" | "calendar">(
    "message"
  );

  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [version, setVersion] = useState("1.0.39");
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true after component mounts to avoid hydration mismatch
  React.useEffect(() => {
    setIsClient(true);
    // Fetch version from API
    fetch("/api/version")
      .then((res) => res.json())
      .then((data) => {
        if (data.version) setVersion(data.version);
        if (data.lastUpdated) setLastUpdated(new Date(data.lastUpdated));
      })
      .catch(() => {
        // Fallback if API is not available
        setVersion("1.0.39");
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("loading");

    try {
      const response = await fetch("/api/resend-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setFormData({ name: "", email: "", company: "", message: "" });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    }

    setTimeout(() => setSubmitStatus("idle"), 5000);
  };

  const handleMeetingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus("loading");

    try {
      const meetingFormData = {
        ...meetingData,
        type: "meeting",
        dateTime:
          meetingData.selectedDate && meetingData.selectedTime
            ? `${meetingData.selectedDate.toDateString()} at ${meetingData.selectedTime}`
            : "Date/time to be confirmed",
      };

      const response = await fetch("/api/resend-contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(meetingFormData),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setMeetingData({
          name: "",
          email: "",
          company: "",
          selectedDate: null,
          selectedTime: "",
          message: "",
          meetingType: "30min",
        });
      } else {
        setSubmitStatus("error");
      }
    } catch (error) {
      setSubmitStatus("error");
    }

    setTimeout(() => setSubmitStatus("idle"), 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleMeetingChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setMeetingData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.6,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const socialLinks = [
    {
      name: "LinkedIn",
      url: "https://www.linkedin.com/in/lawrencehua",
      icon: FaLinkedin,
      color: "#0077B5",
      description: "Professional network and career updates",
    },
    {
      name: "GitHub",
      url: "https://github.com/LawrenceHua",
      icon: FaGithub,
      color: "#333",
      description: "Open source projects and code repositories",
    },
    {
      name: "Facebook",
      url: "https://www.facebook.com/lawrence.hua.965",
      icon: FaFacebookF,
      color: "#1877F2",
      description: "Connect with me on Facebook",
    },
  ];

  const contactMethods = [
    {
      title: "Direct Email",
      description: "For immediate responses and general inquiries",
      icon: Mail,
      action: "message",
      buttonText: "Send Email",
      color: "from-blue-500 to-blue-600",
    },
    {
      title: "Schedule a Meeting",
      description: "Book a 30-minute call to discuss opportunities",
      icon: Calendar,
      action: "calendar",
      buttonText: "Book Call",
      color: "from-green-500 to-green-600",
    },
  ];

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-20 bg-slate-50 dark:bg-slate-900 overflow-hidden"
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-blue-500/5 blur-3xl" />
        <div className="absolute bottom-20 left-20 h-64 w-64 rounded-full bg-purple-500/5 blur-3xl" />
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative z-10 mx-auto max-w-7xl px-6"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="mb-16 text-center">
          <h2 className="mb-6 text-4xl font-bold text-slate-900 dark:text-white sm:text-5xl">
            Let's{" "}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Connect
            </span>
          </h2>
          <p className="mx-auto max-w-3xl text-lg text-slate-600 dark:text-slate-300">
            Ready to build the next AI-driven solution together?
            <br />
            Whether you're looking for a product manager, technical consultant,
            or just want to chat,
            <br />
            <motion.strong
              className="text-slate-900 dark:text-white text-xl font-bold"
              animate={{
                scale: [1, 1.05, 1],
                textShadow: [
                  "0 0 0 rgba(59, 130, 246, 0)",
                  "0 0 20px rgba(59, 130, 246, 0.3)",
                  "0 0 0 rgba(59, 130, 246, 0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              I'd love to hear from you.
            </motion.strong>
          </p>
          <div className="mx-auto mt-6 h-1 w-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
        </motion.div>

        {/* Mobile-Optimized Layout */}
        <div className="space-y-12">
          {/* Contact Methods Section */}
          <motion.div variants={itemVariants} className="space-y-8">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              Get In Touch
            </h3>

            {/* Quick Contact Methods */}
            <div className="space-y-6">
              {contactMethods.map((method) => {
                const isActive = activeForm === method.action;
                return (
                  <motion.div
                    key={method.title}
                    whileHover={{ scale: 1.02 }}
                    className={`group relative overflow-hidden rounded-2xl p-6 shadow-lg transition-all duration-300 hover:shadow-xl cursor-pointer ${
                      isActive
                        ? "bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-2 border-blue-200 dark:border-blue-800 shadow-blue-500/20"
                        : "bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                    onClick={() => {
                      if (
                        method.action === "message" ||
                        method.action === "calendar"
                      ) {
                        setActiveForm(method.action as "message" | "calendar");
                      }
                    }}
                  >
                    <div className="flex items-start space-x-4">
                      <motion.div
                        animate={{
                          scale: isActive ? 1.1 : 1,
                          rotate: isActive ? 5 : 0,
                        }}
                        transition={{ duration: 0.2 }}
                        className={`rounded-xl bg-gradient-to-r ${method.color} p-3 text-white shadow-lg`}
                      >
                        <method.icon className="h-6 w-6" />
                      </motion.div>
                      <div className="flex-1">
                        <h4
                          className={`text-lg font-semibold mb-1 transition-colors duration-200 ${
                            isActive
                              ? "text-blue-900 dark:text-blue-100"
                              : "text-slate-900 dark:text-white"
                          }`}
                        >
                          {method.title}
                        </h4>
                        <p
                          className={`text-sm mb-4 transition-colors duration-200 ${
                            isActive
                              ? "text-blue-700 dark:text-blue-300"
                              : "text-slate-600 dark:text-slate-300"
                          }`}
                        >
                          {method.description}
                        </p>
                        {method.action === "message" ||
                        method.action === "calendar" ? (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveForm(
                                method.action as "message" | "calendar"
                              );
                            }}
                            className={`inline-flex items-center space-x-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-all duration-200 ${
                              isActive
                                ? `bg-gradient-to-r ${method.color} shadow-lg ring-2 ring-white ring-offset-2`
                                : `bg-gradient-to-r ${method.color} hover:shadow-lg`
                            }`}
                          >
                            <span>
                              {isActive ? "✓ Active" : method.buttonText}
                            </span>
                            <motion.div
                              animate={{ rotate: isActive ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </motion.div>
                          </motion.button>
                        ) : (
                          <Link
                            href={method.action}
                            target={
                              method.action.startsWith("http")
                                ? "_blank"
                                : undefined
                            }
                            rel={
                              method.action.startsWith("http")
                                ? "noopener noreferrer"
                                : undefined
                            }
                            className={`inline-flex items-center space-x-2 rounded-lg bg-gradient-to-r ${method.color} px-4 py-2 text-sm font-medium text-white transition-all duration-200 hover:shadow-lg`}
                          >
                            <span>{method.buttonText}</span>
                            <ExternalLink className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 0.3 }}
                        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500"
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Contact Form Section */}
          <motion.div variants={itemVariants}>
            {/* Form Header with Instructions */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800"
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  👆 Click the contact methods above to switch forms
                </p>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Currently showing:{" "}
                <span className="font-semibold capitalize">{activeForm}</span>{" "}
                form
              </p>
            </motion.div>

            {activeForm === "none" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="text-center p-8"
              >
                <h3 className="mb-4 text-2xl font-bold text-slate-900 dark:text-white">
                  Choose Contact Method
                </h3>
                <p className="text-slate-600 dark:text-slate-300">
                  Select a contact method from the left to get started
                </p>
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {activeForm === "message" && (
                <motion.div
                  key="message-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Send a Message
                    </h3>
                    <button
                      onClick={() => setActiveForm("none")}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="name"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="company"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          Company
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                          placeholder="Your company"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="your.email@company.com"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={6}
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                        placeholder="Tell me about your project, opportunity, or just say hello..."
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={submitStatus === "loading"}
                      whileHover={{
                        scale: submitStatus === "loading" ? 1 : 1.02,
                      }}
                      whileTap={{
                        scale: submitStatus === "loading" ? 1 : 0.98,
                      }}
                      className={`w-full rounded-lg px-6 py-4 font-semibold text-white transition-all duration-300 ${
                        submitStatus === "loading"
                          ? "bg-slate-400 cursor-not-allowed"
                          : submitStatus === "success"
                            ? "bg-green-600 hover:bg-green-700"
                            : submitStatus === "error"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg hover:shadow-blue-500/25"
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {submitStatus === "loading" && (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        )}
                        {submitStatus === "success" && (
                          <CheckCircle className="h-5 w-5" />
                        )}
                        {submitStatus === "error" && (
                          <AlertCircle className="h-5 w-5" />
                        )}
                        {submitStatus === "idle" && (
                          <Send className="h-5 w-5" />
                        )}
                        <span>
                          {submitStatus === "loading"
                            ? "Sending..."
                            : submitStatus === "success"
                              ? "Message Sent!"
                              : submitStatus === "error"
                                ? "Try Again"
                                : "Send Message"}
                        </span>
                      </div>
                    </motion.button>

                    {/* Status Messages */}
                    {submitStatus === "success" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-green-700 dark:text-green-300"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5" />
                          <span>
                            Thanks! I'll get back to you within 24 hours.
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {submitStatus === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300"
                      >
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5" />
                          <span>
                            Something went wrong. Please try again or email me
                            directly.
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </form>
                </motion.div>
              )}

              {activeForm === "calendar" && (
                <motion.div
                  key="calendar-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                      Schedule a Meeting
                    </h3>
                    <button
                      onClick={() => setActiveForm("none")}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                      ×
                    </button>
                  </div>
                  <form onSubmit={handleMeetingSubmit} className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="meeting-name"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          Name *
                        </label>
                        <input
                          type="text"
                          id="meeting-name"
                          name="name"
                          required
                          value={meetingData.name}
                          onChange={handleMeetingChange}
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="meeting-company"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          Company
                        </label>
                        <input
                          type="text"
                          id="meeting-company"
                          name="company"
                          value={meetingData.company}
                          onChange={handleMeetingChange}
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                          placeholder="Your company"
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="meeting-email"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Email *
                      </label>
                      <input
                        type="email"
                        id="meeting-email"
                        name="email"
                        required
                        value={meetingData.email}
                        onChange={handleMeetingChange}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="your.email@company.com"
                      />
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          Preferred Date *
                        </label>
                        <DatePicker
                          selected={meetingData.selectedDate}
                          onChange={(date: Date | null) =>
                            setMeetingData((prev) => ({
                              ...prev,
                              selectedDate: date,
                            }))
                          }
                          minDate={new Date()}
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                          placeholderText="Select a date"
                          dateFormat="MMMM d, yyyy"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="meeting-time"
                          className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                        >
                          Preferred Time *
                        </label>
                        <select
                          id="meeting-time"
                          name="selectedTime"
                          required
                          value={meetingData.selectedTime}
                          onChange={handleMeetingChange}
                          className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                        >
                          <option value="">Select time</option>
                          <option value="9:00 AM EST">9:00 AM EST</option>
                          <option value="10:00 AM EST">10:00 AM EST</option>
                          <option value="11:00 AM EST">11:00 AM EST</option>
                          <option value="12:00 PM EST">12:00 PM EST</option>
                          <option value="1:00 PM EST">1:00 PM EST</option>
                          <option value="2:00 PM EST">2:00 PM EST</option>
                          <option value="3:00 PM EST">3:00 PM EST</option>
                          <option value="4:00 PM EST">4:00 PM EST</option>
                          <option value="5:00 PM EST">5:00 PM EST</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="meeting-type"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Meeting Type
                      </label>
                      <select
                        id="meeting-type"
                        name="meetingType"
                        value={meetingData.meetingType}
                        onChange={handleMeetingChange}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      >
                        <option value="15min">15 minute call</option>
                        <option value="30min">30 minute call</option>
                        <option value="45min">45 minute call</option>
                        <option value="60min">1 hour call</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="meeting-message"
                        className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
                      >
                        Message (Optional)
                      </label>
                      <textarea
                        id="meeting-message"
                        name="message"
                        rows={4}
                        value={meetingData.message}
                        onChange={handleMeetingChange}
                        className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-4 py-3 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors resize-none"
                        placeholder="Tell me what you'd like to discuss in our meeting..."
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={submitStatus === "loading"}
                      whileHover={{
                        scale: submitStatus === "loading" ? 1 : 1.02,
                      }}
                      whileTap={{
                        scale: submitStatus === "loading" ? 1 : 0.98,
                      }}
                      className={`w-full rounded-lg px-6 py-4 font-semibold text-white transition-all duration-300 ${
                        submitStatus === "loading"
                          ? "bg-slate-400 cursor-not-allowed"
                          : submitStatus === "success"
                            ? "bg-green-600 hover:bg-green-700"
                            : submitStatus === "error"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-lg hover:shadow-green-500/25"
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        {submitStatus === "loading" && (
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        )}
                        {submitStatus === "success" && (
                          <CheckCircle className="h-5 w-5" />
                        )}
                        {submitStatus === "error" && (
                          <AlertCircle className="h-5 w-5" />
                        )}
                        {submitStatus === "idle" && (
                          <Calendar className="h-5 w-5" />
                        )}
                        <span>
                          {submitStatus === "loading"
                            ? "Scheduling..."
                            : submitStatus === "success"
                              ? "Meeting Requested!"
                              : submitStatus === "error"
                                ? "Try Again"
                                : "Request Meeting"}
                        </span>
                      </div>
                    </motion.button>

                    {/* Status Messages */}
                    {submitStatus === "success" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg bg-green-50 dark:bg-green-900/20 p-4 text-green-700 dark:text-green-300"
                      >
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="h-5 w-5" />
                          <span>
                            Meeting request sent! I'll confirm the time via
                            email within 24 hours.
                          </span>
                        </div>
                      </motion.div>
                    )}

                    {submitStatus === "error" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-red-700 dark:text-red-300"
                      >
                        <div className="flex items-center space-x-2">
                          <AlertCircle className="h-5 w-5" />
                          <span>
                            Something went wrong. Please try again or email me
                            directly.
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Social Links Section */}
          <motion.div variants={itemVariants} className="space-y-6">
            <h4 className="text-xl font-semibold text-slate-900 dark:text-white">
              Follow My Journey
            </h4>
            <div className="space-y-4">
              {socialLinks.map((social) => (
                <motion.div
                  key={social.name}
                  whileHover={{ scale: 1.02 }}
                  className="group flex items-center space-x-4 rounded-xl bg-white dark:bg-slate-800 p-4 shadow-lg transition-all duration-300 hover:shadow-xl"
                >
                  <div
                    className="rounded-full p-3 text-white shadow-lg"
                    style={{ backgroundColor: social.color }}
                  >
                    <social.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h5 className="font-semibold text-slate-900 dark:text-white">
                      {social.name}
                    </h5>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {social.description}
                    </p>
                  </div>
                  <Link
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 transition-colors hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <ExternalLink className="h-5 w-5" />
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-900/50 border-t border-blue-900/30 py-8 mt-16 w-full rounded-lg">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex flex-col items-center space-y-6">
              {/* Social Media Links */}
              <div className="flex items-center justify-center space-x-4 sm:space-x-6 flex-wrap gap-y-2 sm:gap-y-0">
                <Link
                  href="https://www.facebook.com/lawrence.hua.965"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200 p-2"
                  title="Facebook"
                >
                  <FaFacebookF className="w-6 h-6" />
                </Link>

                <Link
                  href="https://github.com/LawrenceHua"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200 p-2"
                  title="GitHub"
                >
                  <FaGithub className="w-6 h-6" />
                </Link>

                <Link
                  href="mailto:Lawrencehua2@gmail.com"
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200 p-2"
                  title="Email: Lawrencehua2@gmail.com"
                >
                  <Mail className="w-6 h-6" />
                </Link>

                <button
                  onClick={() => {
                    setActiveForm("message");
                    // Scroll to the contact form
                    const contactSection = document.getElementById("contact");
                    if (contactSection) {
                      const elementPosition =
                        contactSection.getBoundingClientRect().top;
                      const offsetPosition =
                        elementPosition + window.pageYOffset - 120;
                      window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth",
                      });
                    }
                  }}
                  className="text-gray-400 hover:text-blue-400 transition-colors duration-200 p-2"
                  title="Send a Message"
                >
                  <Send className="w-6 h-6" />
                </button>
              </div>

              {/* Copyright */}
              <div className="text-center text-gray-400 text-sm px-4">
                <p>&copy; 2025 Lawrence W. Hua. All rights reserved.</p>
                <p className="mt-1">
                  Built with ❤️ using{" "}
                  <span className="font-medium text-blue-400">Next.js 14</span>,{" "}
                  <span className="font-medium text-blue-400">TypeScript</span>,{" "}
                  <span className="font-medium text-blue-400">TailwindCSS</span>
                  ,{" "}
                  <span className="font-medium text-blue-400">
                    Framer Motion
                  </span>
                  , <span className="font-medium text-blue-400">React 18</span>
                </p>
                <p className="mt-1 text-xs opacity-90">
                  <span className="font-medium">Tech Stack:</span> OpenAI API •
                  Resend • Firebase • Recharts • Lenis Smooth Scroll • React
                  DatePicker
                </p>
                <p className="mt-2 text-xs">
                  Last updated:{" "}
                  {isClient &&
                    lastUpdated.toLocaleString("en-US", {
                      timeZone: "America/New_York",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                      hour12: false,
                    })}{" "}
                  EST • Version {isClient ? version : ""}
                </p>
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </section>
  );
}
