import React from "react";

interface ChatListProps {
    chats: { id: string; title: string }[];
    selectedChatId: string | null;
    onSelectChat: (id: string) => void;
}

const ChatList: React.FC<ChatListProps> = ({ chats, selectedChatId, onSelectChat }) => (
    <ul className="chat-list">
        {chats.map(chat => (
            <li
                key={chat.id}
                className={chat.id === selectedChatId ? "selected" : ""}
                onClick={() => onSelectChat(chat.id)}
            >
                {chat.title}
            </li>
        ))}
    </ul>
);

export default ChatList;
