import type { ReactNode } from "react";
import "./globals.css";
import Providers from "./providers";

export const metadata = {
  title: "RepoCraft",
  description:
    "AI-powered neobrutalist tool for README, portfolio, resume, and LinkedIn content from your GitHub repos.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-rc-bg text-slate-100">
        <Providers>
          <div className="min-h-screen flex flex-col">
            <header className="border-b-2 border-slate-100 bg-rc-card shadow-neo">
              <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-rc-accent border-2 border-slate-100 rounded-neo shadow-neo flex items-center justify-center text-xs font-black text-slate-950">
                    RC
                  </div>
                  <div>
                    <h1 className="text-xl font-black tracking-tight">
                      RepoCraft
                    </h1>
                    <p className="text-xs text-slate-300 uppercase tracking-widest">
                      GitHub → README / Portfolio / Resume / LinkedIn
                    </p>
                  </div>
                </div>
              </div>
            </header>
            <main className="flex-1">
              <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
