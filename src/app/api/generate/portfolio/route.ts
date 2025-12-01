import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserByProviderId } from "@/lib/getUserByProviderId";
import { checkRateLimit } from "@/lib/rateLimit";
import { callLLM } from "@/lib/llm";
import { buildPortfolioPrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).providerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const providerId = (session as any).providerId as string;
  const user = await getUserByProviderId(providerId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.apiKey) {
    const { allowed, remaining } = await checkRateLimit(user._id.toString());
    if (!allowed) {
      return NextResponse.json(
        { error: "Daily free limit reached", remaining },
        { status: 429 }
      );
    }
  }

  const body = await req.json();
  const prompt = buildPortfolioPrompt(body);
  const result = await callLLM(prompt);

  return NextResponse.json({ content: result });
}
