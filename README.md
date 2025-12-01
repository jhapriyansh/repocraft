# RepoCraft

RepoCraft is an AI-powered neobrutalist web app that connects to your GitHub
account and turns any repository into:

- A polished `README.md`
- A portfolio project entry (JSON)
- Resume-ready bullet points (JSON)
- A clean LinkedIn post

## Stack

- Next.js 14 (App Router)
- NextAuth (GitHub OAuth, JWT sessions)
- MongoDB + Mongoose
- Tailwind CSS (dark neobrutalism)
- Groq `llama-3.3-70b-versatile`

## Running locally

```bash
npm install
cp .env.example .env.local
# fill env vars
npm run dev
```
