import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Poker App",
  description: "Home poker tracking app",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-black text-white">
        <Nav />
        <main className="max-w-4xl mx-auto px-4">{children}</main>
      </body>
    </html>
  );
}
