export default function DebugEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "undefined";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "undefined";
  return (
    <main className="min-h-dvh grid place-items-center">
      <div className="rounded-xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-xl font-semibold mb-4">ENV Check</h2>
        <p>URL: {url ? url : "undefined"}</p>
        <p>ANON: {anon === "undefined" ? "undefined" : anon.slice(0, 6) + "... (" + anon.length + " chars)"}</p>
      </div>
    </main>
  );
}
