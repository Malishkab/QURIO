import React, { useState } from "react";
import { Search, Clock, MapPin, Calendar, Users, Gift, BookOpen, Award } from "lucide-react";
import SearchHistory from "../components/SearchHistory"; 

const quickAccess = [
  { title: "Internships", desc: "Find latest opportunities", icon: <Gift className="w-6 h-6" />, color: "bg-blue-500" },
  { title: "Faculty Schedule", desc: "Check availability", icon: <Clock className="w-6 h-6" />, color: "bg-green-500" },
  { title: "Hackathons", desc: "Upcoming competitions", icon: <Award className="w-6 h-6" />, color: "bg-purple-500" },
  { title: "Campus Events", desc: "What's happening", icon: <Calendar className="w-6 h-6" />, color: "bg-orange-500" },
  { title: "Societies", desc: "Student organizations", icon: <Users className="w-6 h-6" />, color: "bg-pink-500" },
  { title: "Campus Map", desc: "Find your way", icon: <MapPin className="w-6 h-6" />, color: "bg-teal-500" },
  
];

const Home = () => {
  const [query, setQuery] = useState("");
  const [showHistory, setShowHistory] = useState(false);

  const handleAsk = () => {
    if (!query.trim()) return;
    const old = JSON.parse(localStorage.getItem("chatHistory")) || [];
    const newItem = {
      text: query,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    localStorage.setItem("chatHistory", JSON.stringify([newItem, ...old]));
    setQuery("");
    alert(`QURIO searching: "${newItem.text}"`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col items-center">
      {/* Header */}
      <header className="w-full text-center py-10">
        <h1 className="text-4xl font-bold text-indigo-700">QURIO ✨</h1>
        <p className="text-gray-600 mt-3 text-lg max-w-2xl mx-auto">
          Your intelligent campus assistant. Ask questions, find locations, check schedules, and discover opportunities — all in one place.
        </p>
      </header>

      {/* Search Bar */}
      <div className="flex items-center w-full max-w-2xl bg-white rounded-full shadow-md px-4 py-2">
        <Search className="w-5 h-5 text-gray-500" />
        <input
          type="text"
          placeholder="Ask QURIO anything..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-3 outline-none text-gray-700"
        />
        <button
          onClick={handleAsk}
          className="bg-indigo-600 text-white rounded-full px-5 py-2 hover:bg-indigo-700 transition"
        >
          Ask
        </button>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-4 mt-6 flex-wrap justify-center">
        <button
          onClick={() => setShowHistory(true)}
          className="bg-purple-100 text-purple-600 px-4 py-2 rounded-full font-medium hover:bg-purple-200 transition"
        >
          History
        </button>
        <button className="bg-blue-100 text-blue-600 px-4 py-2 rounded-full font-medium hover:bg-blue-200 transition">Faculty Schedule</button>
        <button className="bg-pink-100 text-pink-600 px-4 py-2 rounded-full font-medium hover:bg-pink-200 transition">Campus Map</button>
        <button className="bg-green-100 text-green-600 px-4 py-2 rounded-full font-medium hover:bg-green-200 transition">Events</button>
      </div>

      {/* Quick Access Section */}
      <section className="w-full max-w-6xl mt-12 px-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Quick Access</h2>
          <button className="text-indigo-600 text-sm hover:underline">View All</button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
          {quickAccess.map((item, i) => (
            <div
              key={i}
              className="flex flex-col items-center p-5 bg-white rounded-2xl shadow hover:shadow-lg transition"
            >
              <div className={`${item.color} p-3 rounded-full text-white mb-3`}>
                {item.icon}
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-500 text-center">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Chatbot Dashboard Placeholder */}
      <section className="w-full max-w-5xl mt-12 px-6 pb-20">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Chat Assistant</h2>
        <div className="bg-white p-8 rounded-2xl shadow-md text-gray-600">
          <p>💬 Chatbot Dashboard will appear here (integrate your chatbot later).</p>
        </div>
      </section>

      {/* Search History Modal */}
      {showHistory && (
        <SearchHistory
          onClose={() => setShowHistory(false)}
          onSearchAgain={(text) => {
            setQuery(text);
            setShowHistory(false);
          }}
        />
      )}
    </div>
  );
};

export default Home;
