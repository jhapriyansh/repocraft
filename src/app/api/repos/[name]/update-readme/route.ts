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
    // 1. Fetch repo & default branch
    //
    const repoInfo = await octokit.repos.get({ owner, repo });
    const baseBranch = repoInfo.data.default_branch;

    //
    // 2. Get SHA of latest commit in default branch
    //
    const branchInfo = await octokit.repos.getBranch({
      owner,
      repo,
      branch: baseBranch
    });
    const baseSha = branchInfo.data.commit.sha;

    const branchName = "repocraft-readme-update";

    //
    // 3. Try creating branch (ignore if exists)
    //
    try {
      await octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: baseSha
      });
    } catch (e: any) {
      // Branch already exists → OK
      if (e.status !== 422) throw e;
    }

    //
    // 4. Get README SHA (must include when updating)
    //
    let currentSha: string | undefined = undefined;

    try {
      const { data: readmeData } = await octokit.repos.getContent({
        owner,
        repo,
        path: "README.md",
        ref: branchName // read from target branch
      });

      if (!Array.isArray(readmeData)) {
        currentSha = readmeData.sha;
      }
    } catch (err) {
      // README does not exist → SHA stays undefined
    }

    //
    // 5. Create/update README.md
    //
    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: "README.md",
      message: "Update README via RepoCraft",
      content: Buffer.from(readme).toString("base64"),
      branch: branchName,
      sha: currentSha // REQUIRED when updating
    });

    //
    // 6. Create Pull Request
    //
    const pr = await octokit.pulls.create({
      owner,
      repo,
      title: "Update README via RepoCraft",
      head: branchName,
      base: baseBranch
    });

    return Response.json({ prUrl: pr.data.html_url });
  } catch (err: any) {
    console.error("PR ERROR", err);
    return new Response(
      JSON.stringify({
        error: "PR creation failed",
        details: err?.message || err
      }),
      { status: 500 }
    );
  }
}
