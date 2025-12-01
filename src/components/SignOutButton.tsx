"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="neo-button-ghost text-xs"
    >
      SIGN OUT
    </button>
  );
}
