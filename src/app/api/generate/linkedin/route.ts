import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getUserByProviderId } from "@/lib/getUserByProviderId";
import { checkRateLimit } from "@/lib/rateLimit";
import { streamLLM } from "@/lib/llm";
import { buildLinkedInPrompt } from "@/lib/prompts";
import { fetchKeyFileContents } from "@/lib/github";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).providerId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const providerId = (session as any).providerId;
  const user = await getUserByProviderId(providerId);
  if (!user) return new Response("User not found", { status: 404 });

  if (!user.apiKey) {
    const { allowed } = await checkRateLimit(user._id.toString());
    if (!allowed) return new Response("Daily free limit reached", { status: 429 });
  }

  const body = await req.json();
  const { owner, name: repoName } = body;

  // Fetch key file contents if keyFiles are provided
  let keyFileContents: Map<string, string> | undefined;
  if (body.keyFiles && (session as any).accessToken) {
    try {
      keyFileContents = await fetchKeyFileContents(
        (session as any).accessToken,
        owner,
        repoName,
        body.keyFiles
      );
    } catch (err) {
      console.error("Error fetching key files:", err);
      // Continue without key files
    }
  }

  // Convert Map to object for JSON serialization in prompt
  const contextWithFiles = {
    ...body,
    keyFileContents: keyFileContents ? Object.fromEntries(keyFileContents) : undefined
  };

  const prompt = buildLinkedInPrompt(contextWithFiles);

  const stream = await streamLLM(prompt);

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8" }
  });
}
