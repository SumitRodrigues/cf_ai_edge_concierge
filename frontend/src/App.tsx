import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const API_BASE = import.meta.env.VITE_API_BASE || "";

type Bubble = { role: "user" | "assistant"; text: string };

function Logo({ className = "size-6" }: { className?: string }) {
  // Minimal inline logo (gradient orb) so you don't need an asset file.
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <radialGradient id="g" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="#8fd3ff" />
          <stop offset="60%" stopColor="#5b79ff" />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
      </defs>
      <circle cx="12" cy="12" r="10" fill="url(#g)" />
      <circle cx="12" cy="12" r="9" fill="rgba(255,255,255,.05)" />
    </svg>
  );
}

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

  // Send on plain Enter (no Ctrl/⌘ required)
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/5 backdrop-blur-sm bg-black/20">
        <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-2"
          >
            <Logo className="size-6 md:size-7" />
            <h1 className="text-xl md:text-2xl font-semibold tracking-tight select-none">
              Edge Concierge
            </h1>
          </motion.div>

          {/* keep this small status line or remove it if you don't want any right-side text */}
          <div className="text-xs md:text-sm text-white/60">Llama 3.3 · Vectorize</div>
        </div>
      </header>

      {/* Removed the hero section per your request */}

      {/* Chat card */}
      <main className="mx-auto max-w-4xl px-4 w-full flex-1 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,.35)] tilt"
        >
          <div
            ref={scrollerRef}
            className="chat-scroll h-[65vh] md:h-[68vh] overflow-y-auto p-5 md:p-6"
          >
            {lines.length === 0 ? (
              <EmptyState />
            ) : (
              <div className="space-y-4">
                {lines.map((l, i) => (
                  <ChatBubble key={i} role={l.role} text={l.text} />
                ))}
                {sending && <TypingIndicator />}
              </div>
            )}
          </div>

          {/* Input bar */}
          <div className="p-4 md:p-5 border-t border-white/10">
            <div className="flex gap-2">
              <input
                className="flex-1 rounded-full bg-white/[0.06] border border-white/10 px-4 py-3 outline-none focus:ring-2 focus:ring-white/10 placeholder:text-white/40"
                placeholder="Ask anything… (press Enter to send)"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                disabled={sending}
              />
              <button
                onClick={send}
                disabled={sending}
                className="rounded-full px-5 py-3 bg-white text-black font-medium disabled:opacity-60 hover:opacity-90 transition-opacity cursor-pointer active:scale-[.98]"
                title="Send"
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* Optional footer removed; keep if you want a tiny hint or status */}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full grid place-items-center text-center">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <div className="mx-auto size-16 rounded-2xl bg-white/[0.07] border border-white/10" />
        <div className="text-white/70">Start a conversation.</div>
      </motion.div>
    </div>
  );
}

function ChatBubble({ role, text }: { role: "user" | "assistant"; text: string }) {
  const isUser = role === "user";
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={[
          "max-w-[90%] md:max-w-[75%] rounded-2xl px-4 py-3 leading-relaxed border",
          isUser
            ? "bg-white text-black border-white/80 shadow"
            : "bg-white/[0.05] text-white border-white/10 backdrop-blur-sm"
        ].join(" ")}
        style={{ transform: "translateZ(1px)" }}
      >
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
