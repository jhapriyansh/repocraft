import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchUserRepos } from "@/lib/github";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const token = (session as any).accessToken as string;
  const repos = await fetchUserRepos(token);

  const mapped = repos.map((r: any) => ({
    id: r.id,
    name: r.name,
    fullName: r.full_name,
    description: r.description,
    language: r.language,
    updatedAt: r.updated_at,
    owner: r.owner.login,
    htmlUrl: r.html_url
  }));

  return NextResponse.json({ repos: mapped });
}
