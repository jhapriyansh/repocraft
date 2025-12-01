// src/app/dashboard/page.tsx

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
    return <p className="text-sm text-slate-400">Checking session…</p>;
  }

  return (
    <>
      <Navbar />

      <div className="space-y-6 mt-4">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-black">Your Repositories</h1>

          {/* SINGLE signout button */}
          <button
            onClick={() => signOut()}
            className="neo-button-ghost text-xs"
          >
            Sign out
          </button>
        </div>

        {/* REPO LIST */}
        {loading ? (
          <p className="text-sm text-slate-400">Loading repositories…</p>
        ) : repos.length === 0 ? (
          <p className="text-sm text-slate-400">No repositories found.</p>
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

        {/* PAGINATION */}
        <div className="flex items-center justify-between mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="neo-button-ghost text-xs disabled:opacity-40"
          >
            ← Previous
          </button>

          <p className="text-xs text-slate-500">Page {page}</p>

          <button
            disabled={!hasMore}
            onClick={() => setPage((p) => p + 1)}
            className="neo-button-ghost text-xs disabled:opacity-40"
          >
            Next →
          </button>
        </div>
      </div>
    </>
  );
}
