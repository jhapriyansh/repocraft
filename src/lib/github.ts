import axios from "axios";

const BASE = "https://api.github.com";

// Key file patterns to extract for context (token-aware)
const KEY_FILE_PATTERNS = [
  // Config files - highest priority
  /package\.json$/,
  /tsconfig\.json$/,
  /vite\.config\.[jt]sx?$/,
  /next\.config\.[jt]sx?$/,
  /babel\.config\.[jt]sx?$/,
  /jest\.config\.[jt]sx?$/,
  /webpack\.config\.[jt]sx?$/,
  /\.eslintrc/,
  /\.prettierrc/,
  /README\.md$/i,
  /\.env\.example$/,
  /Dockerfile$/,
  /docker-compose\.ya?ml$/,
  /\.github\/workflows\//,
  
  // Main entry points and core files
  /src\/main\.[jt]sx?$/,
  /src\/index\.[jt]sx?$/,
  /src\/app\.[jt]sx?$/,
  /src\/App\.[jt]sx?$/,
  /pages\/index\.[jt]sx?$/,
  /pages\/\[\.\.\.\w+\]\.[jt]sx?$/,
  
  // Component files
  /src\/components\/.*\.[jt]sx?$/,
  /src\/pages\/.*\.[jt]sx?$/,
  /src\/routes\/.*\.[jt]sx?$/,
  /src\/lib\/.*\.[jt]sx?$/,
  /src\/utils\/.*\.[jt]sx?$/,
  /src\/hooks\/.*\.[jt]sx?$/,
  /src\/context\/.*\.[jt]sx?$/,
  /src\/services\/.*\.[jt]sx?$/,
  /src\/api\/.*\.[jt]sx?$/,
  /src\/store\/.*\.[jt]sx?$/,
  
  // Any TypeScript/JavaScript file (fallback)
  /\.[jt]sx?$/,
];

const IGNORE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /dist/,
  /build/,
  /\.git/,
  /\.env$/,
  /\.env\.local$/,
  /coverage/,
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/
];

function shouldIncludeFile(path: string): boolean {
  if (IGNORE_PATTERNS.some(p => p.test(path))) return false;
  return KEY_FILE_PATTERNS.some(p => p.test(path));
}

export async function fetchUserRepos(token: string) {
  const res = await axios.get(`${BASE}/user/repos`, {
    headers: { Authorization: `Bearer ${token}` },
    params: { sort: "updated", per_page: 100 }
  });
  return res.data;
}

export async function fetchRepoDetails(
  token: string,
  owner: string,
  repo: string
) {
  const [info, tree, readme, pkgJson] = await Promise.allSettled([
    axios.get(`${BASE}/repos/${owner}/${repo}`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    axios.get(`${BASE}/repos/${owner}/${repo}/git/trees/HEAD?recursive=1`, {
      headers: { Authorization: `Bearer ${token}` }
    }),
    axios.get(`${BASE}/repos/${owner}/${repo}/readme`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github.raw+json"
      }
    }),
    axios.get(`${BASE}/repos/${owner}/${repo}/contents/package.json`, {
      headers: { Authorization: `Bearer ${token}` }
    })
  ]);

  const unwrap = (r: PromiseSettledResult<any>) =>
    r.status === "fulfilled" ? r.value.data : null;

  const repoInfo = unwrap(info);
  const treeData = unwrap(tree);
  const readmeData = unwrap(readme);
  const pkgFile = unwrap(pkgJson);

  let pkg: any = null;
  if (pkgFile?.content) {
    try {
      const decoded = Buffer.from(pkgFile.content, "base64").toString("utf8");
      pkg = JSON.parse(decoded);
    } catch {
      pkg = null;
    }
  }

  // Extract key files from tree (smart prioritization)
  const allFiles = treeData?.tree || [];
  
  // Separate files by priority
  const configFiles = allFiles.filter((f: any) => 
    f.type === "blob" && /^(package\.json|vite\.config|next\.config|tsconfig|README)/.test(f.path)
  );
  
  const sourceFiles = allFiles.filter((f: any) => 
    f.type === "blob" && shouldIncludeFile(f.path) && 
    !configFiles.some((cf: any) => cf.path === f.path)
  );
  
  // Prioritize: configs first, then main sources, then other files
  const keyFiles = [
    ...configFiles.map((f: any) => f.path),
    ...sourceFiles.slice(0, 35).map((f: any) => f.path)
  ].slice(0, 40); // Total limit 40

  return {
    repoInfo,
    tree: treeData,
    readme: readmeData,
    pkgJson: pkg,
    keyFiles // Return filtered key files
  };
}

