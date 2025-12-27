import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import QueryProvider from "@/providers/query-provider";
import SessionProvider from "@/providers/session-provider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';


export const dynamic = 'force-dynamic';

import { AppShell } from "@/components/layout/app-shell";
import { ThemeProvider } from "@/components/theme-provider";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SwiftQueue",
  description: "SwiftQueue MVP",
};


export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NextIntlClientProvider messages={messages}>
          <SessionProvider>
            <QueryProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                <AppShell>
                  {children}
                </AppShell>
              </ThemeProvider>
            </QueryProvider>
          </SessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

