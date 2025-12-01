import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createReadmePullRequest } from "@/lib/github";

export async function POST(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const body = await req.json();
  const owner = body.owner as string | undefined;
  const readme = body.readme as string | undefined;

  if (!owner || !readme) {
    return new Response("Missing owner or readme content", { status: 400 });
  }

  try {
    const pr = await createReadmePullRequest(
      (session as any).accessToken as string,
      {
        owner,
        repo: params.name,
        readmeContent: readme
      }
    );

    return new Response(JSON.stringify({ prUrl: pr.html_url }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (err: any) {
    console.error("README PR error", err?.response?.data || err);
    return new Response(
      JSON.stringify({
        error: "Failed to create PR",
        details: err?.response?.data || String(err)
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}
