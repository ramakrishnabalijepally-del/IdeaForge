import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/context/AuthContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "IdeaForge – AI-Powered Startup & Manufacturing Idea Explorer",
    template: "%s | IdeaForge",
  },
  description:
    "Discover, generate, and evaluate validated startup and manufacturing business ideas powered by Gemini AI. Browse curated ideas or generate your own with our AI Idea Generator.",
  keywords: ["startup ideas", "business ideas", "manufacturing ideas", "AI idea generator", "entrepreneurship"],
  openGraph: {
    title: "IdeaForge – AI-Powered Startup & Manufacturing Idea Explorer",
    description: "Discover and generate validated business ideas with AI.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} dark`}>
      <body className="min-h-screen bg-background text-text-primary font-body flex flex-col">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#1E1E1E",
                color: "#F5F5F5",
                border: "1px solid #333",
                borderRadius: "10px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#F59E0B", secondary: "#0F0F0F" } },
              error: { iconTheme: { primary: "#EF4444", secondary: "#0F0F0F" } },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
