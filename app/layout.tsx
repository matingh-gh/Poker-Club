import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0b0c",
};

export const metadata: Metadata = {
  title: { default: "Poker Club", template: "%s · Poker Club" },
  applicationName: "Poker Club",
  manifest: "/manifest.webmanifest?v=ios-standalone-12",
  themeColor: "#0b0b0c",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16.png", sizes: "16x16", type: "image/png" }
    ],
    apple: [
      { url: "/apple-icon-180.png?v=txt1", sizes: "180x180" },
      { url: "/apple-icon-167.png?v=txt1", sizes: "167x167" },
      { url: "/apple-icon-152.png?v=txt1", sizes: "152x152" },
      { url: "/apple-icon-120.png?v=txt1", sizes: "120x120" }
    ]
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Poker Club"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="header-glass">
          <div
            className="container"
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", padding: "12px 16px" }}
          >
            <nav style={{ display: "flex", gap: "16px" }}>
              <Link href="/">Home</Link>
              <Link href="/players">Players</Link>
              <Link href="/sessions">Sessions</Link>
              <Link href="/ranking">Ranking</Link>
              <Link href="/sessions/new">New Session</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
