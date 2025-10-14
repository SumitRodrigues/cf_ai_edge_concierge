import React from "react";

const TypingIndicator: React.FC = () => (
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

export default TypingIndicator;
