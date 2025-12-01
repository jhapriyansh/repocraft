"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Repo = {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  language: string | null;
  updatedAt: string;
  owner: string;
  htmlUrl: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("github");
    }
  }, [status]);

  useEffect(() => {
    const run = async () => {
      if (status !== "authenticated") return;
      setLoading(true);
      const res = await fetch("/api/repos");
      if (res.ok) {
        const data = await res.json();
        setRepos(data.repos);
      }
      setLoading(false);
    };
    run();
  }, [status]);

  if (status === "loading") {
    return <p className="text-sm text-slate-400">Checking session…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 justify-between">
        <div>
          <h2 className="text-2xl font-black tracking-tight">Your Repos</h2>
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            Pick one to craft docs
          </p>
        </div>
        <div className="flex items-center gap-3">
          {session && (
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="neo-pill">
                {(session.user?.name || session.user?.email) ?? "You"}
              </span>
            </div>
          )}
          <button
            onClick={() => signOut()}
            className="neo-button-ghost text-xs"
          >
            Sign out
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-slate-400">Loading repositories…</p>
      ) : (
        <div className="grid gap-3">
          {repos.map((repo) => (
            <button
              key={repo.id}
              onClick={() =>
                router.push(
                  `/repo/${encodeURIComponent(repo.name)}?owner=${
                    repo.owner
                  }&url=${encodeURIComponent(repo.htmlUrl)}`
                )
              }
              className="neo-card px-4 py-3 text-left hover:-translate-y-0.5 transition-transform"
            >
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="text-sm font-bold">{repo.name}</p>
                  {repo.description && (
                    <p className="text-xs text-slate-300 mt-1 line-clamp-2">
                      {repo.description}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1">
                  {repo.language && (
                    <span className="neo-pill text-[10px]">
                      {repo.language}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500">
                    Updated:{" "}
                    {new Date(repo.updatedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
