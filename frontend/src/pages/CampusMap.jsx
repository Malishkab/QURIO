import React from "react";
import Navbar from "../components/Navbar";


// const handleOpenMap = () => {
//   window.open("http://127.0.0.1:5002/", "_blank");
// };


const handleOpenMap = () => {
  console.log("Button clicked — trying to open map");

  const win = window.open("https://qurio-location.onrender.com/", "_blank");

  if (!win) {
    console.log("Popup blocked — redirecting instead");
    window.location.href = "https://qurio-location.onrender.com/";
  }
};




export default function CampusMap({ user, onLogout }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-5xl mx-auto p-6 mt-8 bg-white rounded-2xl shadow text-center">
        <h2 className="text-2xl font-semibold text-indigo-600 mb-4">
          Campus Map 🗺️
        </h2>

        <p className="text-gray-600 mb-6">
          Click below to open the interactive campus map.
        </p>

        <button
          onClick={handleOpenMap}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition"
        >
          Open Campus Map
        </button>
      </div>
    </div>
  );
}
