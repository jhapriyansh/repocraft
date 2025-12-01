"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LandingPage() {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.push("/dashboard");
    }
  }, [session, router]);

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-16">
      <div className="neo-card px-8 py-10 max-w-xl text-center">
        <div className="inline-flex items-center gap-2 mb-4">
          <span className="neo-pill">NEOBRUTAL • DARK</span>
          <span className="neo-pill bg-rc-accent-soft text-slate-950">
            LLM POWERED
          </span>
        </div>
        <h1 className="text-4xl font-black tracking-tight mb-4">
          Turn repos into{" "}
          <span className="underline decoration-rc-accent">content</span>.
        </h1>
        <p className="text-sm text-slate-300 mb-6">
          Sign in with GitHub, pick a repo, and RepoCraft will forge a clean
          README, portfolio entry, resume bullets, and a LinkedIn post. No
          fluff. No cringe. Just sharp output.
        </p>
        <button
          onClick={() => signIn("github")}
          className="neo-button w-full justify-center text-sm"
        >
          Login with GitHub
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4 w-full max-w-3xl">
        {["README.md", "Portfolio Card", "Resume Bullets", "LinkedIn Post"].map(
          (label) => (
            <div key={label} className="neo-card px-4 py-3 text-left">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-1">
                OUTPUT
              </p>
              <p className="text-sm font-bold">{label}</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
