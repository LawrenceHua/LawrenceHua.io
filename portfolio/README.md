# 🚀 Lawrence Hua's AI Product Manager Portfolio

A sophisticated, modern portfolio website showcasing Lawrence's experience as an AI Product Manager, featuring advanced AI integrations, delightful easter eggs, beautiful animations, and comprehensive analytics. Built with cutting-edge technologies and designed to impress recruiters and potential collaborators.

## ✨ Key Features

### 🤖 **Enhanced AI Chatbot with Natural Language Processing**

- **OpenAI GPT-4 Integration**: Advanced conversational AI with enhanced natural language understanding
- **Smart Contact Intent Detection**: Automatically recognizes and processes contact requests from natural conversation
- **Multi-turn Conversation Tracking**: Intelligently combines information across multiple messages
- **Contextual Information Extraction**: Naturally extracts names, emails, and messages from conversational text
- **File Upload Support**: Upload resumes, documents, and images for intelligent analysis
- **Easter Egg Integration**: Special "girlfriend mode" with unique response patterns
- **Session Management**: Persistent conversations with smart state management

### 🐱 **Delightful Easter Eggs & Interactions**

- **Cat Profile Picture Easter Egg**: Click Lawrence's profile picture to reveal adorable animated cats
  - **Tuxedo Cat**: Black & white cat with green eyes appears on the left
  - **Grey Tabby Cat**: Striped grey cat with blue eyes appears on the right
  - **Smooth Animations**: Gentle rotation loops and bounce-in effects
  - **Responsive Design**: Perfectly scaled for all device sizes
- **Hidden Features**: Discover more interactive elements throughout the site

### 📱 **Premium Mobile-Responsive Design**

- **Mobile-First Architecture**: Optimized for all devices from mobile to 4K displays
- **Touch-Friendly Interface**: 44px+ tap targets and smooth touch interactions
- **Responsive Navigation**: Hamburger menu with beautiful animations
- **Adaptive Layouts**: All sections automatically adjust for optimal viewing
- **Performance Optimized**: Fast loading and smooth interactions on all devices

### 🎨 **Premium User Experience**

- **Framer Motion Animations**: Smooth, professional animations throughout
- **Lenis Smooth Scrolling**: Buttery-smooth page scrolling experience
- **Dynamic Text Gallery**: Rotating value propositions with animated backgrounds
- **Interactive Skills Cloud**: Organic bubble layout with smart tooltip positioning
- **Animated Timeline**: Professional career journey with scrollable work experience gallery
- **Strategic Text Formatting**: Color-coded highlights and enhanced readability

### 📊 **Advanced Analytics & Geolocation**

- **Visitor Analytics**: Real-time tracking of page views, unique visitors, and session duration
- **Chatbot Metrics**: Comprehensive chat session analytics and conversation insights
- **Geographic Intelligence**: Accurate visitor location tracking with IP detection
- **Recruiter Detection**: Smart identification of potential recruiters based on interaction patterns
- **Performance Metrics**: Site performance and engagement analytics
- **Fixed Dynamic Routing**: Proper Next.js App Router compliance for production deployments

### 💼 **Professional Contact System**

- **Multi-Channel Contact**: Direct email, meeting scheduling, and instant messaging
- **Enhanced Email Integration**: Professional HTML email templates with Resend
- **Smart Form Processing**: Automatic contact information extraction from conversations
- **Calendar Scheduling**: Integrated meeting booking with time zone support
- **Form Validation**: Real-time validation with beautiful error handling
- **Social Media Integration**: LinkedIn, GitHub, and Facebook connectivity

### 🔧 **Developer Features & Infrastructure**

- **Auto-Versioning System**: Automatic version incrementation on every push to main
- **Live Version API**: Real-time version and timestamp tracking
- **GitHub Actions Integration**: Automated workflows for version management
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
- **Custom SVG Assets**: Hand-crafted cat illustrations and icons

### **AI & Backend Services**

