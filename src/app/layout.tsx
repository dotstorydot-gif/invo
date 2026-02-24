import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

import { LanguageProvider } from "@/context/LanguageContext";

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
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
