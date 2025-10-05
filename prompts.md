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
