export interface FilePreview {
  url: string;
  type: string;
  name: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
  files?: FilePreview[];
  timestamp: Date;
}

export interface ChatbotProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface FloatingChatbotProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  tourActive?: boolean;
}

export interface CalendarTimePickerProps {
  onDateTimeSelect: (dateTime: string) => void;
  onCancel: () => void;
  onScrollToBottom?: () => void;
}

export interface ChatbotAnalyticsEvent {
  eventType: string;
  sessionId: string;
  timestamp: any;
  userAgent?: string;
  page?: string;
  [key: string]: any;
}

export interface ContactInfo {
  name?: string;
  email?: string;
  company?: string;
  position?: string;
  message?: string;
  isContactRequest: boolean;
}

export interface SessionInfo {
  id: string;
  lastActivity: number;
  isExpired: boolean;
} 