- **OpenAI API**: GPT-4 integration for intelligent conversations
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
- **GitHub Actions**: Automated CI/CD and version management

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (Latest LTS recommended)
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/LawrenceHua/LawrenceHua.io.git
   cd LawrenceHua.io/portfolio
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
│   ├── app/                    # Next.js App Router pages
│   │   ├── api/               # API routes
│   │   │   ├── chatbot/       # Enhanced AI chatbot endpoint
│   │   │   ├── contact/       # Contact form processing
│   │   │   ├── geolocation/   # Fixed dynamic routing
│   │   │   └── version/       # Live version tracking
│   │   ├── analytics/         # Private analytics dashboard
│   │   └── page.tsx           # Main portfolio page
│   ├── components/            # React components
│   │   ├── sections/          # Page sections
│   │   │   ├── HeroSection.tsx      # Profile + cat easter egg
│   │   │   ├── AboutSection.tsx     # Enhanced with highlights
│   │   │   ├── ContactSection.tsx   # Smart contact processing
│   │   │   └── ...
│   │   ├── providers/         # Context providers
│   │   ├── Chatbot.tsx        # Enhanced AI chatbot
│   │   └── Navigation.tsx     # Responsive navigation
│   └── types/                 # TypeScript definitions
├── public/                    # Static assets
│   ├── tuxedo-cat.svg        # Custom cat illustration
│   ├── grey-cat.svg          # Custom cat illustration
│   └── ...
├── scripts/                   # Utility scripts
│   ├── version.js            # Version management
│   └── test-version.js       # Version testing
├── .github/workflows/         # GitHub Actions
│   └── version-increment.yml  # Auto-versioning workflow
└── package.json              # Dependencies and scripts
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint           # Run ESLint

# Version Management (Automatic on push to main)
npm run version        # Manual version increment
npm run test-version   # Preview next version

# Testing
npm run test           # Run test suite
npm run test:headless  # Run headless tests
```

## 🌐 API Endpoints

- **`/api/chatbot`** - Enhanced AI chatbot with natural language processing
- **`/api/contact`** - Contact form processing
- **`/api/meeting-request`** - Meeting scheduling
- **`/api/version`** - Live version and build information
- **`/api/geolocation`** - Fixed geographic intelligence (dynamic routing)
- **`/api/analytics/*`** - Analytics data endpoints (protected)

## 🎯 Easter Eggs & Hidden Features

### 🐱 **Cat Profile Picture Easter Egg**

- **How to activate**: Click on Lawrence's profile picture in the hero section
- **What happens**: Two adorable cats appear with smooth animations
- **Cats included**: Tuxedo cat (left) and grey tabby cat (right)
- **Responsive**: Works perfectly on all device sizes

### 🤖 **Chatbot Special Modes**

- **Girlfriend Mode**: Type "myley" to activate special conversation mode
- **Natural Language**: Try conversational contact requests like "tell lawrence i want to work with him"

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
4. **Automatic versioning** will increment version on each deployment

### Other Platforms

- **Netlify**: Configure build command as `npm run build`
- **Railway**: Direct deployment from GitHub
- **AWS/Google Cloud**: Use Docker or static site deployment

## 🔐 Security Features

- **Environment Variable Protection**: Secure API key management
- **Password-Protected Analytics**: Private dashboard access
- **Input Validation**: Comprehensive form and API validation
- **Dynamic Route Configuration**: Proper Next.js App Router compliance
- **Rate Limiting**: Built-in protection for API endpoints

## 📝 Version Management

The portfolio includes a sophisticated automatic versioning system:

- **GitHub Actions Integration**: Auto-increments version on every push to `main`
- **Live Version Display**: Real-time version tracking in footer
- **Timestamp Tracking**: EST timezone with git commit integration
- **API Access**: Version information available via `/api/version`
- **Current Version**: **1.0.40** (auto-incremented)

### How It Works

1. Push to `main` branch → GitHub Actions triggers
2. Version increments (1.0.40 → 1.0.41)
3. Timestamp updates to current time
4. Changes committed back to repository
5. Live site reflects new version immediately

## 🧪 Testing

The portfolio includes comprehensive testing for:

- **Chatbot Functionality**: Multi-turn conversations and contact processing
- **Contact Forms**: Email sending and validation
- **API Endpoints**: All backend services
- **UI Interactions**: Easter eggs and animations

Run tests with:

```bash
npm run test           # Full test suite
npm run test:headless  # Automated testing
```

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

_Built with ❤️ using Next.js 14, TypeScript, TailwindCSS, Framer Motion, React 18, OpenAI API, Resend, Firebase, Recharts, Lenis Smooth Scroll, React DatePicker, and custom SVG illustrations._

**Last updated**: Auto-generated EST • Version auto-incremented via GitHub Actions

## 🎉 Recent Updates

- **🐱 Cat Easter Egg**: Added adorable animated cats to profile picture
- **🤖 Enhanced Chatbot**: Improved natural language processing for contact requests
- **🔧 Fixed Geolocation**: Resolved Next.js dynamic server usage errors
- **📈 Auto-Versioning**: Implemented GitHub Actions for automatic version management
- **🎨 UI Enhancements**: Strategic text formatting and improved animations
- **🔄 Branch Management**: Streamlined to main branch for all development
