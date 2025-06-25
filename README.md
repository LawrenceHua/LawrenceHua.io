# Lawrence W. Hua - Personal Portfolio

**AI Product Manager | Transforming Ideas into Impactful Digital Solutions**

🌐 **Live Site**: [www.lawrencehua.com](https://www.lawrencehua.com)

---

## 📁 Project Structure

```
LawrenceHua.io/
├── portfolio/                          # Main Next.js portfolio application
│   ├── src/
│   │   ├── app/                        # Next.js App Router
│   │   │   ├── analytics/              # Analytics dashboard with AI assistant
│   │   │   ├── api/                    # API routes
│   │   │   │   ├── analytics-assistant/ # AI data analyst endpoint
│   │   │   │   ├── auth/               # Authentication APIs
│   │   │   │   ├── chatbot/            # Main chatbot API with GPT-4
│   │   │   │   ├── chatbot-analytics/  # Chatbot metrics API
│   │   │   │   ├── contact/            # Contact form handler
│   │   │   │   ├── geolocation/        # Location tracking
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
│   │   │   └── page.tsx                # Homepage component
│   │   ├── components/                 # Reusable React components
│   │   │   ├── analytics/              # Analytics-specific components
│   │   │   │   └── AnalyticsAssistant.tsx # AI data analyst chatbot
│   │   │   ├── providers/              # Context providers
│   │   │   │   ├── SmoothScrollProvider.tsx
│   │   │   │   └── ThemeProvider.tsx
│   │   │   ├── sections/               # Page sections
│   │   │   │   ├── AboutSection.tsx
│   │   │   │   ├── ContactSection.tsx
│   │   │   │   ├── HeroSection.tsx
│   │   │   │   ├── ProjectsSection.tsx
│   │   │   │   ├── SkillsSection.tsx
│   │   │   │   ├── TestimonialsSection.tsx
│   │   │   │   └── TimelineSection.tsx
│   │   │   ├── Chatbot.tsx             # Main AI chatbot component
│   │   │   ├── FloatingChatbot.tsx     # Popup chatbot trigger
│   │   │   ├── ModernNavigation.tsx    # Navigation component
│   │   │   ├── Navigation.tsx          # Alternative nav
│   │   │   └── PMTour.tsx              # Product Manager guided tour
│   │   ├── types/                      # TypeScript type definitions
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
- **React 18** - Component-based UI library
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
- **React DatePicker** - Date selection component
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
- **Custom Analytics Dashboard** - Real-time visitor tracking
- **Firebase Analytics** - User interaction monitoring
- **Chatbot Analytics** - Conversation and engagement metrics
- **AI Analytics Assistant** - Natural language data querying
- **Geolocation Tracking** - Visitor location insights

---

## 🚀 Create Your Own Portfolio

Want a beautiful, AI-powered portfolio like this? Follow these steps to create your own:

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
   - Update the chatbot prompts in `portfolio/src/components/Chatbot.tsx`.
   - Change your profile picture: replace `profile.jpg` in `portfolio/public/`.
5. **Set up environment variables**
   - Copy `.env.example` to `.env.local` and fill in your API keys:
     ```bash
     # Required for AI features
     OPENAI_API_KEY=your_openai_api_key
     
     # Required for email functionality
     RESEND_API_KEY=your_resend_api_key
     
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
   - Deploy and enjoy your new portfolio!

---

## 🌟 Portfolio Features

### 🤖 AI-Powered Analytics Assistant *(NEW)*

- **Natural Language Queries**: Ask questions about your data in plain English
- **Real-Time Analysis**: Live Firebase data processing with GPT-4 intelligence
- **Smart Insights**: Conversion rates, traffic patterns, and engagement metrics
- **Quick Actions**: Pre-built buttons for instant analytics reports
- **Time Range Support**: Analyze data across different periods
- **Minimizable Interface**: Non-intrusive floating chatbot design

#### Example Analytics Queries:
- *"What's my chatbot conversion rate this week?"*
- *"Show me peak activity hours"*
- *"Which buttons are most popular?"*
- *"How does engagement compare to last month?"*
- *"What should I optimize for better conversions?"*

### 🎯 Interactive Product Manager Tour

- **1-Minute Guided Experience**: Take users through Lawrence's PM journey
- **6 Strategic Steps**: PM experience, data-driven results, leadership, AI innovation, customer focus, and execution
- **Mobile-Responsive Design**: Centered popups on mobile, side navigation on desktop
- **Dynamic Text Highlighting**: Character-by-character text animation with strategic pauses
- **Smart Scrolling**: Automatically positions content for optimal viewing
- **Professional CTAs**: Seamless transition to contact forms at tour completion

### 🕒 Interactive Experience Timeline

- Dynamic career timeline with filtering by year and category
- Expandable experience cards with detailed achievements
- Mobile-responsive design with touch-friendly interactions
- Visual progression through education and work history

### 🤖 AI-Powered Chatbot Assistant

- **For Visitors**: Learn about my experience, skills, and projects
- **For Recruiters**:
  - Share job descriptions and files for analysis
  - **Direct Contact**: Get in touch with Lawrence through the chatbot
  - Real-time job fit analysis with detailed feedback
  - File attachment support for comprehensive reviews
- **Smart Contact System**: Recruiters can provide their information and send messages directly to Lawrence
- **Email Validation**: Ensures valid contact information for follow-up
- **Comprehensive Analytics**: Track every interaction, conversion, and engagement metric

### 📊 Advanced Analytics Dashboard

- **Real-Time Visitor Tracking**: Live user behavior monitoring
- **Chatbot Performance**: Detailed conversation and conversion analytics
- **Geographic Insights**: Visitor location and country breakdown
- **Engagement Metrics**: Session duration, scroll depth, and interaction tracking
- **Firebase Usage Monitoring**: Cost tracking and optimization insights
- **Tour Analytics**: Product Manager tour completion and abandonment rates
- **Mobile/Desktop Breakdown**: Device-specific engagement patterns

### 🎨 Project Showcase

- **Product Related**: AI platforms, social apps, venture competitions
- **Engineering**: ML models, distributed systems, tutorials
- **Fun Projects**: Research, presentations, interactive simulations
- Filterable gallery with detailed project information

### 🛠️ Skills & Expertise

- Interactive skills visualization with proficiency levels
- Endorsements and experience tracking
- Highlighted achievements for each skill area

### 📬 Contact Forms

- **General Contact**: For general inquiries and collaboration
- **Meeting Requests**: Schedule calls with Lawrence
- **Recruiter Contact**: Direct messaging through AI assistant
- **Email Integration**: Powered by Resend for reliable delivery

---

## 📊 Current Projects

### Product Management

- **Expired Solutions**: AI-powered grocery automation platform
- **PanPalz**: Nonprofit social media platform
- **McGinnis Venture Competition**: Finalist presentation
- **BBW Demo**: Enterprise LLM decision-support tool
- **Tutora AI**: Automation platform for education
- **NFC Feature Prototype**: Motorola hackathon winner

### Engineering & Development

- **Netflix Clone with KNN**: ML model analyzing 10M+ reviews
- **Valohai AI Tutorial**: Reproducible ML pipeline guide
- **Android + DB + RESTful**: Distributed systems project
- **ML Playground**: Interactive machine learning simulation
- **Portfolio Website**: This responsive portfolio site

---

## 🎯 Skills & Expertise

### Product Management

- **Product Strategy**: Roadmap planning, GTM strategies, user research
- **AI/ML Integration**: Computer vision, GPT, LLM applications
- **Data Analysis**: A/B testing, analytics, performance metrics
- **Stakeholder Management**: Cross-functional collaboration, presentations

### Technical Skills

- **Programming**: Python, JavaScript, TypeScript, SQL
- **Frameworks**: Next.js, React, Flask, Node.js
- **AI/ML**: OpenAI APIs, Computer Vision, Machine Learning
- **Cloud Platforms**: Azure, Firebase, AWS
- **Tools**: Figma, Git, Docker, JIRA

### Business & Leadership

- **Startup Experience**: Founding, fundraising, team building
- **Consulting**: Enterprise solutions, strategic planning
- **Education**: Teaching, curriculum development, automation
- **Communication**: Public speaking, technical writing

---

## 📈 Career Journey

### 2025 - Present

- **Product Manager** at PM Happy Hour
- **Produce Assistant Team Leader** at Giant Eagle

### 2024

- **Founder & CEO** at Expired Solutions
- **Product Manager** at PanPalz
- **Student Consultant, Technical Lead** at Kearney
- **Master's Degree** from Carnegie Mellon University

### 2023

- **System Administrator** at University of Florida
- **Bachelor's Degree** from University of Florida

---

## 🔧 Development Features

### Code Quality

- **TypeScript**: Strict type checking for better code quality
- **ESLint**: Code linting with Next.js best practices
- **Prettier**: Consistent code formatting
- **Husky**: Git hooks for pre-commit checks
- **Monorepo**: Turbo for efficient workspace management

### Performance

- **Next.js Optimization**: Automatic code splitting and optimization
- **Image Optimization**: Next.js Image component for optimal loading
- **Bundle Analysis**: Built-in performance monitoring
- **SEO**: Meta tags, structured data, and social media optimization

### Security

- **Environment Variables**: Secure API key management
- **Input Validation**: Server-side validation for all forms
- **Email Validation**: Proper email format verification
- **Rate Limiting**: Protection against spam and abuse

### Analytics & Intelligence

- **Firebase Integration**: Real-time data collection and storage
- **AI-Powered Insights**: GPT-4 integration for smart analytics
- **Custom Tracking**: Detailed user interaction monitoring
- **Cost Optimization**: Firebase usage tracking and optimization
- **Conversion Funnels**: Complete user journey analysis

---

## 🚀 Deployment & Versioning

- **Hosting**: Deployed on Vercel with automatic deployments
- **Version Control**: Automatic versioning system (currently v1.0.200+)
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Monitoring**: Real-time analytics and performance tracking
- **Email Integration**: Reliable email delivery with Resend
- **AI Features**: OpenAI integration for intelligent interactions

---

## 🤝 Let's Connect

I'm always interested in connecting with fellow product managers, AI enthusiasts, and innovative thinkers. Whether you're looking to collaborate on a project, discuss AI/ML applications, or explore new opportunities, I'd love to hear from you!

### Get in Touch:

- **LinkedIn**: [Lawrence Hua](https://www.linkedin.com/in/lawrencehua)
- **Email**: Available through the contact form on my site
- **Portfolio**: [www.lawrencehua.com](https://www.lawrencehua.com)

### For Recruiters:

- **Resume**: Available for download on my portfolio
- **AI Analysis**: Share job descriptions with my chatbot for detailed fit analysis
- **File Review**: Upload documents for comprehensive assessment
- **Direct Contact**: Use the AI assistant to send messages directly to Lawrence
- **Meeting Scheduling**: Request calls through the contact form

---

## 🎨 Portfolio Design

This portfolio features:

- **Dark Mode**: Elegant dark theme optimized for readability
- **Responsive Design**: Mobile-first approach with smooth animations
- **Performance Optimized**: Built with Next.js for optimal loading speeds
- **Accessibility**: WCAG compliant with keyboard navigation support
- **SEO Optimized**: Meta tags, structured data, and performance metrics
- **Interactive Elements**: Hover effects, smooth transitions, and engaging animations
- **AI Integration**: Multiple AI-powered features for enhanced user experience
- **Analytics Dashboard**: Comprehensive visitor and engagement tracking

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

Contributions are welcome! Please feel free to submit a Pull Request.

---

*Built with ❤️ using Next.js, TypeScript, and AI*
# Auto-versioning test - Wed Jun 25 01:38:06 EDT 2025
