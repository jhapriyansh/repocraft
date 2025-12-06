import axios from "axios";

const BASE = "https://api.github.com";

// Universal file extensions
const INCLUDE_EXTENSIONS = new Set([
  // JavaScript/TypeScript
  "js", "jsx", "ts", "tsx", "mjs", "cjs",
  // Python
  "py", "pyi", "pyc",
  // Java/Kotlin
  "java", "kt", "gradle", "maven",
  // C/C++
  "c", "h", "cpp", "cc", "hpp", "cxx", "c++",
  // Go
  "go",
  // Rust
  "rs",
  // Shell scripts
  "sh", "bash", "zsh", "ps1",
  // Web
  "html", "htm", "vue", "svelte",
  // Styles
  "css", "scss", "sass", "less",
  // Config/Data
  "json", "yaml", "yml", "toml", "ini", "cfg", "conf",
  // Infrastructure
  "tf", "tfvars", "hcl", "dockerfile",
  // Documentation
  "md", "mdx", "rst", "txt",
  // Notebooks
  "ipynb",
  // Build config (generic)
  "xml", "gradle"
]);

const EXCLUDE_EXTENSIONS = new Set([
  // Secrets
  "env", "key", "pem", "p12", "pfx", "pkcs12",
  // Images
  "png", "jpg", "jpeg", "gif", "ico", "svg", "webp", "bmp", "tiff", "psd", "ai",
  // Archives
  "zip", "tar", "gz", "rar", "7z", "bz2",
  // Binaries
  "exe", "dll", "bin", "so", "dylib", "o", "a", "lib",
  // Documents
  "pdf", "docx", "doc", "pptx", "ppt", "xlsx", "xls",
  // Databases
  "sqlite", "db", "sqlite3", "mdb",
  // Generated/Built
  "min.js", "map", "log", "out",
  // System files
  "ds_store", "thumbs.db"
]);

// Key file patterns - highest priority config files
const PRIORITY_CONFIG_PATTERNS = [
  // Package managers
  /package\.json$/,
  /requirements\.txt$/,
  /pyproject\.toml$/,
  /setup\.py$/,
  /setup\.cfg$/,
  /Pipfile$/,
  /poetry\.lock$/,
  /pom\.xml$/,
  /build\.gradle$/,
  /build\.gradle\.kts$/,
  /Gemfile$/,
  /Gemfile\.lock$/,
  /go\.mod$/,
  /go\.sum$/,
  /Cargo\.toml$/,
  /Cargo\.lock$/,
  /composer\.json$/,
  
  // JS/TS Config
  /tsconfig\.json$/,
  /vite\.config\.[jt]sx?$/,
  /next\.config\.[jt]sx?$/,
  /babel\.config\.[jt]sx?$/,
  /jest\.config\.[jt]sx?$/,
  /webpack\.config\.[jt]sx?$/,
  /\.eslintrc/,
  /\.prettierrc/,
  
  // Documentation & Container
  /README\.md$/i,
  /Dockerfile$/,
  /docker-compose\.ya?ml$/,
  /\.github\/workflows\//,
];

// Entry points for common languages
const ENTRY_POINT_PATTERNS = [
  // Python
  /src\/main\.py$/,
  /src\/__main__\.py$/,
  /app\.py$/,
  /main\.py$/,
  // Java
  /src\/main\/java\/.*\.java$/,
  // Go
  /cmd\/.*\/main\.go$/,
  /main\.go$/,
  // Rust
  /src\/main\.rs$/,
  // JS/TS
  /src\/main\.[jt]sx?$/,
  /src\/index\.[jt]sx?$/,
  /src\/app\.[jt]sx?$/,
  /src\/App\.[jt]sx?$/,
  /pages\/index\.[jt]sx?$/,
  /index\.[jt]sx?$/,
];

// Core source file patterns by category
const SOURCE_PATTERNS = [
  // API/Routes
  /src\/(api|routes|server|handlers)\/.*\.(js|ts|py|java|go|rs|php)$/,
  // Models/Data
  /src\/(models|entities|schemas|database)\/.*\.(js|ts|py|java|go|rs)$/,
  // Utils/Helpers
  /src\/(utils|helpers|lib|common)\/.*\.(js|ts|py|java|go|rs)$/,
  // Components (for web)
  /src\/(components|pages|views)\/.*\.(jsx?|tsx?|vue|svelte)$/,
  // Hooks/Services
  /src\/(hooks|services|middleware)\/.*\.(js|ts|py|java|go|rs)$/,
];

