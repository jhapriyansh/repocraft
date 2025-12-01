"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

type RepoDetails = {
  repoInfo: any;
  tree: any;
  treeSummary: string;
  readme: string | null;
  pkgJson: any;
};

type GenType = "readme" | "portfolio" | "resume" | "linkedin";

export default function RepoPage({ params }: { params: { name: string } }) {
  const searchParams = useSearchParams();
  const owner = searchParams.get("owner");
  const repoUrl = searchParams.get("url") || undefined;
  const router = useRouter();

  const [details, setDetails] = useState<RepoDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [genLoading, setGenLoading] = useState<GenType | null>(null);
  const [active, setActive] = useState<GenType>("readme");
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    if (!owner) return;
    const run = async () => {
      setLoading(true);
      const res = await fetch(
        `/api/repos/${encodeURIComponent(params.name)}/details?owner=${owner}`
      );
      if (res.ok) {
        const data = await res.json();
        setDetails(data);
      }
      setLoading(false);
    };
    run();
  }, [owner, params.name]);

  const handleGenerate = async (type: GenType) => {
    if (!details) return;
    setActive(type);
    setGenLoading(type);
    setResult("");

    const payload = {
      repoName: details.repoInfo?.name,
      description: details.repoInfo?.description,
      treeSummary: details.treeSummary,
      pkgJson: details.pkgJson,
      readme: details.readme,
      repoUrl,
    };

    const res = await fetch(`/api/generate/${type}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    setResult(data.content ?? JSON.stringify(data, null, 2));
    setGenLoading(null);
  };

  const labelMap: Record<GenType, string> = {
    readme: "README.md",
    portfolio: "Portfolio Entry (JSON)",
    resume: "Resume Bullets (JSON)",
    linkedin: "LinkedIn Post",
  };

  return (
    <div className="space-y-5">
      <button
        onClick={() => router.push("/dashboard")}
        className="neo-button-ghost text-xs mb-2"
      >
        ← Back to dashboard
      </button>

      <div className="neo-card px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
              REPO
            </p>
            <h2 className="text-xl font-black">
              {details?.repoInfo?.full_name ?? params.name}
            </h2>
            {details?.repoInfo?.description && (
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {details.repoInfo.description}
              </p>
            )}
          </div>
          {repoUrl && (
            <a
              href={repoUrl}
              target="_blank"
              rel="noreferrer"
              className="neo-button-ghost text-xs"
            >
              View on GitHub ↗
            </a>
          )}
        </div>
      </div>

      <div className="neo-card px-5 py-4">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">
          GENERATE
        </p>
        <div className="flex flex-wrap gap-2 mb-3">
          {(["readme", "portfolio", "resume", "linkedin"] as GenType[]).map(
            (t) => (
              <button
                key={t}
                onClick={() => handleGenerate(t)}
                className={`text-xs px-3 py-1 rounded-full border-2 border-slate-100 shadow-neo ${
                  active === t
                    ? "bg-rc-accent text-slate-950"
                    : "bg-rc-bg text-slate-100"
                }`}
              >
                {labelMap[t]}
              </button>
            )
          )}
        </div>
        <p className="text-[10px] text-slate-500">
          Each click uses one generation (free users: 10/day).
        </p>
      </div>

      <div className="neo-card px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            OUTPUT
          </p>
          <button
            className="neo-button-ghost text-[10px]"
            onClick={() => {
              if (!result) return;
              navigator.clipboard.writeText(result);
            }}
          >
            Copy to clipboard
          </button>
        </div>
        <div className="mt-2 text-xs">
          {genLoading ? (
            <p className="text-slate-400">Crafting {labelMap[genLoading]}…</p>
          ) : result ? (
            active === "readme" || active === "linkedin" ? (
              <ReactMarkdown className="prose prose-invert max-w-none prose-pre:bg-rc-bg prose-pre:border-2 prose-pre:border-slate-100 prose-pre:rounded-neo">
                {result}
              </ReactMarkdown>
            ) : (
              <pre className="whitespace-pre-wrap break-words text-[11px]">
                {result}
              </pre>
            )
          ) : (
            <p className="text-slate-500 text-xs">
              Pick what to generate above to see RepoCraft in action.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
