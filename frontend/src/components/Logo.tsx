import React from "react";

const Logo: React.FC<{ className?: string }> = ({ className = "size-6" }) => (
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

export default Logo;
