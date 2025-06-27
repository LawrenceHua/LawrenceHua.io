"use client";

import { useState, useRef, useEffect } from "react";
import {
  FiCalendar,
  FiClock,
  FiX,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import type { CalendarTimePickerProps } from "../../types/chatbot";

export function CalendarPicker({
  onDateTimeSelect,
  onCancel,
  onScrollToBottom,
}: CalendarTimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const calendarRef = useRef<HTMLDivElement>(null);

  const today = new Date();
  const daysInMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentMonth.getFullYear(),
    currentMonth.getMonth(),
    1
  ).getDay();

  const timeSlots = [
    "9:00 AM",
    "9:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "11:30 AM",
    "12:00 PM",
    "12:30 PM",
    "1:00 PM",
    "1:30 PM",
    "2:00 PM",
    "2:30 PM",
    "3:00 PM",
    "3:30 PM",
    "4:00 PM",
    "4:30 PM",
    "5:00 PM",
    "5:30 PM",
  ];

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isDateAvailable = (date: Date) => {
    const dayOfWeek = date.getDay();
    // Only weekdays (Monday to Friday)
    return dayOfWeek >= 1 && dayOfWeek <= 5 && date >= today;
  };

  const formatSelectedDateTime = () => {
    if (!selectedDate || !selectedTime) return "";
    const dateStr = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    return `${dateStr} at ${selectedTime} EST`;
  };

  const handleSubmit = () => {
    if (selectedDate && selectedTime) {
      onDateTimeSelect(formatSelectedDateTime());
    }
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      );
      const isAvailable = isDateAvailable(date);
      const isSelected =
        selectedDate && selectedDate.toDateString() === date.toDateString();

      days.push(
        <button
          key={day}
          onClick={() => isAvailable && setSelectedDate(date)}
          disabled={!isAvailable}
          className={`p-2 text-sm rounded-lg transition-all duration-200 font-semibold ${
            isSelected
              ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg transform scale-105"
              : isAvailable
                ? "hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 text-slate-800 hover:text-purple-700 hover:shadow-md border border-transparent hover:border-purple-200"
                : "text-slate-400 cursor-not-allowed opacity-60"
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    if (direction === "prev") {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }

    // Don't go before current month
    if (newMonth >= new Date(today.getFullYear(), today.getMonth(), 1)) {
      setCurrentMonth(newMonth);
    }
  };

  // Auto-scroll to next input section when user clicks calendar inputs
  const scrollToNextSection = () => {
    if (!onScrollToBottom) return;
    
    // Always scroll to the bottom to show the next input section
    setTimeout(() => {
      onScrollToBottom();
    }, 100); // Small delay to ensure DOM is updated
  };

  // Auto-scroll when date is selected to show time selection
  useEffect(() => {
    if (selectedDate) {
      scrollToNextSection();
    }
  }, [selectedDate]);

  // Auto-scroll when time is selected to show confirmation section
  useEffect(() => {
    if (selectedDate && selectedTime) {
      scrollToNextSection();
    }
  }, [selectedTime]);

  return (
    <div
      ref={calendarRef}
      className="bg-white rounded-xl border-2 border-purple-200 p-6 shadow-2xl max-w-md mx-auto"
      style={{
        boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.3), 0 0 0 1px rgba(139, 92, 246, 0.2)'
      }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center">
            <FiCalendar className="w-3 h-3 text-white" />
          </div>
          Schedule Meeting
        </h3>
        <button
          onClick={onCancel}
          className="p-2 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 rounded-full transition-all duration-200 hover:scale-105 group"
        >
          <FiX className="w-4 h-4 text-slate-500 group-hover:text-red-500" />
        </button>
      </div>

      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth("prev")}
          className="p-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 rounded-full transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={
            currentMonth.getMonth() === today.getMonth() &&
            currentMonth.getFullYear() === today.getFullYear()
          }
        >
          <FiChevronLeft className="w-5 h-5 text-slate-800" />
        </button>
        <h4 className="font-bold text-slate-900 text-lg">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h4>
        <button
          onClick={() => navigateMonth("next")}
          className="p-2 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 rounded-full transition-all duration-200 hover:scale-105"
        >
          <FiChevronRight className="w-5 h-5 text-slate-800" />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {dayNames.map((day) => (
          <div
            key={day}
            className="p-2 text-xs font-semibold text-slate-700 text-center bg-gradient-to-r from-purple-50 to-blue-50 rounded-md border border-purple-100"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-8">{renderCalendarDays()}</div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-600 flex items-center justify-center">
              <FiClock className="w-2.5 h-2.5 text-white" />
            </div>
            <span className="text-slate-900">
              Select Time (EST)
            </span>
          </h4>
          <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
            {timeSlots.map((time) => (
              <button
                key={time}
                onClick={() => setSelectedTime(time)}
                className={`p-2.5 text-sm rounded-lg border transition-all duration-200 font-semibold ${
                  selectedTime === time
                    ? "bg-gradient-to-r from-purple-500 to-blue-600 text-white border-purple-500 shadow-lg transform scale-105"
                    : "bg-white text-slate-800 border-purple-200 hover:bg-gradient-to-r hover:from-purple-50 hover:to-blue-50 hover:border-purple-300 hover:shadow-md hover:scale-102"
                }`}
              >
                {time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Confirmation */}
      {selectedDate && selectedTime && (
        <div className="border-t border-purple-200/50 pt-6">
          <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-4 mb-4 border border-purple-200/50">
            <p className="text-sm font-bold text-slate-900 mb-1">
              Selected Time:
            </p>
            <p className="text-slate-800 font-semibold">{formatSelectedDateTime()}</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 rounded-xl hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100 transition-all duration-200 font-medium hover:scale-105"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-blue-600 text-white rounded-xl hover:from-purple-600 hover:to-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl hover:scale-105"
            >
              Confirm Meeting
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 