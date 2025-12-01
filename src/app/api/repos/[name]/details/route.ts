import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchRepoDetails } from "@/lib/github";

export async function GET(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const owner = searchParams.get("owner");
  if (!owner) {
    return NextResponse.json({ error: "Missing owner" }, { status: 400 });
  }

  const token = (session as any).accessToken as string;
  const details = await fetchRepoDetails(token, owner, params.name);

  // compute a tiny tree summary
  const tree = details.tree?.tree || [];
  const firstFiles = tree.slice(0, 60).map((f: any) => f.path);
  const treeSummary = firstFiles.join("\n");

  return NextResponse.json({
    ...details,
    treeSummary
  });
}
