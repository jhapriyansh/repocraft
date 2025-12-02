import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Octokit } from "@octokit/rest";

export async function POST(
  req: NextRequest,
  { params }: { params: { name: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { owner, readme } = await req.json();
  const repo = params.name;

  if (!owner || !readme) {
    return new Response("Missing owner or readme", { status: 400 });
  }

  const token = (session as any).accessToken;
  const octokit = new Octokit({ auth: token });

  try {
    //
    // 1. Fetch repo info to get default branch (main/master)
    //
    const repoInfo = await octokit.repos.get({ owner, repo });
    const baseBranch = repoInfo.data.default_branch;

    //
    // 2. Get latest commit SHA from default branch
    //
    const branchInfo = await octokit.repos.getBranch({
      owner,
      repo,
      branch: baseBranch,
    });

    const latestCommitSha = branchInfo.data.commit.sha;

    //
    // 3. Try to fetch existing README.md on default branch
    //
    let currentReadmeSha: string | undefined;
    let currentReadmeContent: string | undefined;

    try {
      const { data: readmeData } = await octokit.repos.getContent({
        owner,
        repo,
        path: "README.md",
        ref: baseBranch,
      });

      // Ensure it's a file, not dir/symlink
      if (!Array.isArray(readmeData) && readmeData.type === "file") {
        currentReadmeSha = readmeData.sha;

        if (readmeData.content) {
          const buff = Buffer.from(readmeData.content, "base64");
          currentReadmeContent = buff.toString("utf-8");
        }
      }
    } catch (e) {
      // README does not exist — we will create it
      currentReadmeSha = undefined;
    }

    //
    // 4. Commit directly to default branch
    //
    const commitRes = await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: "README.md",
      message: "Update README via RepoCraft",
      content: Buffer.from(readme).toString("base64"),
      branch: baseBranch,
      sha: currentReadmeSha, // required only if updating
    });

    //
    // 5. Return commit URL
    //
    const commitUrl = commitRes.data.commit.html_url;
    return Response.json({
      ok: true,
      url: commitUrl,
      message: "README updated directly on default branch",
    });
  } catch (err: any) {
    console.error("DIRECT COMMIT ERROR", err);
    return new Response(
      JSON.stringify({
        error: "Commit failed",
        details: err?.message || err,
      }),
      { status: 500 }
    );
  }
}
