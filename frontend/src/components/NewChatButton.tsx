import React from "react";

interface NewChatButtonProps {
    onNewChat: () => void;
}

const NewChatButton: React.FC<NewChatButtonProps> = ({ onNewChat }) => (
    <button onClick={onNewChat} className="new-chat-btn">
        + New Chat
    </button>
);

export default NewChatButton;
