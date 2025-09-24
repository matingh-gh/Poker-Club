export default function Head() {
  return (
    <>
      <title>Poker Club</title>

      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />

      {/* PWA basics */}
      <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      <link rel="manifest" href="/manifest.webmanifest?v=ios-standalone-2" />

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
