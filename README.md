# RepoCraft

RepoCraft is a developer-focused tool that transforms any GitHub repository into clean, structured, and high-quality content — including READMEs, portfolio entries, resume bullets, and LinkedIn posts.  
It is designed to remove the pain of writing documentation manually and instead generate everything directly from the codebase.

This is **Phase 1** of the project.  
Phase 2 will include:  
- Automatic LinkedIn posting (via LinkedIn OAuth)  
- Asking the user for project screenshots and embedding them into posts  
- Enhanced content styling and templates  

---

## 🚀 Features (Phase 1 Complete)

### **🔗 GitHub Integration**
- Sign in with GitHub OAuth  
- Fetch user repositories with pagination  
- Repository search  
- Repo file-tree summarization  
- Automatic README updates *pushed directly to the repo* (no pull request) upon confirmation

### **🧠 AI-Powered Content Generation (Groq)**
Generate the following from your repository:
- **README.md**
- **Portfolio entry (JSON)**
- **Resume bullets**
- **LinkedIn post**

Streaming output included — content appears in real time.

### **📊 Usage Limits**
- Daily usage counter per user (stored in MongoDB)  
- Auto-resets per day  
- Displays remaining tokens  
- Prevents generation when exhausted

### **💾 File + Repo Details**
- Repo metadata (description, owner, languages)
- File tree summary
- Existing README extraction
- `package.json` parsing (if present)

### **⚡ Instant Push to GitHub**
- Updates README.md directly on `main` (no PR)  
- Handles SHA and base64 correctly  
- Creates file if missing

---

## 🛠️ Tech Stack

### **Frontend**
- Next.js 14 (App Router)
- React
- TailwindCSS (custom terminal theme)
- React Markdown

### **Backend / Server**
- Next.js API Routes
- NextAuth (GitHub Provider, JWT Sessions)
- Mongoose
- Groq SDK (Llama 3.3 70B)

### **Integrations**
- GitHub REST API (Octokit)
- MongoDB Atlas
- Vercel

---

## 📦 Installation (Local Development)

### 1️⃣ Clone the repo
```sh
git clone https://github.com/jhapriyansh/repocraft
cd repocraft
````

### 2️⃣ Install dependencies

```sh
npm install
```

### 3️⃣ Create `.env.local`

Use this template:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=repocraft-secret-key

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/repocraft

GROQ_API_KEY=your_groq_api_key
```

### 4️⃣ Run the dev server

```sh
npm run dev
```

---

## 🌐 Deployment (Vercel)

[Live deployment](https://repocraft-phi.vercel.app/)

Set these environment variables in Vercel:

| Variable             | Example                                                        |
| -------------------- | -------------------------------------------------------------- |
| NEXTAUTH_URL         | [https://yourdomain.vercel.app](https://yourdomain.vercel.app) |
| NEXTAUTH_SECRET      | (random generated)                                             |
| GITHUB_CLIENT_ID     | from GitHub OAuth                                              |
| GITHUB_CLIENT_SECRET | from GitHub OAuth                                              |
| MONGODB_URI          | your MongoDB URI                                               |
| GROQ_API_KEY         | your Groq key                                                  |

### GitHub OAuth callback URL:

```
https://yourdomain.vercel.app/api/auth/callback/github
```

---

## 📁 API Overview

### **Repo Endpoints**

| Method | Endpoint                          | Description                        |
| ------ | --------------------------------- | ---------------------------------- |
| GET    | `/api/repos`                      | Fetch paginated GitHub repos       |
| GET    | `/api/repos/[name]/details`       | File tree, README, package.json    |
| POST   | `/api/repos/[name]/update-readme` | Push new README directly to GitHub |

### **Generation Endpoints**

| Method | Endpoint                  | Output              |
| ------ | ------------------------- | ------------------- |
| POST   | `/api/generate/readme`    | Streaming README.md |
| POST   | `/api/generate/portfolio` | Portfolio JSON      |
| POST   | `/api/generate/resume`    | Resume bullets      |
| POST   | `/api/generate/linkedin`  | LinkedIn post text  |

### **Usage**

| Method | Endpoint     | Description                           |
| ------ | ------------ | ------------------------------------- |
| GET    | `/api/usage` | Returns daily usage + remaining limit |

### **Auth**

| Method   | Endpoint                  | Description   |
| -------- | ------------------------- | ------------- |
| GET/POST | `/api/auth/[...nextauth]` | OAuth session |

---

## 📌 Project Structure

```
src/
├─ app/
│  ├─ dashboard/
│  ├─ repo/[name]/
│  ├─ api/
│  │  ├─ repos/
│  │  ├─ generate/
│  │  └─ usage/
├─ components/
├─ lib/
├─ models/
└─ styles/
```

---

## 🧭 Roadmap (Phase 2)

### **🔜 Automatic LinkedIn Posting**

* LinkedIn OAuth
* Post directly from RepoCraft
* Smart templates
* Upload project screenshots

### **🖼️ Screenshot Collection**

* Ask user to upload:

  * Dashboard preview
  * Feature screenshots
  * Code snippets
* Auto-embed into generated LinkedIn post

### **📚 Multiple Style Templates**

* “Professional”
* “Casual dev log”
* “Storytelling”
* “Technical deep-dive”

### **📦 Export Options**

* Download README.md, JSON, TXT
* Export portfolio data to Notion

---

## 🤝 Contributing

Pull requests, issues, and feature suggestions are welcome.
