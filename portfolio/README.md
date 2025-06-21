# 🚀 Lawrence Hua's AI Product Manager Portfolio

A sophisticated, modern portfolio website showcasing Lawrence's experience as an AI Product Manager, featuring advanced AI integrations, beautiful animations, and comprehensive analytics. Built with cutting-edge technologies and designed to impress recruiters and potential collaborators.

## ✨ Key Features

### 🤖 **Intelligent AI Chatbot**

- **OpenAI GPT-3.5-turbo Integration**: Advanced conversational AI that answers questions about Lawrence's experience, skills, and projects
- **Smart Floating Interface**: Beautiful slide-in animations with intelligent popup triggers
- **Context-Aware Responses**: Understands recruiting contexts and provides relevant information
- **File Upload Support**: Upload resumes, documents, and images for analysis
- **Session Management**: Persistent conversations with smart state management

### 📱 **Fully Mobile-Responsive Design**

- **Mobile-First Architecture**: Optimized for all devices from mobile to 4K displays
- **Touch-Friendly Interface**: 44px+ tap targets and smooth touch interactions
- **Responsive Navigation**: Hamburger menu with beautiful animations
- **Adaptive Layouts**: All sections automatically adjust for optimal viewing

### 🎨 **Premium User Experience**

- **Framer Motion Animations**: Smooth, professional animations throughout
- **Lenis Smooth Scrolling**: Buttery-smooth page scrolling experience
- **Dark/Light Mode Toggle**: Seamless theme switching with persistent preferences
- **Interactive Skills Cloud**: Organic bubble layout with hover effects and mouse-tracking tooltips
- **Animated Timeline**: Professional career journey with scrollable work experience gallery

### 📊 **Advanced Analytics Dashboard**

- **Visitor Analytics**: Real-time tracking of page views, unique visitors, and session duration
- **Chatbot Metrics**: Comprehensive chat session analytics and conversation insights
- **Geographic Intelligence**: Visitor location tracking and regional analysis
- **Recruiter Detection**: Smart identification of potential recruiters based on interaction patterns
- **Performance Metrics**: Site performance and engagement analytics

### 💼 **Professional Contact System**

- **Multi-Channel Contact**: Direct email, meeting scheduling, and instant messaging
- **Resend Email Integration**: Professional HTML email templates with automatic responses
- **Calendar Scheduling**: Integrated meeting booking with time zone support
- **Form Validation**: Real-time validation with beautiful error handling
- **Social Media Integration**: LinkedIn, GitHub, and Facebook connectivity

### 🔧 **Developer Features**

- **Auto-Versioning System**: Automatic version incrementation with git integration
- **Live Version API**: Real-time version and timestamp tracking
- **TypeScript Throughout**: Full type safety and IntelliSense support
- **Modern Build Pipeline**: Next.js 14 with optimized production builds
- **Environment Management**: Secure API key and configuration management

## 🛠️ Tech Stack

### **Core Framework**

- **Next.js 14**: Latest React framework with App Router and Server Components
- **React 18**: Modern React with Suspense, Concurrent Features, and Hooks
- **TypeScript**: Full type safety and enhanced developer experience

### **Styling & Animation**

- **TailwindCSS**: Utility-first CSS framework with custom configuration
- **Framer Motion**: Professional animations and transitions
- **Lenis**: Smooth scrolling library for premium feel

### **AI & Backend Services**

- **OpenAI API**: GPT-3.5-turbo integration for intelligent conversations
- **Resend**: Modern email delivery service with HTML templates
- **Firebase**: Real-time database for analytics and visitor tracking

### **UI Components & Libraries**

- **React Icons**: Comprehensive icon library (React Icons, Lucide React)
- **React DatePicker**: Advanced date selection for meeting scheduling
- **Recharts**: Beautiful, responsive charts for analytics dashboard

### **Development Tools**

