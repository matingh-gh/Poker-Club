
      <BrandLogo />
import BrandLogo from "../components/BrandLogo";export default function Home() {
  return (
    <section className="min-h-[70dvh] flex flex-col items-center justify-center gap-6 text-center relative">
      {/* subtle bg glow */}
      <div className="pointer-events-none absolute inset-0 opacity-30 [background:radial-gradient(60%_40%_at_50%_20%,_#22c55e_0%,_transparent_60%)]" />
      <div className="relative mx-auto max-w-2xl rounded-2xl border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur">
        <h1 className="text-4xl font-semibold tracking-tight">Welcome to Poker App</h1>
  <div id="home-cta" className="mt-6">
    <a href="/sessions/new" className="btn btn-primary">Create Session</a>
  </div>

        <p className="mt-3 text-base text-white/80">
          Track your home games like a pro—create sessions, add players, and see live rankings.
        </p>
        <div className="mt-6 grid gap-3 text-sm text-left">
          <p className="text-white/90">
            • <span className="font-medium">Players</span>: manage your players list.
          </p>
          <p className="text-white/90">
            • <span className="font-medium">Sessions</span>: view history or start a new game.
          </p>
          <p className="text-white/90">
            • <span className="font-medium">Ranking</span>: see standings based on results.
          </p>
          <p className="text-white/70">
            Use the navigation bar above to jump to any section.
          </p>
        </div>
      </div>
    </section>
  );
}

{/* CTA: Create Session */}
<div className="mt-6">
  <a href="/sessions/new" className="btn btn-primary">Create Session</a>
</div>
