import "./globals.css";
import { JetBrains_Mono } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";

const mono = JetBrains_Mono({ subsets: ["latin"] });

export const metadata = {
  title: "RepoCraft",
  description: "AI-powered repository content generator",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${mono.className} bg-[var(--acid-bg)] text-[var(--acid-text-main)] min-h-screen selection:bg-[var(--acid-primary)] selection:text-black`}
      >
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
