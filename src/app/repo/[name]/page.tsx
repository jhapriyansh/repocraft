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

  // fetch repo details
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

  // fetch usage (for rate bar)
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
      repoUrl
    };

    try {
      const res = await fetch(`/api/generate/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        setResult(text || `Error: ${res.status}`);
        setGenLoading(null);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      // streaming loop
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        full += chunk;
        setResult((prev) => prev + chunk);
      }

      // update usage locally (best-effort)
      setUsage((prev) =>
        prev
          ? {
              ...prev,
              used: Math.min(prev.limit, prev.used + 1),
              remaining: Math.max(0, prev.remaining - 1)
            }
          : prev
      );
    } catch (err: any) {
      setResult(`Error: ${String(err)}`);
    } finally {
      setGenLoading(null);
    }
  };

  const labelMap: Record<GenType, string> = {
    readme: "README.md",
    portfolio: "Portfolio Entry (JSON)",
    resume: "Resume Bullets (JSON)",
    linkedin: "LinkedIn Post"
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
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
          body: JSON.stringify({
            owner,
            readme: result
          })
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setPrStatus(data.error || "Failed to create PR");
        return;
      }

      const data = await res.json();
      setPrStatus("PR created! Opening in a new tab…");
      if (data.prUrl) {
        window.open(data.prUrl, "_blank");
      }
    } catch (err: any) {
      setPrStatus(`Failed to create PR: ${String(err)}`);
    }
  };

  return (
    <div className="space-y-5">
      <button
        onClick={() => router.push("/dashboard")}
        className="neo-button-ghost text-xs mb-2"
      >
        ← Back to dashboard
      </button>

      {/* REPO HEADER */}
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

      {/* FILE TREE PREVIEW */}
      {details?.treeSummary && (
        <div className="neo-card px-5 py-4">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-2">
            FILE TREE (TRUNCATED)
          </p>
          <pre className="mt-1 text-[11px] max-h-64 overflow-auto whitespace-pre-wrap">
            {details.treeSummary}
          </pre>
        </div>
      )}

      {/* GENERATE SECTION */}
      <div className="neo-card px-5 py-4">
        <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">
          GENERATE
        </p>

        {/* rate bar */}
        {usage && (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-slate-400 mb-1">
              <span>Daily free limit</span>
              <span>
                {usage.used}/{usage.limit} used
              </span>
            </div>
            <div className="h-2 border-2 border-slate-100 rounded-neo bg-rc-bg overflow-hidden">
              <div
                className="h-full bg-rc-accent"
                style={{
                  width: `${Math.min(
                    100,
                    (usage.used / Math.max(1, usage.limit)) * 100
                  )}%`
                }}
              />
            </div>
          </div>
        )}

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

      {/* OUTPUT SECTION */}
      <div className="neo-card px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-slate-400 uppercase tracking-widest">
            OUTPUT
          </p>
          <div className="flex gap-2">
            <button
              className="neo-button-ghost text-[10px]"
              onClick={handleCopy}
            >
              Copy to clipboard
            </button>
            <button
              className={`neo-button-ghost text-[10px] ${
                active !== "readme" || !result
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
              disabled={active !== "readme" || !result}
              onClick={handleCreatePr}
            >
              Create README PR
            </button>
          </div>
        </div>

        {prStatus && (
          <p className="text-[10px] text-slate-400 mb-2">{prStatus}</p>
        )}

        <div className="mt-2 text-xs">
          {genLoading ? (
            <p className="text-slate-400">
              Crafting {labelMap[genLoading]}… (streaming)
            </p>
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
