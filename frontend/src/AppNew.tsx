import React, { useState, useRef, useEffect } from "react";
import ChatSidebar from "./components/ChatSidebar";
import ChatBubble from "./components/ChatBubble";
import TypingIndicator from "./components/TypingIndicator";
import EmptyState from "./components/EmptyState";
import Logo from "./components/Logo";

const API_BASE = import.meta.env.VITE_API_BASE || "";

type Bubble = { role: "user" | "assistant"; text: string };
type Chat = { id: string; title: string; history: Bubble[] };

export default function App() {
    const chatScrollRef = useRef<HTMLDivElement>(null);
    const [chats, setChats] = useState<Chat[]>([
        { id: "default", title: "Chat 1", history: [] }
    ]);
    const [selectedChatId, setSelectedChatId] = useState<string>("default");
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);

    const selectedChat = chats.find((c) => c.id === selectedChatId);

    // Auto-scroll to latest message when chat history changes
    useEffect(() => {
        if (chatScrollRef.current) {
            chatScrollRef.current.scrollTo({ top: chatScrollRef.current.scrollHeight, behavior: "smooth" });
        }
    }, [selectedChat?.history, sending]);

    function handleSelectChat(id: string) {
        setSelectedChatId(id);
    }

    function handleNewChat() {
        const newId = `chat-${Date.now()}`;
        setChats((prev) => [
            ...prev,
            { id: newId, title: `Chat ${prev.length + 1}`, history: [] }
        ]);
        setSelectedChatId(newId);
    }

    async function send() {
        const message = input.trim();
        if (!message || sending || !selectedChat) return;
        setSending(true);
        setInput("");
        setChats((prev) =>
            prev.map((chat) =>
                chat.id === selectedChatId
                    ? { ...chat, history: [...chat.history, { role: "user", text: message }] }
                    : chat
            )
        );
        try {
            const r = await fetch(`${API_BASE}/api/chat`, {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ userId: "demo", message })
            });
            const data = await r.json();
            setChats((prev) =>
                prev.map((chat) =>
                    chat.id === selectedChatId
                        ? {
                            ...chat,
                            history: [
                                ...chat.history,
                                { role: "assistant", text: String(data?.reply ?? "") }
                            ]
                        }
                        : chat
                )
            );
        } catch {
            setChats((prev) =>
                prev.map((chat) =>
                    chat.id === selectedChatId
                        ? {
                            ...chat,
                            history: [
                                ...chat.history,
                                { role: "assistant", text: "⚠️ Network error, try again." }
                            ]
                        }
                        : chat
                )
            );
        } finally {
            setSending(false);
        }
    }

    function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
        if (e.key === "Enter") {
            e.preventDefault();
            send();
        }
    }

    return (
        <div className="min-h-screen flex flex-row">
            <ChatSidebar
                chats={chats.map(({ id, title }) => ({ id, title }))}
                selectedChatId={selectedChatId}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
            />
            <div className="flex-1 flex flex-col">
                <header className="sticky top-0 z-10 border-b border-white/5 backdrop-blur-sm bg-black/20">
                    <div className="mx-auto max-w-4xl px-4 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Logo className="size-6 md:size-7" />
                            <h1 className="text-xl md:text-2xl font-semibold tracking-tight select-none">
                                Edge Concierge
                            </h1>
                        </div>
                        <div className="text-xs md:text-sm text-white/60">Llama 3.3 · Vectorize</div>
                    </div>
                </header>
                <main className="mx-auto max-w-4xl px-4 w-full flex-1 py-8">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
                        <div ref={chatScrollRef} className="chat-scroll h-[65vh] md:h-[68vh] overflow-y-auto p-5 md:p-6">
                            {!selectedChat || selectedChat.history.length === 0 ? (
                                <EmptyState />
                            ) : (
                                <div className="space-y-4">
                                    {selectedChat.history.map((l, i) => (
                                        <ChatBubble key={i} role={l.role} text={l.text} />
                                    ))}
                                    {sending && <TypingIndicator />}
                                </div>
                            )}
                        </div>
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
                    </div>
                </main>
            </div>
        </div>
    );
}
