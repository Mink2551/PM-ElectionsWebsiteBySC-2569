import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../style/globals.css";
import { LanguageProvider } from "@/shared/context/LanguageContext";
import { ThemeProvider } from "@/shared/context/ThemeContext";
import { UserProvider } from "@/shared/context/UserContext";
import UserVerificationModal from "@/components/UserVerificationModal";
import { Analytics } from "@vercel/analytics/react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "vote4pm | by SC",
  description: "Official platform for Student Council Satit PM Election year 2569. View candidates, policies, and live results.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <UserProvider>
              {children}
              <UserVerificationModal />
              <Analytics />
            </UserProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
