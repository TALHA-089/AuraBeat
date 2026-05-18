import type { Metadata } from "next";
import { Inter } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Aurabeat | AI Music Studio",
  description: "Create professional AI-generated music and speech in seconds. A comprehensive suite for musicians and creators.",
  keywords: ["AI Music", "Music Generation", "Text to Speech", "AI Studio", "Aurabeat"],
  authors: [{ name: "Aurabeat Team" }],
  openGraph: {
    title: "Aurabeat | AI Music Studio",
    description: "Create professional AI-generated music and speech in seconds.",
    url: "https://aurabeat.com",
    siteName: "Aurabeat",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Aurabeat | AI Music Studio",
    description: "Create professional AI-generated music and speech in seconds.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased bg-[#0D0D1A] text-white`}>
        <NextTopLoader color="#7C3AED" showSpinner={false} />
        {children}
      </body>
    </html>
  );
}