// Fetch content of key files for LLM context (token-aware)
export async function fetchKeyFileContents(
  token: string,
  owner: string,
  repo: string,
  keyFiles: string[]
): Promise<Map<string, string>> {
  const fileContents = new Map<string, string>();
  let successCount = 0;
  let failCount = 0;
  
  // Fetch files in parallel (limit concurrency to 5)
  const batchSize = 5;
  for (let i = 0; i < keyFiles.length; i += batchSize) {
    const batch = keyFiles.slice(i, i + batchSize);
    const promises = batch.map(async (path) => {
      try {
        const res = await axios.get(`${BASE}/repos/${owner}/${repo}/contents/${path}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.raw+json"
          },
          timeout: 5000 // 5 second timeout per file
        });
        
        let content = res.data;
        // Limit file size to 3000 chars for efficiency
        if (typeof content === 'string' && content.length > 3000) {
          content = content.substring(0, 3000) + "\n... [file truncated]";
        }
        return { path, content, success: true };
      } catch (err: any) {
        console.error(`Failed to fetch ${path}:`, err.message);
        return { path, content: null, success: false };
      }
    });
    
    const results = await Promise.all(promises);
    results.forEach(({ path, content, success }) => {
      if (success && content) {
        fileContents.set(path, content);
        successCount++;
      } else {
        failCount++;
      }
    });
  }
  
  console.log(`Fetched ${successCount}/${keyFiles.length} key files (${failCount} failed)`);
  return fileContents;
}

export async function createReadmePullRequest(
  token: string,
  params: { owner: string; repo: string; readmeContent: string }
) {
  const { owner, repo, readmeContent } = params;

  const client = axios.create({
    baseURL: BASE,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json"
    }
  });

  // 1. repo info
  const repoRes = await client.get(`/repos/${owner}/${repo}`);
  const baseBranch = repoRes.data.default_branch as string;

  // 2. base branch ref
  const refRes = await client.get(
    `/repos/${owner}/${repo}/git/ref/heads/${baseBranch}`
  );
  const baseCommitSha = refRes.data.object.sha as string;

  // 3. fetch commit to get tree SHA
  const commitRes = await client.get(
    `/repos/${owner}/${repo}/git/commits/${baseCommitSha}`
  );
  const baseTreeSha = commitRes.data.tree.sha as string;

  // 4. new branch
  const branchName = `repocraft/readme-${Date.now()}`;
  await client.post(`/repos/${owner}/${repo}/git/refs`, {
    ref: `refs/heads/${branchName}`,
    sha: baseCommitSha
  });

  // 5. blob for README
  const blobRes = await client.post(`/repos/${owner}/${repo}/git/blobs`, {
    content: readmeContent,
    encoding: "utf-8"
  });
  const blobSha = blobRes.data.sha as string;

  // 6. new tree with README.md
  const treeRes = await client.post(`/repos/${owner}/${repo}/git/trees`, {
    base_tree: baseTreeSha,
    tree: [
      {
        path: "README.md",
        mode: "100644",
        type: "blob",
        sha: blobSha
      }
    ]
  });
  const newTreeSha = treeRes.data.sha as string;

  // 7. commit on new branch
  const commitNewRes = await client.post(`/repos/${owner}/${repo}/git/commits`, {
    message: "chore: update README via RepoCraft",
    tree: newTreeSha,
    parents: [baseCommitSha]
  });
  const newCommitSha = commitNewRes.data.sha as string;

  // 8. move new branch to new commit
  await client.patch(`/repos/${owner}/${repo}/git/refs/heads/${branchName}`, {
    sha: newCommitSha
  });

  // 9. create PR
  const prRes = await client.post(`/repos/${owner}/${repo}/pulls`, {
    title: "Update README via RepoCraft",
    head: branchName,
    base: baseBranch,
    body:
      "This README was generated by RepoCraft. Please review and merge if it looks good."
  });

  return prRes.data; // includes html_url
}
