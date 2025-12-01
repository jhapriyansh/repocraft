"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/Navbar";

type RepoDetails = {
  repoInfo: any;
  tree: any;
  treeSummary: string;
  readme: string | null;
  pkgJson: any;
};

type GenType = "readme" | "portfolio" | "resume" | "linkedin";
type Usage = { used: number; limit: number; remaining: number };

export default function RepoPage({ params }: { params: { name: string } }) {
  const searchParams = useSearchParams();
  const owner = searchParams.get("owner");
  const repoUrl = searchParams.get("url") || undefined;
  const router = useRouter();

  const [details, setDetails] = useState<RepoDetails | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [genLoading, setGenLoading] = useState<GenType | null>(null);
  const [active, setActive] = useState<GenType>("readme");
  const [result, setResult] = useState<string>("");

  const [usage, setUsage] = useState<Usage | null>(null);
  const [prStatus, setPrStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!owner) return;
    const run = async () => {
      setLoadingDetails(true);
      const res = await fetch(
        `/api/repos/${encodeURIComponent(params.name)}/details?owner=${owner}`
      );
      if (res.ok) {
        const data = await res.json();
        setDetails(data);
      }
      setLoadingDetails(false);
    };
    run();
  }, [owner, params.name]);

  useEffect(() => {
    const run = async () => {
      const res = await fetch("/api/usage");
      if (!res.ok) return;
      const data = await res.json();
      setUsage(data);
    };
    run();
  }, []);

  const handleGenerate = async (type: GenType) => {
    if (!details) return;

    setActive(type);
    setGenLoading(type);
    setResult("");
    setPrStatus(null);

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

    if (!res.ok || !res.body) {
      setResult(`Error: ${res.status}`);
      setGenLoading(null);
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      setResult((prev) => prev + chunk);
    }

    setGenLoading(null);
  };

  const handleCreatePr = async () => {
    if (!details || !owner || !result || active !== "readme") return;

    setPrStatus("Creating PR…");

    try {
      const res = await fetch(
        `/api/repos/${encodeURIComponent(params.name)}/update-readme`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ owner, readme: result }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPrStatus(data.error || "Failed to create PR");
        return;
      }

      const data = await res.json();

      setPrStatus("PR created! Opening…");
      window.open(data.prUrl, "_blank");
    } catch {
      setPrStatus("PR creation failed.");
    }
  };

  const labelMap: Record<GenType, string> = {
    readme: "README.md",
    portfolio: "Portfolio Entry (JSON)",
    resume: "Resume Bullets (JSON)",
    linkedin: "LinkedIn Post",
  };

  return (
    <>
      <Navbar />

      <button
        onClick={() => router.push("/dashboard")}
        className="neo-button-ghost text-xs mb-2"
      >
        ← Back to dashboard
      </button>

      <div className="space-y-5">
        <div className="neo-card px-5 py-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">
                REPO
              </p>
              <h2 className="text-xl font-black text-white">
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
                className="neo-button-ghost text-xs"
              >
                View on GitHub ↗
              </a>
            )}
          </div>
        </div>

        {details?.treeSummary && (
          <div className="neo-card px-5 py-4">
            <p className="text-xs text-slate-400 uppercase mb-2">FILE TREE</p>
            <pre className="text-[11px] max-h-64 overflow-auto whitespace-pre-wrap">
              {details.treeSummary}
            </pre>
          </div>
        )}

        <div className="neo-card px-5 py-4">
          <p className="text-xs text-slate-400 uppercase mb-3">GENERATE</p>
          {/* rate bar */}
          {usage && (
            <div className="mb-3">
              <div className="flex justify-between text-[10px] text-rc-muted mb-1">
                <span>Daily free limit</span>
                <span>
                  {usage.used}/{usage.limit} used
                </span>
              </div>

              <div className="h-2 border-2 border-rc-border rounded-neo bg-rc-bg overflow-hidden">
                <div
                  className="h-full bg-rc-accent"
                  style={{
                    width: `${Math.min(
                      100,
                      (usage.used / Math.max(1, usage.limit)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mb-3">
            {(["readme", "portfolio", "resume", "linkedin"] as GenType[]).map(
              (type) => (
                <button
                  key={type}
                  onClick={() => handleGenerate(type)}
                  className={`text-xs px-3 py-1 rounded-full border-2 border-slate-100 shadow-neo ${
                    active === type
                      ? "bg-rc-accent text-black"
                      : "bg-rc-bg text-slate-100"
                  }`}
                >
                  {labelMap[type]}
                </button>
              )
            )}
          </div>
        </div>

        <div className="neo-card px-5 py-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs text-slate-400 uppercase tracking-widest">
              OUTPUT
            </p>

            <div className="flex gap-2">
              <button
                className="neo-button-ghost text-[10px]"
                onClick={() => navigator.clipboard.writeText(result)}
              >
                Copy
              </button>

              <button
                disabled={active !== "readme" || !result}
                onClick={handleCreatePr}
                className="neo-button-ghost text-[10px] disabled:opacity-40"
              >
                Create README PR
              </button>
            </div>
          </div>

          {prStatus && (
            <p className="text-[10px] text-slate-300 mb-2">{prStatus}</p>
          )}

          <div className="mt-2 text-xs">
            {genLoading ? (
              <p className="text-slate-400">Crafting {labelMap[active]}…</p>
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
              <p className="text-slate-500">
                Pick something to generate above.
              </p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
