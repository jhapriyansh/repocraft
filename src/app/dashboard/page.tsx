"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";

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
  const router = useRouter();

  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      signIn("github");
    }
  }, [status]);

  // fetch repos with pagination
  const loadRepos = async (pageNum: number) => {
    setLoading(true);
    const res = await fetch(`/api/repos?page=${pageNum}`);

    if (res.ok) {
      const data = await res.json();
      setRepos(data.repos);
      setHasMore(data.hasMore);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadRepos(page);
    }
  }, [status, page]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-[var(--acid-primary)] animate-pulse font-mono text-sm">
        [ SYSTEM: VERIFYING SESSION... ]
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--acid-bg)] pb-10">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 mt-8 space-y-6">
        {/* HEADER */}
        <div className="flex items-end justify-between border-b border-[var(--acid-border)] pb-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              <span className="text-[var(--acid-primary)]">/root</span>
              /repositories
            </h1>
            <p className="text-xs text-[var(--acid-text-dim)] mt-1">
              Select a target to analyze
            </p>
          </div>

          <div className="text-[10px] text-[var(--acid-secondary)] font-mono">
            STATUS: CONNECTED
          </div>
        </div>

        {/* REPO LIST */}
        {loading ? (
          <div className="text-center py-20 text-sm text-[var(--acid-text-dim)] font-mono">
            &gt; FETCHING DATA PACKETS...
          </div>
        ) : repos.length === 0 ? (
          <p className="text-sm text-[var(--acid-text-dim)]">
            No repositories found.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className="acid-card acid-card-interactive p-4 text-left flex flex-col justify-between h-32 group"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <p className="text-sm font-bold text-white group-hover:text-[var(--acid-primary)] truncate pr-2">
                      {repo.name}
                    </p>
                    {repo.language && (
                      <span className="text-[9px] uppercase border border-[var(--acid-border)] px-1.5 py-0.5 text-[var(--acid-text-dim)] group-hover:border-[var(--acid-primary)] group-hover:text-[var(--acid-primary)] transition-colors">
                        {repo.language}
                      </span>
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-xs text-[var(--acid-text-dim)] line-clamp-2 font-mono opacity-80">
                      {repo.description}
                    </p>
                  )}
                </div>

                <div className="flex justify-between items-end mt-2">
                  <span className="text-[10px] text-[var(--acid-text-dim)]">
                    ID: {repo.id.toString().slice(0, 6)}
                  </span>
                  <span className="text-[10px] text-[var(--acid-text-dim)] group-hover:text-white transition-colors">
                    {new Date(repo.updatedAt).toLocaleDateString(undefined, {
                      month: "2-digit",
                      day: "2-digit",
                      year: "2-digit",
                    })}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex items-center justify-center gap-4 mt-8 border-t border-[var(--acid-border)] pt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="acid-btn-ghost text-xs"
          >
            &lt; PREV
          </button>

          <span className="text-xs font-mono text-[var(--acid-primary)] bg-[rgba(201,255,0,0.1)] px-3 py-1 rounded">
            PAGE {page}
          </span>

          <button
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
            className="acid-btn-ghost text-xs"
          >
            NEXT &gt;
          </button>
        </div>
      </main>
    </div>
  );
}
