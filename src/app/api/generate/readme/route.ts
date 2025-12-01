import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserByProviderId } from "@/lib/getUserByProviderId";
import { checkRateLimit } from "@/lib/rateLimit";
import { streamLLM } from "@/lib/llm";
import { buildReadmePrompt } from "@/lib/prompts";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).providerId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const providerId = (session as any).providerId as string;
  const user = await getUserByProviderId(providerId);
  if (!user) return new Response("User not found", { status: 404 });

  // Rate limit only if user has no custom key
  if (!user.apiKey) {
    const { allowed } = await checkRateLimit(user._id.toString());
    if (!allowed) {
      return new Response("Daily free limit reached", { status: 429 });
    }
  }

  const body = await req.json();
  const prompt = buildReadmePrompt(body);

  const stream = await streamLLM(prompt);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8"
    }
  });
}
