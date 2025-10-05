# Edge Concierge — Cloudflare AI (Chat + Memory)

**Stack:**  
- **Frontend:** Vite + React (TypeScript), Tailwind v4, Framer Motion  
- **Backend:** Cloudflare Worker (TypeScript) calling **Workers AI** (Llama 3.3)  
- **State/Memory:** KV (short-term chat history) + Vectorize (long-term snippets)

**Why it stands out:** Minimal, fast, 3D-tinged UI; memory-augmented replies; safe local dev fallback; tool orchestration snippet to demonstrate coordination.

---

## ✨ Features
- **LLM on Workers AI:** `@cf/meta/llama-3.3-70b-instruct-fp8-fast`
- **Chat UI:** polished, minimal, smooth scroll & subtle 3D tilt
- **Memory:** KV session history + Vectorize summaries
- **Coordination:** Worker orchestrates memory → optional tool (weather) → LLM  
  *(You can flip in Durable Objects / Workflows later if your account has access.)*

---

## 🧰 Prerequisites
- Node 18+
- `npm i -g wrangler` and Cloudflare account
- A workers.dev subdomain (for remote dev & deploy)

---

## ⚙️ Local Development

### 1) Backend (Worker)
```bash
# from repo root
wrangler dev --local
# Ready at http://127.0.0.1:8787
Dev-safe fallback: If Workers AI auth isn’t set up yet, the Worker returns a friendly fallback string so the UI never 500s.

2) Frontend
bash
Copy code
cd frontend
npm install
npm run dev
# http://localhost:5173
How it connects:

vite.config.ts proxies /api → http://127.0.0.1:8787 in dev, so the UI calls /api/chat.

🧩 Required Cloudflare resources (before deploy)
Create once, then paste IDs into wrangler.toml as needed:

bash
Copy code
# KV (auto-writes to wrangler.toml if you add --update-config)
wrangler kv namespace create edge-concierge-kv --binding=KV --update-config

# Vectorize (dimensions match @cf/baai/bge-base-en-v1.5)
wrangler vectorize create edge-mem --dimensions=768 --metric=cosine
🚀 Deploy
bash
Copy code
# Backend
wrangler deploy
# Prints https://<name>.<subdomain>.workers.dev

# Frontend
cd frontend
npm run build
# Upload dist/ to Cloudflare Pages (dash) or connect repo to Pages
Production base URL:
If you host the frontend somewhere other than the Worker subdomain, set:

php-template
Copy code
frontend/.env  →  VITE_API_BASE=https://<your-worker>.<subdomain>.workers.dev
Rebuild: npm run build.

🔌 Optional “tool” (coordination demo)
Add this block in backend/worker.ts before calling the LLM:

ts
Copy code
let toolNote = "";
try {
  if (/weather|forecast|temperature/i.test(message)) {
    const r = await fetch("https://wttr.in/San%20Francisco?format=j1");
    const d = await r.json();
    const today = d?.weather?.[0];
    const summary = today
      ? `Weather SF: ${today.avgtempF}°F, rain ${today.hourly?.[0]?.chanceofrain}%`
      : "Weather service unavailable";
    toolNote = `\nTool(weather): ${summary}`;
  }
} catch {}
…then append to your system prompt:

ts
Copy code
const system = `You are Edge Concierge, concise and helpful.
Use memory only if relevant.${toolNote ? "\n" + toolNote : ""}\nMemory:\n${memory}`;
This makes “workflow/coordination” explicit (memory → tool → LLM).

🧪 Quick tests
Ping: curl -s http://127.0.0.1:8787/ -i → 404 (expected; only /api/chat)

Chat:

bash
Copy code
curl -s -X POST http://127.0.0.1:8787/api/chat \
  -H 'content-type: application/json' \
  -d '{"userId":"demo","message":"hello"}'
Memory: “remember I prefer concise answers.” → send another question → reply tone shortens.

🔒 Notes on dev vs prod
Workers AI calls require account auth; if not available locally, the Worker returns a safe fallback to keep the UI running.

Vectorize isn’t supported in pure-local; it’s already try/catched.

🗺️ Folder map
bash
Copy code
cf_ai_edge_concierge/
├─ backend/
│  └─ worker.ts              # Worker: memory + tool + LLM
├─ frontend/
│  ├─ src/App.tsx            # Minimal 3D chat UI
│  ├─ src/main.tsx
│  ├─ src/index.css          # Tailwind v4 + custom styles
│  └─ vite.config.ts         # dev proxy
├─ wrangler.toml
├─ README.md
└─ PROMPTS.md                # prompts you used (see template)
🧾 License & originality
This project is original to the author. AI assistance was used for code generation and refactoring (see PROMPTS.md).

pgsql
Copy code

## B) Add `PROMPTS.md`

Create `PROMPTS.md` in the repo root and paste this template, then **fill in your actual prompts you used** (you can summarize them):

```markdown
# PROMPTS.md

A record of AI-assisted coding prompts used while building **cf_ai_edge_concierge**.

> NOTE: All work is original to this repository’s author; prompts below document assistance context.

---

## System / context prompts
- “Build a Cloudflare-native AI chat (Workers AI + KV + Vectorize) with a TS Worker and TS React frontend.”

## Implementation prompts (examples — replace with your real ones)
- “Generate a TypeScript Cloudflare Worker that exposes POST /api/chat, stores last 12 turns in KV, queries Vectorize for memory, and calls @cf/meta/llama-3.3-70b-instruct-fp8-fast.”
- “Create a minimal React + Tailwind v4 chat UI with 3D tilt, smooth scroll, typing indicator.”
- “Harden the Worker: wrap AI call in try/catch and return a dev-friendly fallback string.”

## Styling prompts
- “Aurora gradient background, glass card, rounded pill input, subtle shadows, modern dark theme.”

## Fixes / debugging
- “Tailwind v4 with Vite: set @tailwindcss/postcss in postcss.config.js.”
- “Wrangler config: point main to ./backend/worker.ts, remove workflows object schema.”
