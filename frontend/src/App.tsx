import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE || "";

type Bubble = { role: "user" | "assistant"; text: string };

export default function App() {
  const [lines, setLines] = useState<Bubble[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [lines]);

  async function send() {
    const message = input.trim();
    if (!message || sending) return;
    setSending(true);
    setInput("");
    setLines((l) => [...l, { role: "user", text: message }]);
    try {
      const r = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ userId: "demo", message })
      });
      const data = await r.json();
      setLines((l) => [...l, { role: "assistant", text: String(data?.reply ?? "") }]);
    } catch {
      setLines((l) => [...l, { role: "assistant", text: "⚠️ Network error, try again." }]);
    } finally {
      setSending(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/5 backdrop-blur-sm bg-black/20">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <motion.h1 initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="text-xl md:text-2xl font-semibold tracking-tight">
            Edge Concierge
          </motion.h1>
          <div className="text-xs md:text-sm text-white/60">Llama 3.3 · Vectorize memory</div>
        </div>
      </header>

      {/* Hero strip */}
      <section className="mx-auto max-w-4xl px-4 pt-10 pb-4 w-full">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="tilt rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,.35)] border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-sm">
          <div className="p-6 md:p-8">
            <h2 className="text-2xl md:text-3xl font-semibold leading-tight">Minimal AI chat with memory.</h2>
            <p className="mt-2 text-white/70">Fast, subtle 3D, and delightful motion—running on Cloudflare Workers AI.</p>
          </div>
        </motion.div>
      </section>

      {/* Chat card */}
      <main className="mx-auto max-w-4xl px-4 w-full flex-1 pb-24">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,.35)] tilt">
          <div ref={scrollerRef} className="chat-scroll h-[56vh] md:h-[62vh] overflow-y-auto p-5 md:p-6">
            {lines.length === 0 ? <EmptyState /> : (
              <div className="space-y-4">
                {lines.map((l, i) => <ChatBubble key={i} role={l.role} text={l.text} />)}
                {sending && <TypingIndicator />}
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="p-4 md:p-5 border-t border-white/10">
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-full bg-white/[0.06] border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-white/10 placeholder:text-white/40"
                placeholder="Ask anything… (⌘/Ctrl + Enter to send)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={sending}
              />
              <button
                onClick={send}
                disabled={sending}
                className="rounded-full px-5 py-3 bg-white text-black font-medium disabled:opacity-60 hover:opacity-90 transition-opacity"
                title="Send (⌘/Ctrl + Enter)"
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="mx-auto max-w-4xl px-4 py-6 text-xs text-white/50">
        Pro tip: say “remember that I prefer concise answers” — it’ll store a lightweight memory.
      </footer>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full grid place-items-center text-center">
      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <div className="mx-auto size-16 rounded-2xl bg-white/[0.07] border border-white/10" />
        <div className="text-white/70">Start a conversation. Your session persists and gets smarter.</div>
      </motion.div>
    </div>
  );
}

function ChatBubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isUser = role === "user";
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={[
        "max-w-[90%] md:max-w-[75%] rounded-2xl px-4 py-3 leading-relaxed border",
        isUser ? "bg-white text-black border-white/80 shadow"
               : "bg-white/[0.05] text-white border-white/10 backdrop-blur-sm"
      ].join(" ")} style={{ transform: "translateZ(1px)" }}>
        {text}
      </div>
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="rounded-xl px-3 py-2 bg-white/[0.05] border border-white/10">
        <span className="inline-flex gap-1 align-middle">
          <span className="typing-dot inline-block w-2 h-2 rounded-full bg-white/70" />
          <span className="typing-dot inline-block w-2 h-2 rounded-full bg-white/70" />
          <span className="typing-dot inline-block w-2 h-2 rounded-full bg-white/70" />
        </span>
      </div>
    </div>
  );
}
