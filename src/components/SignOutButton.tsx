"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="text-xs text-[var(--acid-text-dim)] hover:text-red-400 hover:underline transition-colors uppercase tracking-widest"
    >
      [ Sign Out ]
    </button>
  );
}
