export default function Head() {
  return (
    <>
      <title>Poker Club</title>

      {/* PWA basics */}
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <link rel="manifest" href="/manifest.webmanifest" />

      {/* iOS standalone */}
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Poker Club" />
      <link rel="apple-touch-icon" href="/apple-icon.png" />

      {/* Theme colors */}
      <meta name="theme-color" content="#0b0b0c" />
      <meta name="color-scheme" content="light dark" />
    </>
  );
}
