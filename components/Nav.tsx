"use client";
import Link from "next/link";

export default function Nav() {
  const links = [
    { href: "/", label: "Home" },
    { href: "/players", label: "Players" },
    { href: "/sessions", label: "Sessions" },
    { href: "/ranking", label: "Ranking" },
    { href: "/sessions/new", label: "New Session" },
  ];
  return (
    <nav className="w-full flex items-center justify-center gap-6 py-4 text-sm">
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="hover:underline">
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
