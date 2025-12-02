"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import Navbar from "@/components/Navbar";

// Keeping Types exact
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

  // EXE:Readme.md is in focus by default
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
    // Logic ensures this only runs for readme
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

  const handleFinalize = () => {
    // Placeholder for Finalize logic (e.g., Download, Save to DB, etc.)
    alert(`Selection Finalized: ${labelMap[active]}`);
  };

  const labelMap: Record<GenType, string> = {
    readme: "README.md",
    portfolio: "PORTFOLIO.JSON",
    resume: "RESUME_DATA.JSON",
    linkedin: "LINKEDIN_POST.TXT",
  };

  return (
    <div className="min-h-screen bg-[var(--acid-bg)]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-6">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-xs text-[var(--acid-text-dim)] hover:text-[var(--acid-primary)] mb-6 flex items-center gap-1 transition-colors"
        >
          &lt; cd ..
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT SIDEBAR: Repo Info & Controls */}
          <div className="lg:col-span-4 space-y-6">
            {/* Repo Header Card */}
            <div className="acid-card p-5 border-l-4 border-l-[var(--acid-primary)]">
              <div className="flex justify-between items-start mb-2">
                <p className="text-[10px] text-[var(--acid-primary)] uppercase tracking-widest">
                  TARGET_REPO
                </p>
                {repoUrl && (
                  <a
                    href={repoUrl}
                    target="_blank"
                    className="text-[10px] text-[var(--acid-text-dim)] hover:text-white hover:underline"
                  >
                    [ LINK ↗ ]
                  </a>
                )}
              </div>
              <h2 className="text-2xl font-black text-white break-all mb-2">
                {details?.repoInfo?.full_name ?? params.name}
              </h2>
              {details?.repoInfo?.description && (
                <p className="text-xs text-[var(--acid-text-dim)] font-mono leading-relaxed">
                  {details.repoInfo.description}
                </p>
              )}
            </div>

            {/* Tree Summary */}
            {details?.treeSummary && (
              <div className="acid-card p-4">
                <p className="text-[10px] text-[var(--acid-text-dim)] uppercase mb-3 border-b border-[var(--acid-border)] pb-1">
                  File Structure
                </p>
                <pre className="text-[10px] text-[#a9b1d6] max-h-48 overflow-auto whitespace-pre-wrap font-mono custom-scrollbar">
                  {details.treeSummary}
                </pre>
              </div>
            )}

            {/* Generator Controls */}
            <div className="acid-card p-5 flex flex-col h-auto">
              <p className="text-[10px] text-[var(--acid-text-dim)] uppercase mb-4 tracking-widest">
                GENERATION PROTOCOLS
              </p>

              {/* Rate Bar */}
              {usage && (
                <div className="mb-6">
                  <div className="flex justify-between text-[9px] text-[var(--acid-text-dim)] mb-1 uppercase">
                    <span>Token_Limit</span>
                    <span>
                      {usage.used} / {usage.limit}
                    </span>
                  </div>
                  <div className="h-1 w-full bg-[#111]">
                    <div
                      className="h-full bg-[var(--acid-secondary)] shadow-[0_0_8px_var(--acid-secondary)] transition-all duration-500"
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

              <div className="grid grid-cols-1 gap-2 mb-6">
                {(
                  ["readme", "portfolio", "resume", "linkedin"] as GenType[]
                ).map((type) => (
                  <button
                    key={type}
                    onClick={() => handleGenerate(type)}
                    className={`text-xs px-4 py-2 text-left font-mono border transition-all ${
                      active === type
                        ? "bg-[var(--acid-primary)] text-black border-[var(--acid-primary)] font-bold shadow-[0_0_15px_rgba(201,255,0,0.3)]"
                        : "bg-transparent text-[var(--acid-text-dim)] border-[var(--acid-border)] hover:border-[var(--acid-primary)] hover:text-[var(--acid-primary)]"
                    }`}
                  >
                    &gt; EXE: {labelMap[type]}
                  </button>
                ))}
              </div>

              {/* NEW FINALIZE BUTTON */}
              <div className="mt-auto pt-4 border-t border-[var(--acid-border)]">
                <button
                  disabled={!result || genLoading !== null}
                  onClick={handleFinalize}
                  className="acid-btn-primary w-full text-xs justify-center disabled:opacity-50 disabled:shadow-none"
                >
                  [ Finalize Selection ]
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT PANEL: Output Console */}
          <div className="lg:col-span-8">
            <div className="acid-card h-full min-h-[500px] flex flex-col">
              {/* Output Header */}
              <div className="flex justify-between items-center p-3 border-b border-[var(--acid-border)] bg-[#080808]">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[var(--acid-primary)] animate-pulse"></div>
                  <p className="text-xs text-[var(--acid-text-dim)] uppercase tracking-widest">
                    CONSOLE_OUTPUT
                  </p>
                </div>

                <div className="flex gap-3">
                  <button
                    className="text-[10px] text-[var(--acid-text-dim)] hover:text-white uppercase"
                    onClick={() => navigator.clipboard.writeText(result)}
                  >
                    [ Copy Buffer ]
                  </button>

                  <button
                    // UPDATED LOGIC: Only enabled for 'readme', disabled for everything else
                    disabled={
                      active !== "readme" || !result || genLoading !== null
                    }
                    onClick={handleCreatePr}
                    className="text-[10px] text-[var(--acid-primary)] hover:text-white hover:underline disabled:opacity-30 disabled:hover:no-underline disabled:cursor-not-allowed uppercase font-bold"
                  >
                    [ Commit to PR ]
                  </button>
                </div>
              </div>

              {/* Output Area */}
              <div className="flex-1 p-6 overflow-auto max-h-[700px] relative">
                {prStatus && (
                  <div className="absolute top-0 left-0 right-0 bg-[var(--acid-secondary)] text-white text-xs py-1 text-center font-bold">
                    STATUS: {prStatus}
                  </div>
                )}

                {genLoading ? (
                  <div className="h-full flex flex-col items-center justify-center text-[var(--acid-primary)] space-y-2 opacity-80">
                    <span className="loading-glitch text-lg font-black tracking-widest">
                      PROCESSING
                    </span>
                    <span className="text-xs text-[var(--acid-text-dim)]">
                      Parsing AST... synthesizing {labelMap[active]}...
                    </span>
                  </div>
                ) : result ? (
                  active === "readme" || active === "linkedin" ? (
                    // Markdown styling
                    <ReactMarkdown
                      className="prose prose-invert prose-sm max-w-none 
                      prose-headings:text-[var(--acid-primary)] prose-headings:font-bold prose-headings:uppercase
                      prose-a:text-[var(--acid-secondary)] prose-a:no-underline hover:prose-a:underline
                      prose-code:text-[#ff79c6] prose-code:bg-[#1f2937] prose-code:px-1 prose-code:rounded-none
                      prose-pre:bg-[#0b0b0b] prose-pre:border prose-pre:border-[var(--acid-border)]
                      font-mono"
                    >
                      {result}
                    </ReactMarkdown>
                  ) : (
                    <pre className="whitespace-pre-wrap break-words text-xs text-[#a9b1d6] font-mono">
                      {result}
                    </pre>
                  )
                ) : (
                  <div className="h-full flex items-center justify-center text-[var(--acid-text-dim)] text-xs font-mono">
                    _ WAITING FOR INPUT...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
