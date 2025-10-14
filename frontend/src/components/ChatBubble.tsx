import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ChatBubbleProps {
    role: "user" | "assistant";
    text: string;
}

const ChatBubble: React.FC<ChatBubbleProps> = ({ role, text }) => {
    const isUser = role === "user";
    return (
        <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
            <div
                className={["max-w-[90%] md:max-w-[75%] rounded-2xl px-4 py-3 leading-relaxed border",
                    isUser
                        ? "bg-white text-black border-white/80 shadow"
                        : "bg-white/[0.05] text-white border-white/10 backdrop-blur-sm"
                ].join(" ")}
                style={{ transform: "translateZ(1px)" }}
            >
                {isUser ? (
                    text
                ) : (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
                )}
            </div>
        </div>
    );
};

export default ChatBubble;