const IGNORE_PATTERNS = [
  /node_modules/,
  /\.next/,
  /dist/,
  /build/,
  /out/,
  /target/,
  /\.git/,
  /\.env$/,
  /\.env\.local$/,
  /coverage/,
  /venv/,
  /__pycache__/,
  /\.pytest_cache/,
  /\.venv/,
  /\.idea/,
  /\.vscode/,
  /vendor/,
  /\.gradle/,
  /\.m2/,
  /\.cargo/,
  /\.test\.[jt]sx?$/,
  /\.spec\.[jt]sx?$/,
  /\.min\.js$/,
  /\.map$/,
];

function getFileExtension(path: string): string {
  const match = path.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : "";
}

function shouldIncludeFile(path: string): boolean {
  // Always exclude ignored patterns
  if (IGNORE_PATTERNS.some(p => p.test(path))) return false;
  
  // Get extension
  const ext = getFileExtension(path);
  
  // Include if extension is in allowed list
  if (INCLUDE_EXTENSIONS.has(ext)) return true;
  
  // Include priority config files even if no extension
  if (PRIORITY_CONFIG_PATTERNS.some(p => p.test(path))) return true;
  
  // Special cases: files without extensions
  if (path === "Dockerfile" || path === "Makefile" || path === "Gemfile") return true;
  if (path.startsWith(".github/workflows/")) return true;
  
  return false;
}

function detectProjectLanguage(files: string[], pkgJson: any): string {
  // Check package managers
  if (files.some(f => f.endsWith("package.json"))) return "JavaScript/TypeScript";
  if (files.some(f => f.endsWith(".py"))) return "Python";
  if (files.some(f => f.endsWith(".java"))) return "Java";
  if (files.some(f => f.endsWith(".kt"))) return "Kotlin";
  if (files.some(f => f.endsWith(".go"))) return "Go";
  if (files.some(f => f.endsWith(".rs"))) return "Rust";
  if (files.some(f => f.endsWith(".cpp") || f.endsWith(".cc") || f.endsWith(".cxx"))) return "C++";
  if (files.some(f => f.endsWith(".c"))) return "C";
  if (files.some(f => f.endsWith(".rb"))) return "Ruby";
  if (files.some(f => f.endsWith(".php"))) return "PHP";
  if (files.some(f => f.endsWith(".cs"))) return "C#";
  if (files.some(f => f.endsWith(".swift"))) return "Swift";
  
  return "Multi-language";
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
  
  // Get all valid source files
  const validFiles = allFiles.filter((f: any) => 
    f.type === "blob" && shouldIncludeFile(f.path)
  );
  
  // Separate files by priority
  const priorityConfigs = validFiles.filter((f: any) => 
    PRIORITY_CONFIG_PATTERNS.some(p => p.test(f.path))
  );
  
  const entryPoints = validFiles.filter((f: any) => 
    ENTRY_POINT_PATTERNS.some(p => p.test(f.path)) &&
    !priorityConfigs.some((cf: any) => cf.path === f.path)
  );
  
  const sourceFiles = validFiles.filter((f: any) => 
    SOURCE_PATTERNS.some(p => p.test(f.path)) &&
    !priorityConfigs.some((cf: any) => cf.path === f.path) &&
    !entryPoints.some((ep: any) => ep.path === f.path)
  );
  
  const otherFiles = validFiles.filter((f: any) => 
    !priorityConfigs.some((cf: any) => cf.path === f.path) &&
    !entryPoints.some((ep: any) => ep.path === f.path) &&
    !sourceFiles.some((sf: any) => sf.path === f.path)
  );
  
  // Prioritize: configs → entry points → source files → other files
  const keyFiles = [
    ...priorityConfigs.slice(0, 10).map((f: any) => f.path),
    ...entryPoints.slice(0, 10).map((f: any) => f.path),
    ...sourceFiles.slice(0, 15).map((f: any) => f.path),
    ...otherFiles.slice(0, 5).map((f: any) => f.path)
  ].slice(0, 40); // Total limit 40

  // Detect project language
  const projectLanguage = detectProjectLanguage(keyFiles, pkg);

  return {
    repoInfo,
    tree: treeData,
    readme: readmeData,
    pkgJson: pkg,
    keyFiles, // Return filtered key files
    projectLanguage // Return detected language
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
