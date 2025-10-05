export interface Env {
  AI: Ai;                       // Workers AI binding (@cloudflare/workers-types)
  KV: KVNamespace;              // KV binding (session history)
  MEM_INDEX: VectorizeIndex;    // Vectorize binding (long-term memory)
  LLM_MODEL: string;            // e.g., "@cf/meta/llama-3.3-70b-instruct-fp8-fast"
  EMB_MODEL: string;            // e.g., "@cf/baai/bge-base-en-v1.5"
}

// Minimal Vectorize binding types (enough for this Worker)
interface VectorizeIndex {
  query(
    vector: number[],
    opts: { topK: number; returnValues?: boolean }
  ): Promise<{
    matches?: Array<{ id: string; score: number; values?: Record<string, any> }>;
  }>;

  upsert(items: Array<{ id: string; vector: number[]; values?: Record<string, any> }>): Promise<void>;
}

type Msg = { role: "system" | "user" | "assistant"; content: string };

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") return new Response("", { headers: cors() });

    // Simple health check
    if (url.pathname === "/health") {
      return json({ ok: true, service: "edge-concierge" });
    }

    // Chat endpoint
    if (url.pathname === "/api/chat" && request.method === "POST") {
      let payload: { userId?: string; message?: string };
      try {
        payload = await request.json();
      } catch {
        return json({ error: "invalid JSON body" }, 400);
      }

      const userId = (payload.userId || "demo-user").trim();
      const message = (payload.message || "").trim();
      if (!message) return json({ error: "message required" }, 400);

      // 1) Load short-term history from KV (last 12 turns)
      const kvKey = `hist:${userId}`;
      const prior = await env.KV.get(kvKey);
      const history: Msg[] = prior ? (JSON.parse(prior) as Msg[]) : [];

      // 2) Retrieve memory from Vectorize (guarded for local dev)
      let memory = "";
      try {
        const emb = (await env.AI.run(env.EMB_MODEL, { text: message })) as { embeddings: number[] };
        const search = await env.MEM_INDEX.query(emb.embeddings, { topK: 4, returnValues: true });
        const snippets =
          (search.matches ?? [])
            .map((m) => m.values?.text)
            .filter(Boolean) as string[];
        memory = snippets.join("\n");
      } catch (err) {
        // Vectorize isn’t supported in pure-local dev; keep going without memory.
        console.warn("Vectorize/embeddings unavailable in dev:", err);
      }

      // 3) Simple tool orchestration (Weather) — makes coordination explicit
      let toolNote = "";
      try {
        if (/\b(weather|forecast|temperature)\b/i.test(message)) {
          const city = "San Francisco"; // you can parse city from message if you like
          const r = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`);
          const d = await r.json();
          const today = d?.weather?.[0];
          const summary = today
            ? `Weather ${city}: ${today.avgtempF}°F avg, rain ${today.hourly?.[0]?.chanceofrain}%`
            : "Weather service unavailable";
          toolNote = `\nTool(weather): ${summary}`;
        }
      } catch (err) {
        console.warn("Weather tool failed (continuing):", err);
      }

      // 4) Build prompt
      const system = [
        "You are Edge Concierge, concise and helpful.",
        "Use retrieved memory only if relevant.",
        toolNote ? toolNote : "",
        "Memory:",
        memory || "(none)"
      ]
        .filter(Boolean)
        .join("\n");

      const messages: Msg[] = [{ role: "system", content: system }, ...history, { role: "user", content: message }];

      // 5) Call LLM (safe in dev — always return JSON even on auth errors)
      let text = "";
      try {
        const llmResp = (await env.AI.run(env.LLM_MODEL, { messages })) as any;
        text = llmResp?.response || llmResp?.text || "";
      } catch (err) {
        console.error("AI error:", err);
        text =
          "Hi! (Local dev fallback) Your Workers AI call didn’t authenticate. " +
          "Once Wrangler is logged in or you run in remote mode, this will use Llama 3.3.";
      }

      // 6) Update short-term history in KV
      const updated = [...history, { role: "user", content: message }, { role: "assistant", content: text }].slice(-12);
      await env.KV.put(kvKey, JSON.stringify(updated), { expirationTtl: 60 * 60 * 24 * 7 }); // keep 7 days

      // 7) Write back a short summary to Vectorize (best-effort)
      if (text && text.length > 80) {
        try {
          const summary = text.slice(0, 500);
          const out = (await env.AI.run(env.EMB_MODEL, { text: summary })) as { embeddings: number[] };
          await env.MEM_INDEX.upsert([
            { id: crypto.randomUUID(), vector: out.embeddings, values: { userId, text: summary } }
          ]);
        } catch (err) {
          console.warn("Vectorize writeback skipped:", err);
        }
      }

      return json({ reply: text });
    }

    return new Response("Not found", { status: 404, headers: cors() });
  }
};

// Helpers
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...cors() }
  });
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type"
  };
}
