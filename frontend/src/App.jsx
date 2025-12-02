import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const categories = [
    { 
      name: "Internships", 
      key: "Internship", 
      description: "Find latest opportunities",
      emoji: "💼"
    },
    { 
      name: "Hackathons", 
      key: "Hackathon", 
      description: "Upcoming competitions",
      emoji: "🚀"
    },
    { 
      name: "Faculty Search", 
      key: "FacultySearch", 
      description: "Find faculty availability",
      emoji: "🔍"
    },
    { 
      name: "Campus Map", 
      key: "Map", 
      description: "Find your way around campus",
      emoji: "🗺️"
    },
  ];

  const handleCategorySelect = (categoryKey) => {
    if (categoryKey === "FacultySearch") return navigate("/faculty-search");
    if (categoryKey === "Map") return navigate("/campus-map");
    if (categoryKey === "Internship") return navigate("/internships");
    if (categoryKey === "Hackathon") return navigate("/hackathons");

    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar user={user} onLogout={onLogout} />

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-8 mt-16">
        
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-4xl font-extrabold text-indigo-700 tracking-tight">
            Welcome, {user.username}! <span className="text-3xl">👋</span>
          </h1>
          <p className="text-gray-500 mt-2 text-lg">
            Here's what's available for you today.
          </p>
        </div>

        {/* Quick Access Title */}
        <h2 className="text-2xl font-semibold text-indigo-700 mb-6">
          Quick Access
        </h2>

        {/* Category Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategorySelect(cat.key)}
              className="
                bg-white p-6 rounded-2xl shadow-sm border border-indigo-100 
                hover:shadow-xl hover:scale-[1.03] transition-all group
                text-left
              "
            >
              <div className="text-4xl mb-3">{cat.emoji}</div>

              <h3 className="font-semibold text-lg text-gray-800 group-hover:text-indigo-700">
                {cat.name}
              </h3>

              <p className="text-sm text-gray-500 mt-1">
                {cat.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

