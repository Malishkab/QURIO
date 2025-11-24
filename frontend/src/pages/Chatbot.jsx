import React, { useState, useRef, useEffect } from "react";
import Navbar from "../components/Navbar";
import { getFaqReply } from "../utils/getFaqReply";

export default function Chatbot({ user, onLogout }) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState([]);
  const [wasVoiceInput, setWasVoiceInput] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState({});
  const [selectedChatId, setSelectedChatId] = useState(null);

  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Load chat history from localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("chatHistory")) || {};
    setChatHistory(saved);

    if (selectedChatId && saved[selectedChatId]) {
      setMessages(saved[selectedChatId]);
    } else {
      setMessages([{ sender: "bot", text: "Hi! I’m QURIO 👋 How can I help you today?" }]);
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Save messages to localStorage
  useEffect(() => {
    if (!messages.length) return;
    const chatId = selectedChatId || Date.now().toString();
    const updatedHistory = { ...chatHistory, [chatId]: messages };
    setChatHistory(updatedHistory);
    localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));
    setSelectedChatId(chatId);
  }, [messages]);

  // Speech recognition
  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const SR = window.webkitSpeechRecognition;
      const recog = new SR();
      recog.continuous = false;
      recog.interimResults = false;
      recog.lang = "en-IN";

      recog.onresult = (e) => {
        const spoken = e.results[0][0].transcript;
        setInput(spoken);
        setWasVoiceInput(true);
      };

      recog.onerror = () => setIsListening(false);
      recog.onend = () => setIsListening(false);

      recognitionRef.current = recog;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Your browser does not support voice input");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const speak = (text) => {
    if (!wasVoiceInput) return;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-IN";
    window.speechSynthesis.speak(utter);
  };

  const botReplyWithAnimation = (reply) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
      setIsTyping(false);
      if (wasVoiceInput) speak(reply);
    }, 700);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    const reply = getFaqReply(input);
    botReplyWithAnimation(reply);
    setInput("");
    setWasVoiceInput(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleChatSelect = (chatId) => {
    setSelectedChatId(chatId);
    setMessages(chatHistory[chatId]);
  };

  const handleDeleteChat = (chatId) => {
    const updatedHistory = { ...chatHistory };
    delete updatedHistory[chatId];
    setChatHistory(updatedHistory);
    localStorage.setItem("chatHistory", JSON.stringify(updatedHistory));

    // Reset selected chat if it was deleted
    if (chatId === selectedChatId) {
      setSelectedChatId(null);
      setMessages([{ sender: "bot", text: "Hi! I’m QURIO 👋 How can I help you today?" }]);
    }
  };

  return (
    <div className="min-h-screen flex bg-indigo-50">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-inner p-4 flex flex-col">
        <h2 className="font-bold text-lg text-indigo-700 mb-4">Chats</h2>
        <div className="flex-1 overflow-y-auto space-y-2">
          {Object.entries(chatHistory).map(([id, msgs]) => (
            <div key={id} className="flex justify-between items-center w-full">
              <button
                onClick={() => handleChatSelect(id)}
                className={`text-left flex-1 p-2 rounded-lg border mr-2 ${
                  id === selectedChatId ? "border-indigo-600 bg-indigo-100" : "border-gray-200"
                }`}
              >
                {msgs[0]?.text.slice(0, 25) || "New Chat"}...
              </button>
              <button
                onClick={() => handleDeleteChat(id)}
                className="px-2 py-1 text-xs bg-red-500 text-white rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={() => {
            const newId = Date.now().toString();
            setSelectedChatId(newId);
            setMessages([{ sender: "bot", text: "Hi! I’m QURIO 👋 How can I help you today?" }]);
          }}
          className="mt-4 px-3 py-2 bg-indigo-600 text-white rounded-lg"
        >
          + New Chat
        </button>
      </div>

      {/* Chat Section */}
      <div className="flex-1 p-6 flex flex-col">
        <Navbar user={user} onLogout={onLogout} />
        <div className="flex-1 max-w-3xl mx-auto bg-white shadow rounded-xl p-6 mt-6 flex flex-col">
          <div className="h-[420px] overflow-y-auto space-y-4 p-4 bg-gray-50 rounded-lg flex-1">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl max-w-[75%] ${
                  msg.sender === "user"
                    ? "bg-indigo-600 text-white ml-auto"
                    : "bg-gray-200 text-black"
                }`}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div className="p-3 bg-gray-300 rounded-xl w-24 animate-pulse">
                typing...
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          {/* Input */}
          <div className="flex gap-3 mt-4">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 border rounded-lg p-3"
              placeholder="Ask something..."
            />
            <button
              onClick={handleSend}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              Send
            </button>
            <button
              onClick={toggleListening}
              className={`px-4 py-2 rounded-lg ${
                isListening ? "bg-red-500 text-white" : "bg-gray-300"
              }`}
            >
              🎤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
