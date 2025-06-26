# Modular Chatbot Architecture

This directory contains the modularized chatbot components that replace the previous monolithic implementation. The structure promotes better separation of concerns, reusability, and maintainability.

## Architecture Overview

### Core Structure

```
src/
├── types/chatbot.ts           # TypeScript interfaces
├── lib/                       # Utility modules
│   ├── firebase.ts           # Centralized Firebase config
│   ├── analytics.ts          # Analytics tracking
│   ├── session.ts            # Session management
│   └── messageFormatter.ts   # Message formatting logic
├── hooks/
│   └── useChatbot.ts         # Main chatbot state hook
└── components/chatbot/
    ├── ChatInterface.tsx     # Main chat container
    ├── MessageList.tsx       # Message rendering
    ├── MessageInput.tsx      # Input interface
    ├── CalendarPicker.tsx    # Meeting scheduling
    ├── FloatingButton.tsx    # Floating button + popup
    └── index.ts              # Exports
```

## Components

### `ChatInterface.tsx`
**Purpose**: Main chat container that orchestrates all chatbot functionality  
**Dependencies**: Uses `useChatbot` hook, renders `MessageList`, `MessageInput`, and `CalendarPicker`  
**Features**:
- Manages modal visibility and layout
- Handles global button click events
- Coordinates calendar and message modes
- Responsive design for mobile/desktop

### `MessageList.tsx`
**Purpose**: Renders the list of messages with proper formatting  
**Features**:
- Message bubbles with role-based styling
- File attachment previews
- Loading indicators
- Timestamp display
- Auto-scroll to bottom

### `MessageInput.tsx`
**Purpose**: Handles user input and file uploads  
**Features**:
- Text input with Enter key handling
- File attachment with previews
- File validation and error handling
- Responsive design
- Helper text with suggestions

### `CalendarPicker.tsx`
**Purpose**: Interactive calendar for meeting scheduling  
**Features**:
- Month navigation
- Weekday-only availability
- Time slot selection
- Confirmation interface
- Auto-scroll coordination

### `FloatingButton.tsx`
**Purpose**: Floating action button with smart popup system  
**Features**:
- Scroll-triggered popups
- Timer-based notifications
- Dismissal tracking
- Tour mode integration
- Analytics tracking

## Hooks

### `useChatbot.ts`
**Purpose**: Central state management for chatbot functionality  
**Returns**:
- Message state and setters
- File handling functions
- Loading and mobile states
- Form submission handlers
- Refs for DOM elements

## Utilities

### `lib/firebase.ts`
- Centralized Firebase initialization
- Error handling and fallbacks
- Single source of truth for config

### `lib/analytics.ts`
- Analytics event tracking
- Session ID management  
- Button click tracking
- Firebase integration

### `lib/session.ts`
- Session management
- Expiration handling
- Activity tracking
- Local storage utilities

### `lib/messageFormatter.ts`
- Message formatting and styling
- Button tag replacement
- Markdown processing
- Love mode theming

## Benefits of Modular Architecture

### 1. **Separation of Concerns**
- Each component has a single responsibility
- UI logic separated from business logic
- Utilities are reusable across components

### 2. **Improved Maintainability**
- Smaller, focused files (< 300 lines each)
- Easy to locate and fix bugs
- Clear dependency relationships

### 3. **Better Testability**
- Individual components can be tested in isolation
- Mocked dependencies are easier to manage
- Business logic in hooks can be unit tested

### 4. **Enhanced Reusability**
- Components can be used independently
- Utilities can be shared across the app
- Easy to create variations or themed versions

### 5. **Developer Experience**
- Faster file navigation
- Reduced cognitive load
- Clear boundaries between features
- Better TypeScript integration

### 6. **Performance Benefits**
- Reduced bundle size through tree-shaking
- Better code splitting opportunities
- Eliminated code duplication

## Migration Notes

### What Changed
- **Before**: Single 1625-line `Chatbot.tsx` file
- **After**: Multiple focused components (~200-300 lines each)

### Breaking Changes
- None - the public API remains the same
- All imports still work through the main components
- Backward compatibility maintained

### Removed Duplication
- Firebase configuration (centralized)
- Analytics tracking (shared utilities)
- Session management (dedicated module)
- Message formatting (reusable utility)

## Usage Examples

### Using Individual Components
```tsx
import { MessageList, MessageInput } from './components/chatbot';

// Use components individually for custom implementations
```

### Using the Complete Interface
```tsx
import { ChatInterface } from './components/chatbot';

// Use the full chatbot interface
<ChatInterface isOpen={isOpen} onClose={onClose} />
```

### Using the Hook
```tsx
import { useChatbot } from './hooks/useChatbot';

// Access chatbot state and actions in custom components
const { messages, sendMessage, isLoading } = useChatbot(isOpen);
```

## Future Enhancements

The modular structure makes it easy to add new features:

1. **Message Types**: Add new message components for rich content
2. **Themes**: Create themed versions of components
3. **Plugins**: Add new utility modules for extended functionality
4. **Testing**: Add comprehensive test suites for each module
5. **Storybook**: Create component stories for design system

This architecture provides a solid foundation for continued development while maintaining the existing functionality and user experience. 