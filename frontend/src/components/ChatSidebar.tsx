import React from "react";

interface ChatSidebarProps {
    chats: { id: string; title: string }[];
    selectedChatId: string | null;
    onSelectChat: (id: string) => void;
    onNewChat: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ chats, selectedChatId, onSelectChat, onNewChat }) => {
    return (
        <aside className="h-screen w-64 bg-white/[0.04] border-r border-white/10 backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,.18)] flex flex-col">
            <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white/80 tracking-tight select-none">Chats</h2>
                <button
                    onClick={onNewChat}
                    className="rounded-full px-4 py-2 bg-white text-black font-medium disabled:opacity-60 hover:opacity-90 transition-opacity cursor-pointer active:scale-[.98]"
                >
                    + New Chat
                </button>
            </div>
            <ul className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {chats.map(chat => (
                    <li
                        key={chat.id}
                        className={`cursor-pointer px-4 py-2 rounded-lg transition-colors select-none border border-transparent ${chat.id === selectedChatId ? 'bg-white/10 border-white/20 text-white font-bold' : 'hover:bg-white/5 text-white/70'}`}
                        onClick={() => onSelectChat(chat.id)}
                    >
                        {chat.title}
                    </li>
                ))}
            </ul>
        </aside>
    );
};

export default ChatSidebar;
