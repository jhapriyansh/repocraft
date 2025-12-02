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
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--acid-primary)] to-transparent opacity-50"></div>

      <div className="acid-card max-w-xl w-full p-10 text-center border-t-4 border-t-[var(--acid-primary)] shadow-[0_0_50px_-20px_rgba(201,255,0,0.15)]">
        <div className="inline-flex items-center gap-3 mb-6">
          <span className="px-2 py-1 text-[10px] border border-[var(--acid-primary)] text-[var(--acid-primary)] tracking-widest uppercase">
            System Online
          </span>
          <span className="text-[10px] text-[var(--acid-secondary)] animate-pulse">
            ● AI Module Active
          </span>
        </div>

        <h1 className="text-5xl font-black tracking-tighter text-white mb-6">
          REPO<span className="text-[var(--acid-primary)]">CRAFT</span>
        </h1>

        <p className="text-sm text-[var(--acid-text-dim)] mb-10 leading-relaxed font-mono">
          Initialize sequence: Analyze GitHub Repositories. <br />
          Execute generation: README, Portfolio, Resume. <br />
          <span className="text-[var(--acid-primary)]">
            Output: High-performance content.
          </span>
        </p>

        <button
          onClick={() => signIn("github")}
          className="acid-btn-primary w-full py-3 text-sm"
        >
          &gt; Initialize Login_Sequence
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mt-12 opacity-60">
        {["README.md", "Portfolio.json", "Resume_Bullets", "LinkedIn.txt"].map(
          (label) => (
            <div
              key={label}
              className="border border-[var(--acid-border)] px-4 py-3 text-center"
            >
              <p className="text-[10px] text-[var(--acid-text-dim)] uppercase mb-1">
                Target
              </p>
              <p className="text-xs font-bold text-[var(--acid-primary)]">
                {label}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
