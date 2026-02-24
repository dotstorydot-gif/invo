import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { LanguageProvider } from "@/context/LanguageContext";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Invoica | Modern ERP & Invoicing",
  description: "High-end, professional ERP and invoicing platform built for the future.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <LanguageProvider>
          <div className="flex bg-background min-h-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
              {children}
            </div>
          </div>
        </LanguageProvider>
      </body>
    </html>
  );
}
