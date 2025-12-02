# **RepoCraft — AI-Powered Repository Documentation Generator**

RepoCraft is a lightweight developer tool that automatically turns any GitHub repository into clean, production-ready documentation.
It generates **README files, portfolio entries, resume bullets, and LinkedIn posts** directly from your codebase — helping developers showcase their work faster.

---

## 🚀 Features

* **AI-generated README.md** based on repository structure
* **Portfolio JSON entries** for quick website updates
* **Resume bullet-points** extracted from real technical contributions
* **LinkedIn post summaries** for easy project sharing
* **GitHub OAuth login** + full repo access
* **Automatic usage tracking** with daily limits
* **Terminal-themed UI** with file-tree previews and streaming output
* **One-click README commit** (via GitHub API)

---

## 🛠 Tech Stack

### **Frontend**

* Next.js (App Router)
* React
* Tailwind CSS
* React Markdown

### **Backend**

* Next.js API Routes
* NextAuth (GitHub OAuth)
* MongoDB + Mongoose
* Groq LLaMA-3.3 API
* Octokit (GitHub API)

---

## 📦 Installation

```bash
git clone https://github.com/jhapriyansh/repocraft
cd repocraft
npm install
```

### **Environment Variables**

```
DATABASE_URL=<your-mongodb-uri>
GITHUB_CLIENT_ID=<your-oauth-client-id>
GITHUB_CLIENT_SECRET=<your-oauth-client-secret>
NEXTAUTH_SECRET=<random secret>
```

---

## ▶️ Usage

```bash
npm run dev
```

Then open:

🔗 [http://localhost:3000](http://localhost:3000)

Log in with GitHub → select a repository → generate any output.

---

## 🔌 API Endpoints

| Method | Endpoint                          | Description               |
| ------ | --------------------------------- | ------------------------- |
| GET    | `/api/repos`                      | List user repos           |
| GET    | `/api/repos/[name]/details`       | Repo metadata + file tree |
| POST   | `/api/repos/[name]/update-readme` | Commit README to repo     |
| GET    | `/api/usage`                      | Daily usage quota         |
| POST   | `/api/generate/readme`            | Generate README           |
| POST   | `/api/generate/portfolio`         | Generate portfolio JSON   |
| POST   | `/api/generate/resume`            | Generate resume bullets   |
| POST   | `/api/generate/linkedin`          | Generate LinkedIn post    |

---

## 🤝 Contributing

Pull requests are welcome — bug fixes, features, UI polish, anything!

---

# 🌐 Live Demo

👉 **[https://repocraft-phi.vercel.app](https://repocraft-phi.vercel.app)**
