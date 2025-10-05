# Edge Concierge (Cloudflare SWE Intern Assignment)

> TypeScript frontend (React on Pages) + **Python backend** (Workers AI + KV + Vectorize + optional Workflows).

## Features
- **LLM**: Llama 3.3 on Workers AI (`@cf/meta/llama-3.3-70b-instruct-fp8-fast`).
- **Workflow/coordination**: Python **Workflows** example (`workflows/weather.py`) – optional.
- **User input**: Chat UI (TypeScript/React).
- **Memory/state**: KV for session chat history (+ Vectorize for long‑term memory snippets).

## Prereqs
- Node 18+, `npm i -g wrangler`.
- Cloudflare account with Workers AI + Vectorize + KV enabled.
- **Create Vectorize index** once:
  ```bash
  wrangler vectorize create edge-mem --dimensions=768 --metric=cosine
  ```
- Create a KV namespace and put the ID into `wrangler.toml` under `[[kv_namespaces]]`.

## Dev
Terminal A – **backend**:
```bash
wrangler dev
```
This serves the Python Worker at `http://127.0.0.1:8787`.

Terminal B – **frontend**:
```bash
cd frontend
npm i
npm run dev
```
Visit `http://localhost:5173` (the Vite dev server proxies `/api/*` to the Worker).

## Deploy
```bash
# Deploy worker (backend)
wrangler deploy

# Build frontend and upload to Pages (manual or CI)
cd frontend && npm run build
# (You can host the dist/ on Pages, or any static host. Set VITE_API_BASE to your Worker URL.)
```

## Environment & Flags
`wrangler.toml` already includes:
- `compatibility_date = "2025-08-01"`
- `flags = ["python_workers", "python_workflows"]`

If your account does not yet have Python Workflows, the app works without it (the weather tool silently no‑ops).

## API
`POST /api/chat` with JSON:
```json
{ "userId": "demo", "message": "Hello" }
```
Returns:
```json
{ "reply": "..." }
```

## Notes
- Session history is stored in KV (`hist:{userId}`), capped to 12 turns, TTL 7 days.
- Long‑term memory is optionally written as short summaries to **Vectorize**.
- If you want to add Realtime voice later, use Cloudflare Realtime and stream transcripts into `/api/chat`.
