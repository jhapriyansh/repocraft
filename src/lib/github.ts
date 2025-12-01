import axios from "axios";

const BASE = "https://api.github.com";

export async function fetchUserRepos(token: string) {
  const res = await axios.get(`${BASE}/user/repos`, {
    headers: { Authorization: `Bearer ${token}` },
    params: {
      sort: "updated",
      per_page: 100
    }
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

  return {
    repoInfo,
    tree: treeData,
    readme: readmeData,
    pkgJson: pkg
  };
}
