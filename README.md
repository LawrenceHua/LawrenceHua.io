# LawrenceHua.io - Personal Portfolio
checkout my website here to see what it looks like: www.lawrencehua.com

A modern, responsive portfolio website built with Next.js, featuring an AI-powered chatbot, interactive timeline, and dynamic project showcase.

## 🌟 Features

- **Interactive Timeline**: Dynamic career timeline with filtering by year and category
- **AI-Powered Chatbot**: Custom chatbot for job fit analysis and recruiter interactions
- **Project Showcase**: Filterable project gallery with categories
- **Skills Visualization**: Interactive skills display with proficiency levels
- **Responsive Design**: Mobile-first approach with smooth animations
- **Dark Mode**: Elegant dark theme optimized for readability
- **Contact Form**: Integrated contact form with meeting scheduler
- **Performance Optimized**: Built with Next.js for optimal loading speeds

## 🛠️ Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **UI Components**: shadcn/ui
- **Animations**: Framer Motion
- **AI Integration**: OpenAI GPT
- **Form Handling**: React Hook Form
- **Date Picker**: React DatePicker
- **Icons**: React Icons
- **Development Tools**: ESLint, Prettier

## 📁 Project Structure

```
LawrenceHua.io/
├── apps/
│   └── web/                 # Main web application
├── packages/
│   ├── auth/               # Authentication logic
│   ├── comments/           # Comments system
│   ├── db/                 # Database configuration
│   ├── emails/            # Email templates
│   ├── ui/                # Shared UI components
│   └── validators/        # Form validators
├── portfolio/             # Portfolio specific code
│   ├── public/           # Static assets
│   └── src/
│       ├── app/          # Next.js app router
│       ├── components/   # React components
│       └── styles/       # Global styles
└── tooling/              # Development tools
```

## 🚀 Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/LawrenceHua/LawrenceHua.io.git
   cd LawrenceHua.io
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:

   - `OPENAI_API_KEY` - For AI chatbot functionality
   - `DATABASE_URL` - Your database connection string
   - `NEXT_PUBLIC_APP_URL` - Your application URL

4. **Run the development server**

   ```bash
   pnpm dev
   ```

5. **Build for production**
   ```bash
   pnpm build
   ```

## 🎨 Customization

### Adding Projects

Add your projects in `portfolio/src/app/page.tsx` under the `projectSectionsData` object:

```typescript
{
  title: "Your Project",
  description: "Project description",
  image: "/path/to/image.jpg",
  tags: ["Tag1", "Tag2"],
  link: "https://project-link.com",
  linkText: "View Project",
  linkIcon: "external" as const,
}
```

### Updating Timeline

Modify the `timelineData` array in `portfolio/src/app/page.tsx` to add your experiences:

```typescript
{
  year: "2024",
  title: "Your Position",
  org: "Company Name",
  date: "Jan 2024 - Present",
  logo: "/path/to/logo.jpg",
  category: "category",
  bullets: ["Achievement 1", "Achievement 2"]
}
```

### Customizing Skills

Update the `skillsData` object to reflect your skills and expertise levels:

```typescript
{
  name: "Skill Name",
  level: "expert",
  endorsements: 10,
  experiences: 5,
  highlight: "Key achievement with this skill"
}
```

## 🤖 AI Chatbot Configuration

The chatbot is configured to:

1. Analyze job descriptions
2. Provide 10-star ratings for job fit
3. Offer detailed feedback on matching strengths
4. Suggest areas for growth
5. Give honest assessments based on experience

To customize the chatbot:

1. Update the system prompts in `portfolio/src/components/Chatbot.tsx`
2. Modify the rating system logic
3. Adjust the response format structure

## 📱 Responsive Design

The portfolio is fully responsive with:

- Mobile-first approach
- Breakpoint-specific layouts
- Touch-friendly interactions
- Optimized images
- Adaptive typography

## 🔍 SEO Optimization

Implemented SEO best practices:

- Meta tags
- Semantic HTML
- Structured data
- Optimized images
- Performance optimization

## 🚀 Deployment

The site is deployed on Vercel:

1. Connect your GitHub repository
2. Configure environment variables
3. Set up custom domain if needed
4. Enable automatic deployments

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Framer Motion](https://www.framer.com/motion/) for smooth animations
- [TailwindCSS](https://tailwindcss.com/) for styling
- [Next.js](https://nextjs.org/) for the framework
- All other open-source contributors

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
