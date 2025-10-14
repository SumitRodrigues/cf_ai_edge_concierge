import React from "react";

const EmptyState: React.FC = () => (
    <div className="h-full grid place-items-center text-center">
        <div className="space-y-3">
            <div className="mx-auto size-16 rounded-2xl bg-white/[0.07] border border-white/10" />
            <div className="text-white/70">Start a conversation.</div>
        </div>
    </div>
);

export default EmptyState;
