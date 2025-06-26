# Lawrence W. Hua - Personal Portfolio V2 🚀

**AI Product Manager | Transforming Ideas into Impactful Digital Solutions**

🌐 **Live Site**: [www.lawrencehua.com](https://www.lawrencehua.com)

> **V2 Update**: Complete redesign featuring modular chatbot architecture, enhanced mobile experience, advanced tour system, and professional dark theme across all devices.

---

## 🆕 What's New in V2

### 🏗️ **Modular Chatbot Architecture**
- **Complete Refactor**: Monolithic 1,600+ line chatbot split into clean, maintainable modules
- **TypeScript Components**: Separate files for types, hooks, analytics, session management
- **Reusable Components**: MessageList, MessageInput, CalendarPicker, FloatingButton
- **Custom Hooks**: Centralized state management with `useChatbot` hook
- **Better Performance**: Optimized loading states and instant UI feedback

### 📱 **Enhanced Mobile Experience**
- **Professional Dark Theme**: Consistent dark styling across all mobile interfaces
- **Improved Touch Interactions**: Better tap targets and responsive design
- **Smart Menu Behavior**: Click-outside to close functionality for hamburger menu
- **Compact Message Layout**: More content fits on screen with better spacing
- **Mobile Tour Optimization**: Perfect positioning for professional journey step

### ⚡ **Performance & UX Improvements**
- **Instant Quick Responses**: No loading delays for "Skills", "Projects", "Experience" buttons
- **Immediate Message Display**: User messages appear instantly with `flushSync` optimization
- **Smart Loading States**: Only show "thinking" indicators for complex queries
- **Click-Outside Behavior**: Professional menu interactions on mobile and desktop
- **Tour Analytics**: Complete tracking of tour interactions, pauses, and completions

### 🎯 **Advanced Analytics & Tour System**
- **Daily Analytics Graphs**: Date-specific analytics with hourly breakdowns
- **Enhanced Tour Tracking**: Track all user interactions including dismissals and restarts
- **Graph Section**: New analytics dashboard section with comprehensive daily insights
- **Mobile Tour Positioning**: Step 4 (professional journey) positioned closer to work experience
- **Floating Button Animation**: Stops pulsing after first interaction, persisted in localStorage

### 🎨 **Design & Content Improvements**
- **Actual Funny Fun Facts**: Replaced arrogant content with self-deprecating developer humor
- **Professional Calendar Styling**: Dark theme calendar matching chatbot aesthetics
- **Better Message Formatting**: Cleaner welcome message spacing and button organization
- **Consistent Color Themes**: Purple/blue gradients maintained across all components
- **Phone Contact Integration**: Added phone icon and number to footer

---

## 📁 Project Structure

```
LawrenceHua.io/
├── portfolio/                          # Main Next.js portfolio application (V2)
│   ├── src/
│   │   ├── app/                        # Next.js App Router
│   │   │   ├── analytics/              # Enhanced analytics dashboard with graphs
│   │   │   ├── api/                    # API routes
│   │   │   │   ├── analytics-assistant/ # AI data analyst endpoint
│   │   │   │   ├── auth/               # Authentication APIs
│   │   │   │   ├── chatbot/            # Modular chatbot API with GPT-4
│   │   │   │   ├── chatbot-analytics/  # Enhanced chatbot metrics API
│   │   │   │   ├── contact/            # Contact form handler
│   │   │   │   ├── geolocation/        # Optimized location tracking
│   │   │   │   ├── meeting-request/    # Meeting scheduling
│   │   │   │   ├── projects/           # Project data API
│   │   │   │   ├── recruiter-contact/  # Recruiter messaging
│   │   │   │   ├── resend-contact/     # Email service integration
│   │   │   │   ├── send-image/         # Image upload handling
│   │   │   │   └── version/            # App versioning
│   │   │   ├── chatbot/                # Standalone chatbot page
│   │   │   ├── mturk-examples/         # Amazon Mechanical Turk demos
│   │   │   ├── globals.css             # Global styles
│   │   │   ├── layout.tsx              # Root layout component
│   │   │   └── page.tsx                # Homepage with enhanced tour
│   │   ├── components/                 # Modular React components (V2)
│   │   │   ├── analytics/              # Enhanced analytics components
│   │   │   │   ├── AnalyticsAssistant.tsx # AI data analyst chatbot
│   │   │   │   ├── AnalyticsDashboard.tsx # Main dashboard
│   │   │   │   ├── AnalyticsProvider.tsx  # Context provider
│   │   │   │   └── sections/           # Dashboard sections including graphs
│   │   │   ├── chatbot/                # NEW: Modular chatbot components
│   │   │   │   ├── CalendarPicker.tsx  # Enhanced calendar with dark theme
│   │   │   │   ├── ChatInterface.tsx   # Main chat container
│   │   │   │   ├── FloatingButton.tsx  # Floating button with animation control
│   │   │   │   ├── MessageInput.tsx    # Input interface with menu
│   │   │   │   ├── MessageList.tsx     # Message rendering
│   │   │   │   └── index.ts            # Export file
│   │   │   ├── providers/              # Context providers
│   │   │   │   ├── SmoothScrollProvider.tsx
│   │   │   │   └── ThemeProvider.tsx
│   │   │   ├── sections/               # Page sections
│   │   │   │   ├── AboutSection.tsx
│   │   │   │   ├── ContactSection.tsx  # With phone integration
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── ProjectsSection.tsx
│   │   │   │   ├── SkillsSection.tsx
│   │   │   │   ├── TestimonialsSection.tsx
│   │   │   │   └── TimelineSection.tsx
│   │   │   ├── Chatbot.tsx             # LEGACY: Maintained for compatibility
│   │   │   ├── FloatingChatbot.tsx     # Enhanced popup chatbot trigger
│   │   │   ├── ModernNavigation.tsx    # Navigation component
│   │   │   ├── Navigation.tsx          # Alternative nav
│   │   │   └── VisitorTracker.tsx      # Optimized geolocation tracking
│   │   ├── hooks/                      # NEW: Custom hooks
│   │   │   └── useChatbot.ts           # Centralized chatbot state management
│   │   ├── lib/                        # NEW: Utility libraries
│   │   │   ├── analytics.ts            # Analytics tracking functions
│   │   │   ├── firebase.ts             # Centralized Firebase configuration
│   │   │   ├── messageFormatter.ts     # Message formatting with button replacement
│   │   │   ├── session.ts              # Session management
│   │   │   └── geolocation.ts          # Geolocation utilities
│   │   ├── types/                      # Enhanced TypeScript definitions
│   │   │   ├── chatbot.ts              # NEW: Chatbot-specific types
│   │   │   └── react-datepicker.d.ts
│   │   └── package.json
│   ├── public/                         # Static assets
│   │   ├── images/                     # General images
│   │   ├── logos/                      # Company and project logos
│   │   ├── profile.jpg                 # Profile picture
│   │   ├── resume.pdf                  # Downloadable resume
│   │   ├── favicon.ico                 # Site favicon
│   │   └── og-image.png               # Social media preview
│   ├── .env.local                     # Environment variables (create from .env.example)
│   ├── next.config.ts                 # Next.js configuration
│   ├── tailwind.config.ts             # TailwindCSS configuration
│   └── tsconfig.json                  # TypeScript configuration
├── packages/                          # Shared packages
│   └── ui/                           # Shared UI component library
│       ├── src/                      # shadcn/ui components
│       │   ├── hooks/               # Custom React hooks
│       │   ├── components.json      # shadcn/ui config
│       │   └── [various UI components]
│       └── package.json
├── tooling/                          # Development tooling
│   ├── eslint/                       # ESLint configurations
│   ├── github/                       # GitHub Actions
│   ├── prettier/                     # Prettier configurations
│   └── typescript/                   # TypeScript configurations
├── turbo/                            # Turbo configuration
├── LICENSE                           # MIT License
├── package.json                      # Root package.json
├── pnpm-workspace.yaml              # pnpm workspace config
├── turbo.json                       # Turbo build config
└── vercel.json                      # Vercel deployment config
```

---

## 🛠️ Tech Stack

### Core Framework & Language
- **Next.js 14.1.0** - React framework with App Router
- **TypeScript 5.x** - Type-safe JavaScript with strict mode
- **React 18** - Component-based UI library with concurrent features
- **Node.js >=22.11.0** - Server runtime environment

### Styling & UI Components
- **TailwindCSS 3.3.0** - Utility-first CSS framework
- **shadcn/ui** - Modern React component library
- **Framer Motion** - Animation and gesture library
- **Lucide React** - Beautiful & consistent icons
- **React Icons** - Popular icon libraries

### AI & Backend Services
- **OpenAI GPT-4** - Advanced language model for chatbot
- **Firebase 11.9.1** - Real-time database & analytics
- **Resend** - Modern email delivery service
- **PDF-Parse** - Document analysis for job descriptions

### Data Visualization & Charts
- **Recharts** - Composable charting library
- **React DatePicker** - Enhanced date selection component
- **React Hook Form** - Performant form library

### Development Tools
- **pnpm 9.15.4** - Fast, disk space efficient package manager
- **Turbo** - High-performance build system
- **ESLint** - Code linting and quality assurance
- **Prettier** - Code formatting and style consistency
- **Husky** - Git hooks for pre-commit checks

### Deployment & DevOps
- **Vercel** - Seamless deployment and hosting
- **GitHub Actions** - CI/CD automation
- **Vercel Analytics** - Performance and user insights
- **Environment Variables** - Secure configuration management

### Analytics & Tracking
- **Custom Analytics Dashboard** - Real-time visitor tracking with graphs
- **Firebase Analytics** - User interaction monitoring
- **Chatbot Analytics** - Conversation and engagement metrics
- **AI Analytics Assistant** - Natural language data querying
- **Geolocation Tracking** - Optimized visitor location insights
- **Tour Analytics** - Complete guided tour interaction tracking

---

## 🚀 Create Your Own Portfolio V2

Want a beautiful, AI-powered portfolio like this? Follow these steps to create your own V2 experience:

1. **Fork this repository**
   - Click the "Fork" button at the top right of this page.
2. **Clone your fork**
   ```bash
   git clone https://github.com/<your-username>/LawrenceHua.io.git
   cd LawrenceHua.io/portfolio
   ```
3. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```
4. **Customize your content**
   - Update your projects, timeline, and skills in `portfolio/src/app/page.tsx`.
   - Replace images in `portfolio/public/images/` and `portfolio/public/logos/`.
   - Update the chatbot prompts in `portfolio/src/app/api/chatbot/route.ts`.
   - Change your profile picture: replace `profile.jpg` in `portfolio/public/`.
   - Customize fun facts in the chatbot API to match your personality.
5. **Set up environment variables**
   - Copy `.env.example` to `.env.local` and fill in your API keys:
     ```bash
     # Required for AI features
     OPENAI_API_KEY=your_openai_api_key
     
     # Required for email functionality
     RESEND_API_KEY=your_resend_api_key
     EMAIL_NAME=your_email@domain.com
     
     # Required for analytics
     NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
     NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
     NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
     
     # Required for analytics dashboard access
     NEXT_PUBLIC_SECRET_PASS=your_analytics_password
     ```
6. **Run locally**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```
7. **Deploy to Vercel**
   - Connect your GitHub repo to [Vercel](https://vercel.com/)
   - Set environment variables in the Vercel dashboard
   - Deploy and enjoy your new V2 portfolio!

---

## 🌟 Portfolio Features (V2)

### 🤖 **Modular AI-Powered Chatbot** *(V2 REDESIGN)*

- **Modular Architecture**: Clean separation of concerns with TypeScript modules
- **Instant Quick Responses**: Zero-delay responses for "Skills", "Projects", "Experience"
- **Professional Mobile UI**: Dark theme consistent across all mobile devices
- **Smart Loading States**: Only shows "thinking" for complex, comprehensive queries
- **Enhanced Contact Flows**: Improved message and meeting request processing
- **Custom Hooks**: Centralized state management with `useChatbot` hook
- **Click-Outside Behavior**: Professional menu interactions on all devices
- **Session Persistence**: Maintains conversation state across interactions

#### Technical Architecture:
- **Types**: `src/types/chatbot.ts` - TypeScript definitions
- **Hooks**: `src/hooks/useChatbot.ts` - State management
- **Components**: `src/components/chatbot/` - Modular UI components
- **Utils**: `src/lib/` - Analytics, Firebase, session management
- **API**: Enhanced route with better error handling and performance

### 🎯 **Enhanced Interactive Tour System** *(V2 IMPROVEMENT)*

- **Advanced Analytics Tracking**: Complete tour interaction monitoring
- **Mobile Optimization**: Step 4 positioned closer to work experience content
- **Pause/Resume Tracking**: Monitors all user interactions with tour controls
- **Dismissal Analytics**: Tracks when users close the tour invitation
- **Restart Functionality**: "Do it again" button with separate tracking
- **Professional Positioning**: Smart scrolling and content alignment
- **4-Second Delay**: Optimized popup timing for better user experience

### 📊 **Advanced Analytics Dashboard** *(V2 ENHANCEMENT)*

- **Daily Analytics Graphs**: New "Graph" section with date-specific insights
- **Hourly Activity Breakdown**: Detailed timeline of user interactions
- **Enhanced Tour Analytics**: Views, clicks, completed, skipped tracking
- **Button Interaction Analysis**: Visual progress bars for all button clicks
- **Session Details**: Message counts and duration tracking
- **Geographic Intelligence**: Enhanced visitor location insights
- **Activity Timeline**: Chronological event listing with comprehensive data

### 🎨 **Professional Dark Mobile Theme** *(V2 FEATURE)*

- **Consistent Dark UI**: All mobile interfaces use professional dark theme
- **Gradient Backgrounds**: Purple/blue gradients maintained across components
- **Enhanced Readability**: Light text on dark backgrounds for mobile viewing
- **Professional Shadows**: Depth and visual hierarchy preserved on mobile
- **Menu Styling**: Dark hamburger menu matching chatbot aesthetics
- **Calendar Integration**: Dark-themed calendar picker for meeting scheduling

### 📬 **Enhanced Contact System** *(V2 IMPROVEMENT)*

- **Phone Integration**: Added phone icon and contact number to footer
- **Improved Email Flow**: Better message and meeting request processing
- **Contact Intent Detection**: Natural language processing for contact requests
- **Form Validation**: Enhanced error handling and user feedback
- **Professional Templates**: Improved email formatting and delivery

### ⚡ **Performance Optimizations** *(V2 FOCUS)*

- **Instant UI Feedback**: User messages appear immediately with `flushSync`
- **Smart Loading Logic**: Reduced unnecessary loading states for quick actions
- **Optimized Geolocation**: Prevents duplicate API calls with caching
- **Bundle Optimization**: Modular architecture reduces initial load time
- **Memory Management**: Better session handling and cleanup

### 😂 **Improved Fun Facts** *(V2 CONTENT)*

- **Self-Deprecating Humor**: Replaced arrogant content with relatable developer jokes
- **Actually Funny**: Content that makes users smile instead of cringe
- **Relatable Scenarios**: Common developer experiences and coding fails
- **Humble Personality**: Shows human side with failures and quirks
- **Better User Connection**: Content people can relate to and enjoy

---

## 📊 V2 Current Projects

### Product Management

- **Expired Solutions**: AI-powered grocery automation platform (V2 enhanced analytics)
- **PM Happy Hour**: Community growth with AI-generated content campaigns
- **McGinnis Venture Competition**: Finalist presentation with live pitch video
- **Tutora AI**: EdTech automation platform with 35% outcome improvement
- **NFC Feature Prototype**: Motorola hackathon winner

### Engineering & Development

- **Portfolio V2**: This enhanced modular portfolio with advanced features
- **Netflix Clone with KNN**: ML model analyzing 10M+ reviews
- **Valohai AI Tutorial**: Reproducible ML pipeline guide
- **Android + DB + RESTful**: Distributed systems project
- **ML Playground**: Interactive machine learning simulation

---

## 🎯 V2 Skills & Expertise

### Product Management

- **Product Strategy**: Roadmap planning, GTM strategies, user research
- **AI/ML Integration**: Computer vision, GPT, LLM applications
- **Data Analysis**: A/B testing, analytics, performance metrics, conversion optimization
- **Stakeholder Management**: Cross-functional collaboration, presentations

### Technical Skills

- **Frontend**: React 18, Next.js 14, TypeScript, TailwindCSS
- **Backend**: Node.js, Python, Flask, API development
- **AI/ML**: OpenAI APIs, Computer Vision, Machine Learning, prompt engineering
- **Cloud Platforms**: Azure, Firebase, AWS, Vercel
- **Tools**: Figma, Git, Docker, JIRA, advanced analytics

### Business & Leadership

- **Startup Experience**: Founding, fundraising, team building
- **Consulting**: Enterprise solutions, strategic planning
- **Education**: Teaching, curriculum development, automation
- **Communication**: Public speaking, technical writing, presentation design

---

## 🔧 V2 Development Features

### Code Quality & Architecture

- **Modular Design**: Clean separation of concerns and reusable components
- **TypeScript Strict**: Enhanced type checking for better code quality
- **Custom Hooks**: Centralized state management and logic
- **ESLint**: Code linting with Next.js best practices
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for pre-commit checks
- **Monorepo**: Turbo for efficient workspace management

### Performance & UX

- **React 18 Features**: Concurrent rendering and Suspense optimization
- **Instant Feedback**: `flushSync` for immediate UI updates
- **Smart Loading**: Conditional loading states based on query complexity
- **Image Optimization**: Next.js Image component for optimal loading
- **Bundle Analysis**: Built-in performance monitoring
- **SEO**: Meta tags, structured data, and social media optimization

### Security & Reliability

- **Environment Variables**: Secure API key management
- **Input Validation**: Server-side validation for all forms
- **Email Validation**: Proper email format verification
- **Rate Limiting**: Protection against spam and abuse
- **Session Management**: Secure user session handling

### Analytics & Intelligence (V2)

- **Modular Analytics**: Separate components for different metric types
- **Firebase Integration**: Optimized real-time data collection and storage
- **AI-Powered Insights**: GPT-4 integration for smart analytics
- **Custom Tracking**: Detailed user interaction monitoring with tour analytics
- **Cost Optimization**: Firebase usage tracking and optimization
- **Conversion Funnels**: Complete user journey analysis with enhanced metrics

---

## 🚀 Deployment & Versioning (V2)

- **Hosting**: Deployed on Vercel with automatic deployments
- **Version Control**: Automatic versioning system (currently v1.0.227+)
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Monitoring**: Real-time analytics and performance tracking
- **Email Integration**: Reliable email delivery with Resend
- **AI Features**: Enhanced OpenAI integration for intelligent interactions
- **Mobile Optimization**: Consistent experience across all devices

---

## 🤝 Let's Connect

I'm always interested in connecting with fellow product managers, AI enthusiasts, and innovative thinkers. Whether you're looking to collaborate on a project, discuss AI/ML applications, or explore new opportunities, I'd love to hear from you!

### Get in Touch:

- **LinkedIn**: [Lawrence Hua](https://www.linkedin.com/in/lawrencehua)
- **Email**: Available through the contact form on my site
- **Phone**: +1 (561) 251-8138 *(NEW in V2)*
- **Portfolio**: [www.lawrencehua.com](https://www.lawrencehua.com)

### For Recruiters:

- **Resume**: Available for download on my portfolio
- **AI Analysis**: Share job descriptions with my V2 chatbot for detailed fit analysis
- **File Review**: Upload documents for comprehensive assessment
- **Direct Contact**: Use the enhanced AI assistant to send messages directly to Lawrence
- **Meeting Scheduling**: Request calls through the improved contact form

---

## 🎨 V2 Portfolio Design

This V2 portfolio features:

- **Professional Dark Mobile Theme**: Consistent dark experience across all mobile devices
- **Modular Architecture**: Clean, maintainable codebase with TypeScript
- **Enhanced Animations**: Smooth transitions and professional interactions
- **Performance Optimized**: Built with Next.js 14 for optimal loading speeds
- **Accessibility**: WCAG compliant with keyboard navigation support
- **SEO Optimized**: Meta tags, structured data, and performance metrics
- **Interactive Elements**: Enhanced hover effects, click-outside behavior, and engaging animations
- **AI Integration**: Multiple AI-powered features with improved UX
- **Advanced Analytics**: Comprehensive visitor tracking with daily graph insights
- **Mobile-First Design**: Responsive design optimized for touch interactions

---

## 👤 About Me

<p align="center">
  <img src="portfolio/public/profile.jpg" alt="Lawrence Hua" width="160" style="border-radius: 50%; margin-bottom: 1rem;" />
</p>

**Lawrence W. Hua**  
AI Product Manager | Builder | Innovator

I'm passionate about transforming ideas into impactful digital solutions. My journey spans founding startups, leading product teams, and building AI-powered platforms that solve real-world problems. I thrive at the intersection of technology, business, and design—always seeking new challenges and opportunities to grow.

- **Founder & CEO** of Expired Solutions (AI for grocery automation)
- **Product Manager** at PM Happy Hour & PanPalz
- **Technical Lead** at Kearney (enterprise LLM)
- **Master's, Information Systems Management** (Carnegie Mellon University)
- **Public Speaker** and competition finalist

Let's connect and build something amazing together!

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. V2 includes improved architecture for easier contributions.

---

*Built with ❤️ using Next.js 14, TypeScript, TailwindCSS, and Advanced AI Integration*

**Portfolio V2** - Featuring modular architecture, enhanced mobile experience, and professional dark theme
# Version 2.0 - Complete redesign with modular chatbot and enhanced UX
