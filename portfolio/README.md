# Lawrence Hua's Portfolio

A modern, responsive portfolio website showcasing Lawrence's experience, skills, and projects, complete with a private analytics dashboard.

## Features

- **AI Chatbot**: Interactive chatbot powered by OpenAI GPT-3.5-turbo
- **Mobile Responsive**: Optimized for all device sizes
- **Modern Design**: Clean, professional interface
- **Interactive Timeline**: Career and education timeline
- **Skills Showcase**: Categorized skills with proficiency levels
- **Project Gallery**: Showcase of various projects
- **Private Analytics Dashboard**:
  - **Visitor Tracking**: Monitors total page views and unique visitors.
  - **Chatbot Analytics**: Tracks total chat sessions, messages, and average messages per session.
  - **Geolocation**: Shows top countries and cities of visitors.
  - **Potential Recruiter Identification**: Flags potential recruiters based on site interactions, time spent, and chatbot keywords, and provides a breakdown of these KPIs.

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Environment Variables

Create a `.env.local` file in the root directory with:

```env
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_SECRET_PASS=your_secret_password_here
```

**Note**:

- The chatbot will work without the `OPENAI_API_KEY` using fallback responses, but for full AI functionality, add your OpenAI API key.
- The `NEXT_PUBLIC_SECRET_PASS` is required to access the private analytics dashboard.

### Development

```bash
npm run dev
```

The site will be available at `http://localhost:3000`

### Build

```bash
npm run build
npm start
```

## Features

### AI Chatbot

- Click "Talk to AI" button to open the chatbot
- Ask questions about Lawrence's experience, skills, education, or projects
- Works offline with fallback responses
- Full AI functionality with OpenAI API key

### Mobile Responsive

- Optimized for mobile devices
- Touch-friendly interface
- Responsive education cards
- Mobile-optimized chatbot

### Interactive Elements

- Skills filtering by category
- Timeline navigation by year
- Project carousel
- Contact form with meeting scheduling

## Technologies Used

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- OpenAI API
- Firebase (for analytics data storage)
- React Icons
- React DatePicker

## Deployment

The site is configured for deployment on Vercel with the following settings:

- Build Command: `npm run build`
- Install Command: `npm install`
- Framework: Next.js
