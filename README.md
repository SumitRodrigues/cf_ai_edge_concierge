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
`
# from repo root
wrangler dev --local
# Ready at http://127.0.0.1:8787
Dev-safe fallback: If Workers AI auth isn’t set up yet, the Worker returns a friendly fallback string so the UI never 500s.`

---

2) Frontend

cd frontend
npm install
npm run dev
# http://localhost:5173
How it connects:

vite.config.ts proxies /api → http://127.0.0.1:8787 in dev, so the UI calls /api/chat.

🧩 Required Cloudflare resources (before deploy)
Create once, then paste IDs into wrangler.toml as needed:

# KV (auto-writes to wrangler.toml if you add --update-config)
wrangler kv namespace create edge-concierge-kv --binding=KV --update-config

# Vectorize (dimensions match @cf/baai/bge-base-en-v1.5)
wrangler vectorize create edge-mem --dimensions=768 --metric=cosine

---

🚀 Deploy

# Backend
wrangler deploy
# Prints https://<name>.<subdomain>.workers.dev

# Frontend
cd frontend
npm run build
# Upload dist/ to Cloudflare Pages (dash) or connect repo to Pages
Production base URL:
If you host the frontend somewhere other than the Worker subdomain, set:

frontend/.env  →  VITE_API_BASE=https://<your-worker>.<subdomain>.workers.dev
Rebuild: npm run build.

🔌 Optional “tool” (coordination demo)
Add this block in backend/worker.ts before calling the LLM:


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
