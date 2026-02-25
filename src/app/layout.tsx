import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cookies } from 'next/headers';

const inter = Inter({ subsets: ["latin"] });

import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import SuperadminSidebar from "@/components/SuperadminSidebar";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Invoica | Modern ERP & Invoicing",
  description: "High-end, professional ERP and invoicing platform built for the future.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sessionStr = cookieStore.get('invoica_session')?.value;
  let initialSession = null;
  if (sessionStr) {
    try {
      initialSession = JSON.parse(sessionStr);
    } catch { }
  }

  const isSuperadmin = initialSession?.role === 'Superadmin';

  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider initialSession={initialSession}>
          <LanguageProvider>
            <div className={`flex bg-background min-h-screen ${!initialSession ? 'bg-[#050505]' : ''}`}>
              {initialSession && !isSuperadmin && <Sidebar />}
              {isSuperadmin && <SuperadminSidebar />}
              <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {children}
              </div>
            </div>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
