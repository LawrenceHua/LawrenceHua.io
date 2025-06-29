import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "../components/providers/ThemeProvider";
import { SmoothScrollProvider } from "../components/providers/SmoothScrollProvider";
import VisitorTracker from "../components/VisitorTracker";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.lawrencehua.com"),
  title: "Lawrence Hua - AI Product Manager",
  description:
    "Portfolio website showcasing my work in AI product management and software development",
  keywords: [
    "Lawrence Hua",
    "AI Product Manager",
    "Software Development",
    "Portfolio",
    "Product Management",
  ],
  authors: [{ name: "Lawrence Hua" }],
  creator: "Lawrence Hua",
  publisher: "Lawrence Hua",
  openGraph: {
    title: "Lawrence Hua - AI Product Manager",
    description:
      "Learn more about Lawrence - AI Product Manager and Software Developer",
    url: "https://lawrencehua.com",
    siteName: "Lawrence Hua Portfolio",
    images: [
      {
        url: "https://www.lawrencehua.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Lawrence Hua - AI Product Manager",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lawrence Hua - AI Product Manager",
    description:
      "Learn more about Lawrence - AI Product Manager and Software Developer",
    images: ["https://www.lawrencehua.com/og-image.png"],
    creator: "@lawrencehua", // Add your Twitter handle if you have one
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // Add your Google Search Console verification code
  },
  alternates: {
    canonical: "https://lawrencehua.com",
  },
  icons: {
    icon: [
      {
        url: "/favicon.png",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/apple-touch-icon.png",
        type: "image/png",
      },
    ],
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
        />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" type="image/png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <SmoothScrollProvider>
            <VisitorTracker />
            {children}
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
