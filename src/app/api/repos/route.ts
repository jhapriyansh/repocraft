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

  const token = (session as any).accessToken;

  const page = Number(req.nextUrl.searchParams.get("page") ?? 1);
  const perPage = 12; // 12 repos per page

  const octokit = new Octokit({ auth: token });

  try {
    const response = await octokit.repos.listForAuthenticatedUser({
      per_page: perPage,
      page,
      sort: "updated",
      direction: "desc",
    });

    const repos = response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      language: repo.language,
      updatedAt: repo.updated_at,
      owner: repo.owner?.login,
      htmlUrl: repo.html_url,
    }));

    return Response.json({
      repos,
      page,
      hasMore: response.data.length === perPage,
    });
  } catch (err: any) {
    console.error("Repo fetch error:", err);
    return new Response("Failed to fetch repos", { status: 500 });
  }
}
