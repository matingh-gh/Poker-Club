'use client';
import Image from "next/image";
import Link from "next/link";

export default function BrandLogo() {
  return (
    <Link href="/" aria-label="Poker Club — Home" className="brand-logo">
      <Image
        src="/brand/logo.png"
        alt=""
        width={28}
        height={28}
        className="brand-img"
        priority
      />
      <span className="brand-text">Poker Club</span>
    </Link>
  );
}
