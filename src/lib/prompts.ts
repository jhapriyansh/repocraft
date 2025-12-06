type Ctx = {
  repoName: string;
  description?: string;
  treeSummary?: string;
  pkgJson?: any;
  readme?: string | null;
  repoUrl?: string;
  keyFileContents?: Map<string, string> | Record<string, string>;
};

// Helper to format file contents for context (token-aware)
function formatKeyFiles(fileContents?: Map<string, string> | Record<string, string>): string {
  if (!fileContents) return "No key files available";
  
  const entries = fileContents instanceof Map 
    ? Array.from(fileContents.entries())
    : Object.entries(fileContents);
  
  if (entries.length === 0) return "No key files available";
  
  const files = entries
    .map(([path, content]) => {
      // Truncate large files
      const truncated = content.length > 2000 
        ? content.substring(0, 2000) + "\n... [truncated]"
        : content;
      return `\n=== ${path} ===\n${truncated}`;
    })
    .join("\n");
  
  return files;
}

export function buildReadmePrompt(c: Ctx) {
  const deps = c.pkgJson?.dependencies
    ? Object.keys(c.pkgJson.dependencies).join(", ")
    : "Not detected";

  const devDeps = c.pkgJson?.devDependencies
    ? Object.keys(c.pkgJson.devDependencies).join(", ")
    : "";

  const keyFilesContext = formatKeyFiles(c.keyFileContents);

  const scripts = c.pkgJson?.scripts ? Object.entries(c.pkgJson.scripts).map(([name, cmd]: [string, any]) => `  - \`npm run ${name}\`: ${cmd}`).join("\n") : "N/A";

  return `You are an expert technical writer analyzing a real GitHub repository to generate accurate documentation.

CRITICAL: You MUST analyze the provided source code and extract actual features, functionality, and architecture. Do NOT make up features.

## Repository Context

Project name: ${c.repoName}
Repository: ${c.repoUrl || "N/A"}
Description: ${c.description || "N/A"}

## Source Code Files

${keyFilesContext}

## Dependencies

### Production Dependencies:
${deps}

### Development Dependencies:
${devDeps}

## Build & Run Scripts:
${scripts}

## Existing Documentation:
${c.readme ? c.readme.substring(0, 500) : "None"}

## Your Task

Generate a **professional, accurate README.md** by analyzing the provided source code. Follow these rules STRICTLY:

1. **Title & Overview**: Create a clear title and 2-3 sentence overview that accurately describes what this project DOES (not what it could do)
2. **Features**: List only features you can CONFIRM from the code. Look for:
   - Main components and what they do
   - Algorithms or logic visible in the code
   - APIs or endpoints exposed
   - Data structures or models used
   - Integration points
3. **Tech Stack**: List technologies ACTUALLY USED in the code (from imports, config, package.json)
4. **Installation**: Provide realistic step-by-step instructions based on package.json and project structure
5. **Usage**: Create realistic usage examples based on the actual entry points and scripts available
6. **Architecture**: If the code structure suggests it, describe the high-level architecture (e.g., component hierarchy, data flow)
7. **Contributing & License**: Standard sections

## Critical Rules
- ONLY describe features visible in the source code
- If you cannot confirm something from the code, do NOT include it
- Be specific: instead of "handles data processing", say "implements Dijkstra's algorithm with optimization for real-time routing"
- Include specific file/component names where relevant
- If there are multiple implementations of something (e.g., two routing algorithms), mention both
- Focus on what makes THIS project unique or interesting

Output ONLY valid Markdown for README.md, nothing else. No explanations, no code blocks outside the markdown, just the README content.`;
}

export function buildPortfolioPrompt(c: Ctx) {
  const keyFilesContext = formatKeyFiles(c.keyFileContents);

  return `You are creating a portfolio card based on analyzing ACTUAL SOURCE CODE from a GitHub repository.

CRITICAL: Only describe features and tech YOU CAN CONFIRM from the provided code. Do not add anything imaginary.

## Project Information
Project name: ${c.repoName}
Description: ${c.description || "N/A"}
Repository URL: ${c.repoUrl || "N/A"}

## Source Code to Analyze
${keyFilesContext}

## Your Task

Create a portfolio card in this JSON format:
\`\`\`json
{
  "title": string,
  "shortDescription": string,
  "features": string[],
  "techStack": string[],
  "githubUrl": string,
  "liveUrl": string | null
}
\`\`\`

Field Requirements:
- **title**: Project name or creative title reflecting what it actually does
- **shortDescription**: 1-2 sentences describing the PROJECT PURPOSE (specific to the code, not generic)
  * Good: "Real-time traffic simulator comparing standard vs optimized Dijkstra routing"
  * Bad: "React application with Vite"
- **features**: List 3-5 actual features visible in the code
  * Each should be specific: "Interactive map visualization with Leaflet" not just "Map support"
  * Include algorithmic features if relevant: "Dual-algorithm comparison (standard & optimized Dijkstra)"
- **techStack**: Technologies ACTUALLY USED (from imports, dependencies, config)
  * Extract from package.json and actual code imports
  * Only list what you can confirm
- **githubUrl**: Use provided repo URL
- **liveUrl**: Set to null unless you see clear evidence of deployment configuration

## Rules
- ONLY extract features from the provided source code
- Be specific and technical
- If you see interesting implementation details (algorithms, patterns), mention them
- Don't invent features you can't confirm
- Keep descriptions concise

Return ONLY the JSON object (valid JSON), no markdown, no explanations.`;
}

