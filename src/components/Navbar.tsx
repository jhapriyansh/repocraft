"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import SignOutButton from "./SignOutButton";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="w-full border-b border-[var(--acid-border)] bg-[var(--acid-card)] sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-[var(--acid-primary)] text-black font-black flex items-center justify-center text-xs shadow-[0_0_10px_rgba(201,255,0,0.4)]">
            RC
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-bold tracking-widest text-white group-hover:text-[var(--acid-primary)] transition-colors">
              REPOCRAFT
            </span>
            <span className="text-[10px] text-[var(--acid-text-dim)] font-mono">
              v2.0.4 :: TERMINAL
            </span>
          </div>
        </Link>

        {session && <SignOutButton />}
      </div>
    </nav>
  );
}