- **ESLint**: Code quality and consistency enforcement
- **PostCSS**: Advanced CSS processing and optimization
- **Autoprefixer**: Automatic CSS vendor prefixing

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (Latest LTS recommended)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/lawrence-portfolio.git
   cd lawrence-portfolio/portfolio
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:

```env
   # Required for AI Chatbot
OPENAI_API_KEY=your_openai_api_key_here

   # Required for Email System
   RESEND_API_KEY=your_resend_api_key_here
   EMAIL_NAME=your_email@domain.com

   # Required for Analytics Dashboard
   NEXT_PUBLIC_SECRET_PASS=your_secure_password_here

   # Optional: Firebase Configuration
   FIREBASE_PROJECT_ID=your_firebase_project_id
   FIREBASE_CLIENT_EMAIL=your_firebase_client_email
   FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

4. **Start development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start

# Or deploy to Vercel (recommended)
vercel --prod
```

## 📁 Project Structure

```
portfolio/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── api/            # API routes (chatbot, contact, analytics)
│   │   ├── analytics/      # Private analytics dashboard
│   │   └── page.tsx        # Main portfolio page
│   ├── components/         # React components
│   │   ├── sections/       # Page sections (Hero, About, Skills, etc.)
│   │   ├── providers/      # Context providers (Theme, Smooth Scroll)
│   │   ├── Chatbot.tsx     # AI chatbot component
│   │   └── Navigation.tsx  # Navigation components
│   └── types/              # TypeScript type definitions
├── public/                 # Static assets (images, resume, logos)
├── scripts/                # Utility scripts (version management)
└── package.json           # Dependencies and scripts
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint           # Run ESLint

# Version Management
npm run version        # Auto-increment version number
npm run test-version   # Test version management system

# Testing
npm run test           # Run test suite
npm run test:headless  # Run headless tests
```

## 🌐 API Endpoints

- **`/api/chatbot`** - AI chatbot conversation handling
- **`/api/resend-contact`** - Contact form and email processing
- **`/api/version`** - Live version and build information
- **`/api/analytics/*`** - Analytics data endpoints (protected)

## 📊 Analytics Features

Access the analytics dashboard at `/analytics` with the configured password to view:

- **Visitor Metrics**: Page views, unique visitors, session duration
- **Geographic Data**: Visitor locations and regional trends
- **Chatbot Analytics**: Conversation metrics and popular topics
- **Recruiter Insights**: Potential recruiter identification and engagement patterns
- **Performance Data**: Site performance and optimization metrics

## 🚢 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

### Other Platforms

- **Netlify**: Configure build command as `npm run build`
- **Railway**: Direct deployment from GitHub
- **AWS/Google Cloud**: Use Docker or static site deployment

## 🔐 Security Features

- **Environment Variable Protection**: Secure API key management
- **Password-Protected Analytics**: Private dashboard access
- **Input Validation**: Comprehensive form and API validation
- **Rate Limiting**: API endpoint protection (implement as needed)

## 📝 Version Management

The portfolio includes an automatic versioning system:

- **Current Version**: Auto-incremented on each deployment
- **Build Timestamps**: EST timezone with git integration
- **Live Tracking**: Real-time version display in footer
- **API Access**: Version information available via `/api/version`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact

**Lawrence W. Hua** - AI Product Manager

- **Portfolio**: [https://lawrencehua.com](https://lawrencehua.com)
- **LinkedIn**: [linkedin.com/in/lawrencehua](https://linkedin.com/in/lawrencehua)
- **Email**: lawrencehua2@gmail.com
- **GitHub**: [github.com/LawrenceHua](https://github.com/LawrenceHua)

---

_Built with ❤️ using Next.js 14, TypeScript, TailwindCSS, Framer Motion, React 18, OpenAI API, Resend, Firebase, Recharts, Lenis Smooth Scroll, and React DatePicker._

**Last updated**: Auto-generated EST • Version auto-incremented
