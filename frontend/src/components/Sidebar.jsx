import React from "react";

export default function Sidebar({ messages }) {

  // Extract first message of every session
  const chats = messages.reduce((acc, msg, i) => {
    if (msg.from === "user") {
      acc.push({ id: i, title: msg.text.slice(0, 25) + "..." });
    }
    return acc;
  }, []);

  return (
    <div className="w-64 bg-gray-900 text-white p-4 flex flex-col">
      <h2 className="text-xl font-semibold mb-4">Conversations</h2>

      <div className="space-y-3 overflow-y-auto flex-1">
        {chats.map((chat) => (
          <div
            key={chat.id}
            className="p-3 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer"
          >
            {chat.title}
          </div>
        ))}
      </div>

      <button
        onClick={() => {
          localStorage.removeItem("chatHistory");
          window.location.reload();
        }}
        className="mt-4 bg-red-600 hover:bg-red-700 p-2 rounded"
      >
        Clear All
      </button>
    </div>
  );
}
