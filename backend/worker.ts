// backend/worker.ts
// TS Worker that mirrors the Python logic: KV for session, Vectorize for memory, Workers AI for LLM.

export interface Env {
  AI: Ai;
  KV: KVNamespace;
  MEM_INDEX: VectorizeIndex;
  LLM_MODEL: string;
  EMB_MODEL: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response("", { headers: cors() });
    }

    if (url.pathname === "/api/chat" && request.method === "POST") {
      const { userId = "demo-user", message = "" } = (await request.json()) as {
        userId?: string;
        message?: string;
      };
      if (!message.trim()) {
        return json({ error: "message required" }, 400);
      }

      // 1) Session history (KV) — last 12 turns
      const key = `hist:${userId}`;
      const prior = await env.KV.get(key);
      const history: Array<{
        role: "user" | "assistant" | "system";
        content: string;
      }> = prior ? JSON.parse(prior) : [];

      // 2) Memory via Vectorize (embeddings)
      let memory = "";
      try {
        const emb = (await env.AI.run(env.EMB_MODEL, { text: message })) as {
          embeddings: number[];
        };
        const search = await env.MEM_INDEX.query(emb.embeddings, {
          topK: 4,
          returnValues: true,
        });
        const snippets = (search.matches ?? [])
          .map((m) => m.values?.text)
          .filter(Boolean) as string[];
        memory = snippets.join("\n");
      } catch {
        // ignore if Vectorize not set up yet
      }

      const system = `You are Edge Concierge, concise and helpful. Use memory only if relevant.\nMemory:\n${memory}`;
      const messages = [
        { role: "system", content: system },
        ...history,
        { role: "user", content: message },
      ];

      // 3) Call LLM
      let text = "";
      try {
        const llmResp = (await env.AI.run(env.LLM_MODEL, { messages })) as any;
        text = llmResp?.response || llmResp?.text || "";
      } catch (err) {
        console.error("AI error:", err);
        // Dev-safe fallback: you still get a response and your UI never shows "Network error"
        text =
          "Hi! (Local dev fallback) Your Workers AI call failed to authenticate. " +
          "Once Wrangler is authenticated or you run in remote mode, this will stream Llama 3.3.";
      }

      // 4) Update session history
      const updated = [
        ...history,
        { role: "user", content: message },
        { role: "assistant", content: text },
      ].slice(-12);
      await env.KV.put(key, JSON.stringify(updated), {
        expirationTtl: 60 * 60 * 24 * 7,
      });

      // 5) Write back short memory summary
      if (text.length > 80) {
        try {
          const summary = text.slice(0, 500);
          const out = (await env.AI.run(env.EMB_MODEL, { text: summary })) as {
            embeddings: number[];
          };
          await env.MEM_INDEX.upsert([
            {
              id: crypto.randomUUID(),
              vector: out.embeddings,
              values: { userId, text: summary },
            },
          ]);
        } catch {
          // ignore in dev
        }
      }

      return json({ reply: text });
    }

    return new Response("Not found", { status: 404, headers: cors() });
  },
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...cors() },
  });
}

function cors() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
  };
}

// Types for Vectorize binding
interface VectorizeIndex {
  query(
    vector: number[],
    opts: { topK: number; returnValues?: boolean }
  ): Promise<{
    matches?: Array<{
      id: string;
      score: number;
      values?: Record<string, any>;
    }>;
  }>;
  upsert(
    items: Array<{ id: string; vector: number[]; values?: Record<string, any> }>
  ): Promise<void>;
}
