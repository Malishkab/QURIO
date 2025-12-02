import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";

// 🔹 Pages
import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";
import FacultySchedule from "./pages/FacultySchedule";
import FacultySearch from "./pages/FacultySearch";
import Internships from "./pages/Internships";
import Hackathons from "./pages/Hackathons";
import EventsList from "./pages/EventsList";
import Login from "./pages/Login";
import CampusMap from "./pages/CampusMap";

// 🔹 Components
import EmailDashboard from "./components/EmailDashboard";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ------------------------------
  // 🔐 Firebase Auth State Listener
  // ------------------------------
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ------------------------------
  // 🔓 Logout Function
  // ------------------------------
  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  // ------------------------------
  // ⏳ Loading Screen
  // ------------------------------
  if (loading) {
    return <p className="text-center mt-20 text-lg text-indigo-600">Loading...</p>;
  }

  // ------------------------------
  // 🔑 If Not Logged In → Show Login
  // ------------------------------
  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // ------------------------------
  // 🌐 Main App Routes
  // ------------------------------
  return (
    <Routes>
      {/* Home Dashboard */}
      <Route path="/" element={<Dashboard user={user} onLogout={handleLogout} />} />

      {/* Chatbot */}
      <Route path="/chatbot" element={<Chatbot user={user} onLogout={handleLogout} />} />

      {/* Faculty Pages */}
      <Route path="/faculty-schedule" element={<FacultySchedule user={user} onLogout={handleLogout} />} />
      <Route path="/faculty-search" element={<FacultySearch user={user} onLogout={handleLogout} />} />

      {/* Email Categories */}
      <Route path="/internships" element={<Internships user={user} onLogout={handleLogout} />} />
      <Route path="/hackathons" element={<Hackathons user={user} onLogout={handleLogout} />} />
      <Route path="/eventslist" element={<EventsList user={user} onLogout={handleLogout} />} />
      <Route path="/emails" element={<EmailDashboard user={user} onLogout={handleLogout} />} />

      {/* Campus Map Feature */}
      <Route path="/campus-map" element={<CampusMap user={user} onLogout={handleLogout} />} />

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
