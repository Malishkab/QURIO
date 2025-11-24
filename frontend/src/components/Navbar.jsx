import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  return (
    <nav className="bg-indigo-700 text-white p-4 flex justify-between items-center shadow-md">
      <h1 className="text-2xl font-bold cursor-pointer" onClick={() => navigate("/")}>
        QURIO
      </h1>
      <div className="flex gap-6 items-center">
        <Link to="/" className="hover:text-indigo-200">Dashboard</Link>
        <Link to="/chatbot" className="hover:text-indigo-200">Chatbot</Link>
        {/* <Link to="/faculty-schedule" className="hover:text-indigo-200">Faculty</Link>
        <Link to="/events" className="hover:text-indigo-200">Events</Link> */}
        <span className="font-medium">👤 {user.username}</span>
        <button
          onClick={onLogout}
          className="bg-white text-indigo-700 font-semibold px-3 py-1 rounded-lg hover:bg-indigo-100"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
