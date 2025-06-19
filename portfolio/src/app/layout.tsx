import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        {children}
        <footer className="w-full text-center text-xs text-gray-400 py-6 border-t border-gray-800 bg-black/70 mt-12">
          © {new Date().getFullYear()} Lawrence Hua. All Rights Reserved. Last
          updated:{" "}
          {new Date().toLocaleString("en-US", {
            timeZone: "America/New_York",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })}{" "}
          EST. V1.0
        </footer>
        <div className="w-full text-center text-[10px] text-gray-500 pb-2">
          Dev @{" "}
          {new Date().toLocaleString("en-US", {
            timeZone: "America/New_York",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })}{" "}
          EST
        </div>
      </body>
    </html>
  );
}
