type Ctx = {
  repoName: string;
  description?: string;
  treeSummary?: string;
  pkgJson?: any;
  readme?: string | null;
  repoUrl?: string;
};

export function buildReadmePrompt(c: Ctx) {
  const deps = c.pkgJson?.dependencies
    ? Object.keys(c.pkgJson.dependencies).join(", ")
    : "Not detected";

  return `
Generate a professional README.md for this project.

Project name: ${c.repoName}
Description: ${c.description || "N/A"}
Dependencies: ${deps}
File tree (truncated): ${c.treeSummary || "N/A"}
Existing README (if any): ${c.readme || "None"}
Repo URL: ${c.repoUrl || "N/A"}

README requirements:
- Clear title and one-paragraph overview
- Features list
- Tech Stack
- Installation (step-by-step)
- Usage / How to run
- Optional: Configuration / environment variables
- Optional: API endpoints section if it looks like a backend
- Contributing and License sections

Output ONLY valid Markdown for README.md, no extra commentary.
`;
}

export function buildPortfolioPrompt(c: Ctx) {
  return `
You are creating a portfolio card for a developer's personal site.

Return a JSON object with this exact shape:

{
  "title": string,
  "shortDescription": string,
  "features": string[],
  "techStack": string[],
  "githubUrl": string,
  "liveUrl": string | null
}

Project name: ${c.repoName}
Description: ${c.description || "N/A"}
Repo URL: ${c.repoUrl || "N/A"}

Keep it honest, concise, and readable.
`;
}

export function buildResumePrompt(c: Ctx) {
  return `
Generate resume content for a software engineering project.

Return JSON with this shape:

{
  "summary": string,
  "bullets": string[]
}

Constraints:
- Summary: 1 line, crisp
- 2–4 bullet points
- Engineering tone
- Include realistic metrics only if they are safe to infer (no lies)
- Use strong action verbs
- Focus on impact (performance, reliability, DX, etc.)

Project name: ${c.repoName}
Description: ${c.description || "N/A"}
Tech context: ${
    c.pkgJson?.dependencies
      ? Object.keys(c.pkgJson.dependencies).join(", ")
      : "Unknown"
  }
`;
}

export function buildLinkedInPrompt(c: Ctx) {
  return `
Write a LinkedIn post announcing this project.

Requirements:
- 2–4 short paragraphs
- No cringe, no fake hype
- No emojis
- Optional: a few relevant hashtags at the end
- Audience: other developers and recruiters

Project name: ${c.repoName}
Description: ${c.description || "N/A"}
Repo URL: ${c.repoUrl || "N/A"}

Return plain text only.
`;
}