export function buildResumePrompt(c: Ctx) {
  const deps = c.pkgJson?.dependencies
    ? Object.keys(c.pkgJson.dependencies).join(", ")
    : "Unknown";

  const keyFilesContext = formatKeyFiles(c.keyFileContents);

  return `You are creating resume bullet points for a software engineer based on analyzing ACTUAL SOURCE CODE.

CRITICAL: Extract REAL technical accomplishments from the code, not generic descriptions.

## Project Information
Project name: ${c.repoName}
Description: ${c.description || "N/A"}
Tech stack: ${deps}

## Source Code to Analyze
${keyFilesContext}

## Your Task

Generate resume content in this JSON format:
\`\`\`json
{
  "summary": string,
  "bullets": string[]
}
\`\`\`

Requirements:
- **summary**: 1 line that captures the PROJECT'S PURPOSE (not generic, specific to this codebase)
  Example: "Real-time traffic simulation with dual routing algorithm comparison" (NOT "React application with Vite")
- **bullets**: 3-4 impactful bullet points that ONLY describe what you can confirm from the code:
  * Use action verbs: Designed, Implemented, Built, Optimized, Engineered, Created, Developed
  * Include specifics: algorithm names, performance improvements, architectural decisions
  * Focus on WHAT and HOW if you can see it in code
  * If you see multiple implementations (e.g., two versions of an algorithm), mention both
  * Include metrics ONLY if visible in code (e.g., "optimized from 2000ms to 150ms")
  * Reference actual components/modules by name when relevant

Examples of GOOD bullets:
- "Implemented dual-path routing algorithms: standard Dijkstra and optimized variant with O(n log n) complexity"
- "Built interactive map visualization using Leaflet with real-time traffic flow updates"
- "Engineered modular component architecture with separation of concerns between routing logic and UI"

Examples of BAD bullets:
- "Created a web application" (too generic)
- "Built with modern technologies" (vague)
- "Optimized performance" (no specifics)

## Important Rules
- ONLY describe features and functionality visible in the provided source code
- If unsure about something, do NOT include it
- Be specific and quantitative where possible
- Focus on engineering decisions and trade-offs visible in the code

Return ONLY the JSON object, no additional text.`;
}

export function buildLinkedInPrompt(c: Ctx) {
  const deps = c.pkgJson?.dependencies
    ? Object.keys(c.pkgJson.dependencies).join(", ")
    : "N/A";

  const keyFilesContext = formatKeyFiles(c.keyFileContents);

  return `You are writing a LinkedIn post about a real software project, targeting developers and tech recruiters.

CRITICAL: Base the post on ACTUAL SOURCE CODE and REAL features, not generic marketing language.

## Project Details
Project name: ${c.repoName}
Description: ${c.description || "N/A"}
Repository: ${c.repoUrl || "N/A"}
Tech: ${deps}

## Source Code
${keyFilesContext}

## Your Task

Write an AUTHENTIC LinkedIn post (2-4 paragraphs) that:
1. Opens with what the project ACTUALLY DOES (be specific and technical)
2. Highlights 1-2 interesting technical decisions or implementations visible in the code
3. Discusses why these design choices matter (performance, reliability, developer experience, etc.)
4. Ends with a call to action (check it out, contribute, learn more)

## Style Requirements
- ✅ Technical but accessible to developers and recruiters
- ✅ Authentic enthusiasm (no corporate speak or cringe)
- ✅ Specific examples from the code
- ✅ Grounded in reality - only mention what's actually in the code
- ✅ NO emojis
- ✅ 2-4 short paragraphs
- ✅ Optional: 2-4 relevant hashtags at the end

## Examples of good hooks:
- "Built a real-time traffic simulator with dual routing algorithms - standard Dijkstra vs optimized approach"
- "Created an interactive visualization comparing algorithm efficiency in real-time routing scenarios"
- "Engineered a React + Vite stack with Leaflet for high-performance interactive maps"

## Anti-patterns (AVOID):
- Generic: "Built a web app with modern tech"
- Vague: "Improved performance significantly"
- Hype: "Revolutionary new approach to..."
- Undefined: Features not visible in the code

Return ONLY the LinkedIn post text (plain text, no markdown), nothing else.`;
}
