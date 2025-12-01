"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import SignOutButton from "./SignOutButton";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <div className="w-full neo-card px-6 py-4 flex justify-between items-center mb-6">
      <Link href="/dashboard" className="flex items-center gap-2">
        <div className="neo-pill bg-rc-accent text-black font-bold">RC</div>
        <span className="font-black tracking-wide text-white">RepoCraft</span>
      </Link>

      {session && <SignOutButton />}
    </div>
  );
}
