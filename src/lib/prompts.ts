type Ctx = {
  repoName: string;
  description?: string;
  treeSummary?: string;
  pkgJson?: any;
  readme?: string | null;
  repoUrl?: string;
  keyFileContents?: Map<string, string> | Record<string, string>;
  liveUrl?: string | null;
  projectLanguage?: string;
};

function formatKeyFiles(fileContents?: Map<string, string> | Record<string, string>): string {
  if (!fileContents) return "No key files available";
  
  const entries = fileContents instanceof Map 
    ? Array.from(fileContents.entries())
    : Object.entries(fileContents);
  
  if (entries.length === 0) return "No key files available";
  
  const files = entries
    .map(([path, content]) => {
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
Programming Language(s): ${c.projectLanguage || "Not detected"}
Repository: ${c.repoUrl || "N/A"}
Description: ${c.description || "N/A"}
Live Deployment: ${c.liveUrl || "No live deployment found"}

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
3. **Tech Stack**: List technologies ACTUALLY USED in the code (from imports, config, dependencies)
4. **Installation**: Provide realistic step-by-step instructions based on the project structure and build system
5. **Usage**: Create realistic usage examples based on the actual entry points and available commands
6. **Architecture**: If the code structure suggests it, describe the high-level architecture (e.g., component hierarchy, data flow, module organization)
7. **Contributing & License**: Standard sections

## Language-Specific Context

The project is written in: ${c.projectLanguage || "Mixed languages"}

When writing the README:
- Use appropriate build/run commands for the detected language
- Reference the correct package manager (npm, pip, cargo, gradle, etc.)
- Use correct syntax examples for the language(s) used
- Reference correct file structure conventions for the language

## Critical Rules
- ONLY describe features visible in the source code
- If you cannot confirm something from the code, do NOT include it
- Be specific: instead of "handles data processing", say "implements Dijkstra's algorithm with optimization for real-time routing"
- Include specific file/component names where relevant
- If there are multiple implementations of something, mention both
- Focus on what makes THIS project unique or interesting

Output ONLY valid Markdown for README.md, nothing else. No explanations, no code blocks outside the markdown, just the README content.`;
}

export function buildPortfolioPrompt(c: Ctx) {
  const keyFilesContext = formatKeyFiles(c.keyFileContents);

  return `You are creating a portfolio card based on analyzing ACTUAL SOURCE CODE from a GitHub repository.

CRITICAL: Only describe features and tech YOU CAN CONFIRM from the provided code. Do not add anything imaginary.

## Project Information
Project name: ${c.repoName}
Programming Language(s): ${c.projectLanguage || "Not detected"}
Description: ${c.description || "N/A"}
Repository URL: ${c.repoUrl || "N/A"}
Live URL (if deployed): ${c.liveUrl || "Not set"}

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
  * Bad: "Application with modern technologies"
- **features**: List 3-5 actual features visible in the code
  * Each should be specific and reference actual code patterns you see
  * Include algorithmic features if relevant: "Dual-algorithm comparison with optimization benchmarks"
  * Include architectural features: "Microservices with message queue integration"
- **techStack**: Technologies ACTUALLY USED (from imports, dependencies, config)
  * Extract from config files and actual code imports
  * Only list what you can confirm from the source code
- **githubUrl**: Use provided repo URL
- **liveUrl**: Use the deployment URL if provided, otherwise null

## Language Context
The project is written in: ${c.projectLanguage || "Multiple languages"}

When extracting tech stack, recognize technologies appropriate for the language(s) used.

## Rules
- ONLY extract features from the provided source code
- Be specific and technical
- If you see interesting implementation details (algorithms, patterns, architecture), mention them
- Don't invent features you can't confirm
- Keep descriptions concise but meaningful

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
Programming Language(s): ${c.projectLanguage || "Not detected"}
Description: ${c.description || "N/A"}
Tech stack: ${deps}
Live Deployment: ${c.liveUrl || "Not set"}

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
  Example: "Real-time traffic simulation with dual routing algorithm comparison" (NOT "Application with modern tech")
- **bullets**: 3-4 impactful bullet points that ONLY describe what you can confirm from the code:
  * Use action verbs: Designed, Implemented, Built, Optimized, Engineered, Created, Developed, Architected
  * Include specifics: algorithm names, design patterns, performance improvements, architectural decisions
  * Focus on WHAT and HOW if you can see it in code
  * If you see multiple implementations or strategies, mention them
  * Include metrics ONLY if visible in code (e.g., "reduced latency from 2s to 150ms")
  * Reference actual components/modules/packages by name when relevant
  * For each language, use appropriate terminology (e.g., "Goroutines" for Go, "async/await" for JS, "async functions" for Python)

Examples of GOOD bullets for different languages:
- JavaScript: "Implemented real-time data streaming with WebSocket integration and React hooks for efficient state management"
- Python: "Engineered async FastAPI endpoints with SQLAlchemy ORM and dependency injection for scalable data processing"
- Go: "Built concurrent worker pool using Goroutines and channels for processing 10k+ events per second"
- Rust: "Designed memory-safe concurrent system with Arc and Mutex primitives, eliminating data races"

Examples of BAD bullets:
- "Created a web application" (too generic)
- "Built with modern technologies" (vague)
- "Optimized performance" (no specifics)

## Language Context
The project is primarily written in: ${c.projectLanguage || "Multiple languages"}

Tailor your descriptions to reflect language-specific patterns and best practices.

## Important Rules
- ONLY describe features and functionality visible in the provided source code
- If unsure about something, do NOT include it
- Be specific and quantitative where possible
- Focus on engineering decisions and trade-offs visible in the code
- Use language-appropriate terminology

Return ONLY the JSON object, no additional text.`;
}

export function buildLinkedInPrompt(c: Ctx) {
  const deps = c.pkgJson?.dependencies
    ? Object.keys(c.pkgJson.dependencies).join(", ")
    : "N/A";

  const keyFilesContext = formatKeyFiles(c.keyFileContents);

  return `You are writing a LinkedIn post about a real software project, targeting developers and tech recruiters.

CRITICAL: Base the post on ACTUAL SOURCE CODE and REAL features, not generic marketing language.

## 📋 Project Details
Project name: ${c.repoName}
Programming Language(s): ${c.projectLanguage || "Not detected"}
Description: ${c.description || "N/A"}
Repository: ${c.repoUrl || "N/A"}
Live Deployment: ${c.liveUrl || "Not set"}
Tech: ${deps}

## 💻 Source Code
${keyFilesContext}

## 🎯 Your Task

Write an AUTHENTIC LinkedIn post (2-4 paragraphs) that:
1. 💬 Opens with what the project ACTUALLY DOES (be specific and technical, reference the language/tech)
2. 🔍 Highlights 1-2 interesting technical decisions or implementations visible in the code
3. 💭 Discusses why these design choices matter (performance, reliability, developer experience, scalability, etc.)
4. 🎬 If there's a live deployment URL, mention you can see it in action
5. 📢 Ends with a call to action (check it out, contribute, learn more, or ask a question)

## ✨ Style Requirements
- ✅ Technical but accessible to developers and recruiters
- ✅ Authentic enthusiasm (no corporate speak or cringe)
- ✅ Specific examples from the code
- ✅ Grounded in reality - only mention what's actually in the code
- ✅ Language-appropriate terminology for the tech stack
- ✅ Include 4+ relevant emojis throughout the post (beside achievements, features, tech highlights)
- ✅ 2-4 short paragraphs
- ✅ Optional: 2-4 relevant hashtags at the end

## 🚀 Examples of good hooks for different stacks:
- JavaScript/TypeScript: "Built a real-time data visualization 📊 with React hooks and WebSocket streaming ⚡"
- Python: "Created a high-concurrency async API 🐍 using FastAPI and SQLAlchemy with 10k req/s throughput 🚄"
- Go: "Engineered a concurrent crawler 🕷️ with Goroutines and channels, processing 1M+ events per second 🔥"
- Rust: "Designed memory-safe concurrent processing 🛡️ with zero-copy buffers using Arc and Mutex ⚙️"
- Java/Kotlin: "Implemented a microservices architecture 🏗️ with Spring Boot and reactive streams ⚡ for distributed tracing 🔍"

## 🔧 Language Context
The project is primarily written in: ${c.projectLanguage || "Multiple languages"}

Use language-specific terminology and patterns when describing the technical decisions.

## ⚠️ Anti-patterns (AVOID):
- Generic: "Built a web app with modern tech"
- Vague: "Improved performance significantly"
- Hype: "Revolutionary new approach to..."
- Undefined: Features not visible in the code
- Language-agnostic claims when language-specific details are available
- Too many emojis (max 6-8 throughout the entire post)

## 💡 Emoji Usage Guidelines:
- Use 4+ emojis throughout the post (minimum 4, maximum 8)
- Place them beside technical highlights, achievements, and language/tech mentions
- Common mappings:
  - ⚡ for performance, speed, throughput, async
  - 🔥 for optimization, efficiency, improvements
  - 🛡️ for safety, security, memory safety
  - 📊 for data processing, visualization, analytics
  - 🏗️ for architecture, design patterns, structure
  - 🔍 for analysis, debugging, deep work
  - 💬 for communication, APIs, integration
  - 🎬 for deployment, live demos, action
  - 🐍 for Python
  - ⚙️ for configuration, mechanical work, internals
  - 🕷️ for crawlers, concurrent processing
  - 🚄 for speed, trains, movement
  - 📢 for calls to action, announcements
- Use them naturally in the flow for emphasis

Return ONLY the LinkedIn post text (plain text, no markdown), nothing else.`;
}
