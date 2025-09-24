import RegisterSW from "@/components/RegisterSW";
import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Poker App",
  description: "Home poker tracking app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    \1
  <head>
      <!-- iOS standalone / PWA -->
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-title" content="Poker Club" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <link rel="apple-touch-icon" href="/apple-icon.png" />
      <link rel="manifest" href="/manifest.webmanifest?v=ios-standalone-3" />
      <meta name="theme-color" content="#0b0b0c" />
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  </head>
      <body className="min-h-dvh bg-black text-white">
        <Nav />
        <main className="max-w-4xl mx-auto px-4">{children}</main>
        <RegisterSW />
    </body>
    </html>
  );
}
