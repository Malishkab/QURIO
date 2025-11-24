// inside your ChatWindow component file
import React, { useState } from "react";
import Fuse from "fuse.js";
import autocorrect from "autocorrect";
import faqsData from "../data/faqs.json";

export default function Chatbot() {
  const [messages, setMessages] = useState([]);

  const correct = autocorrect();

  // Local fuzzy search setup
  const fuse = new Fuse(faqsData.faqs, {
    keys: ["question", "keywords", "category", "answer"],
    includeScore: true,
    threshold: 0.33
  });

  // Send user message
  const handleSend = async (inputMessage) => {
    const userMsg = inputMessage.trim();
    if (!userMsg) return;

    addMessage(userMsg, "user");

    const corrected = correct(userMsg);

    // -------------------------------------
    // 🔹 1) TRY BACKEND CHATBOT FIRST
    // -------------------------------------
    try {
      const res = await fetch("http://127.0.0.1:5000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: corrected }),
      });

      const data = await res.json();

      if (data.reply && data.reply !== "I'm still learning — please try asking in a different way!") {
        addMessage(data.reply, "bot");
        return;
      }
    } catch (e) {
      console.log("Backend not responding — using local fallback.");
    }

    // -------------------------------------
    // 🔹 2) FALLBACK → FUZZY SEARCH
    // -------------------------------------
    const result = fuse.search(corrected);

    if (result.length > 0) {
      const bestMatch = result[0].item;
      addMessage(bestMatch.answer, "bot");
    } else {
      addMessage(
        "Sorry, I couldn’t find this in FAQs. Try rephrasing!",
        "bot"
      );
    }
  };

  const addMessage = (text, sender) => {
    setMessages((prev) => [...prev, { text, sender }]);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">QURIO Chatbot</h1>

      <div className="w-full h-[60vh] bg-gray-100 p-4 rounded overflow-y-scroll shadow">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`my-2 ${msg.sender === "user" ? "text-blue-600" : "text-green-600"}`}
          >
            <strong>{msg.sender === "user" ? "You: " : "Bot: "}</strong>
            {msg.text}
          </div>
        ))}
      </div>

      <ChatInput onSend={handleSend} />
    </div>
  );
}

function ChatInput({ onSend }) {
  const [text, setText] = useState("");

  const send = () => {
    if (text.trim() !== "") onSend(text);
    setText("");
  };

  return (
    <div className="mt-4 flex gap-2">
      <input
        className="border p-2 w-full rounded"
        placeholder="Ask something…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <button className="bg-blue-500 text-white px-4 py-2 rounded" onClick={send}>
        Send
      </button>
    </div>
  );
}
