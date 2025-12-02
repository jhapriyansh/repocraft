// src/app/page.tsx
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
      {/* subtle top line */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--acid-primary)] to-transparent opacity-40" />

      <div className="acid-card max-w-xl w-full p-10 text-center border-t-4 border-t-[var(--acid-primary)] shadow-[0_0_50px_-20px_rgba(201,255,0,0.15)]">
        <h1 className="text-5xl font-black tracking-tighter text-white mb-4">
          REPO<span className="text-[var(--acid-primary)]">CRAFT</span>
        </h1>

        <p className="text-sm text-[var(--acid-text-dim)] mb-8 leading-relaxed font-mono">
          Connect your GitHub, scan a repository, and generate{" "}
          <span className="text-[var(--acid-primary)]">
            clean READMEs, portfolio entries, resume bullets and posts
          </span>{" "}
          directly from the codebase.
        </p>

        <button
          onClick={() => signIn("github")}
          className="
    w-full py-3 text-sm font-mono
    flex items-center justify-center gap-3
    bg-black border border-[var(--acid-primary)]
    text-[var(--acid-primary)]
    hover:bg-[rgba(201,255,0,0.05)]
    hover:shadow-[0_0_12px_rgba(201,255,0,0.4)]
    transition-all
  "
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="var(--acid-primary)"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 
      3.438 9.8 8.205 11.387.6.113.82-.258.82-.577 
      0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.757-1.333-1.757-1.089-.745.084-.729.084-.729 
      1.205.084 1.84 1.237 1.84 1.237 1.07 1.834 2.807 
      1.304 3.492.997.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 
      0-1.31.47-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 
      0 0 1.005-.322 3.3 1.23a11.52 11.52 0 0 1 3-.404c1.02.005 
      2.045.138 3 .404 2.28-1.552 3.285-1.23 3.285-1.23.645 
      1.653.24 2.873.12 3.176.765.84 1.23 1.91 
      1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 
      2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 
      22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
            />
          </svg>

          {"> LOGIN_WITH_GITHUB"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-3xl mt-12 opacity-60">
        {["README.md", "Portfolio.json", "Resume bullets", "LinkedIn post"].map(
          (label) => (
            <div
              key={label}
              className="border border-[var(--acid-border)] px-4 py-3 text-center"
            >
              <p className="text-[10px] text-[var(--acid-text-dim)] uppercase mb-1">
                Output type
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
