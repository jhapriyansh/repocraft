import "./globals.css";
import { Inter } from "next/font/google";
import SessionWrapper from "@/components/SessionWrapper";

const inter = Inter({ subsets: ["latin"] });

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
      <body className={`${inter.className} bg-rc-bg text-white`}>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
