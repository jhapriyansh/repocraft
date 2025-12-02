// src/app/api/repos/route.ts
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Octokit } from "@octokit/rest";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(req.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const q = (url.searchParams.get("q") || "").trim();
  const perPage = 9;

  const token = (session as any).accessToken as string;
  const octokit = new Octokit({ auth: token });

  try {
    // Get current user login
    const { data: me } = await octokit.request("GET /user");
    const userLogin = me.login;

    let repos: any[] = [];
    let hasMore = false;

    if (q) {
      // Search in user's repos
      const searchRes = await octokit.search.repos({
        q: `${q} user:${userLogin}`,
        per_page: perPage,
        page
      });

      repos = searchRes.data.items.map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        language: r.language,
        updatedAt: r.updated_at,
        owner: r.owner?.login || userLogin,
        htmlUrl: r.html_url
      }));

      hasMore = page * perPage < Math.min(searchRes.data.total_count, 1000); // GH caps search
    } else {
      // Normal paginated repos list
      const listRes = await octokit.repos.listForAuthenticatedUser({
        per_page: perPage,
        page,
        sort: "updated"
      });

      repos = listRes.data.map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        description: r.description,
        language: r.language,
        updatedAt: r.updated_at,
        owner: r.owner?.login || userLogin,
        htmlUrl: r.html_url
      }));

      hasMore = listRes.data.length === perPage;
    }

    return new Response(
      JSON.stringify({ repos, hasMore, username: userLogin }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("REPOS ERROR", err);
    return new Response(
      JSON.stringify({ error: "Failed to fetch repos" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
