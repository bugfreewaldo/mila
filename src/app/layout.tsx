import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/mila/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mila-nicu.vercel.app"),
  title: {
    default: "MILA | AI-Powered Neonatal Care Assistant",
    template: "%s | MILA",
  },
  description:
    "MILA (Medical Infant Longitudinal Analytics) is an AI clinical decision support system for NICU physicians. Evidence-based treatment recommendations, real-time patient monitoring, transfusion guidelines, and intelligent care protocols for neonatal intensive care.",
  keywords: [
    "NICU",
    "neonatal care",
    "AI medical assistant",
    "clinical decision support",
    "neonatology",
    "premature infant care",
    "NICU software",
    "medical AI",
    "healthcare technology",
    "evidence-based medicine",
    "transfusion guidelines",
    "sepsis protocol",
    "jaundice management",
    "newborn care",
    "intensive care",
    "pediatric healthcare",
  ],
  authors: [{ name: "MILA Team" }],
  creator: "MILA",
  publisher: "MILA",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: "es_ES",
    title: "MILA | AI-Powered Neonatal Care Assistant",
    description:
      "Transform NICU care with AI-powered clinical decision support. Evidence-based recommendations, intelligent monitoring, and treatment protocols for neonatal physicians.",
    siteName: "MILA - Medical Infant Longitudinal Analytics",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "MILA - AI Clinical Assistant for Neonatal Care",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MILA | AI-Powered Neonatal Care Assistant",
    description:
      "Transform NICU care with AI-powered clinical decision support. Evidence-based recommendations for neonatal physicians.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  category: "Medical Software",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
