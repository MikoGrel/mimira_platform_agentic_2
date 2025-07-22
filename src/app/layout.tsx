import type { Metadata } from "next";
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google";
import "$/styles/globals.css";
import ThemeProvider from "$/features/shared/providers/ThemeProvider";
import QueryProvider from "$/features/shared/providers/QueryProvider";
import { LingoProvider, loadDictionary } from "lingo.dev/react/rsc";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mimira Agentic Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LingoProvider loadDictionary={(locale) => loadDictionary(locale)}>
      <html lang="pl">
        <head>
          <link rel="icon" href="/symbol-white.svg" id="light-scheme-icon" />
          <link rel="icon" href="/symbol-dark.svg" id="dark-scheme-icon" />
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} antialiased light font-body bg-background text-font-base`}
        >
          <QueryProvider>
            <ThemeProvider>
              <NuqsAdapter>{children}</NuqsAdapter>
            </ThemeProvider>
          </QueryProvider>
          <Toaster />
        </body>
      </html>
    </LingoProvider>
  );
}
