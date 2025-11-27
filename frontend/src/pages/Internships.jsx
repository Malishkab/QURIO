import React, { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function Internships({ user, onLogout }) {
  const [emails, setEmails] = useState([]);

  useEffect(() => {
    axios
      .get("https://qurio-chatbot.onrender.com/api/emails/Internship")
      .then((res) => setEmails(res.data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar user={user} onLogout={onLogout} />
      <div className="max-w-5xl mx-auto mt-10 p-4">
        <h1 className="text-2xl font-bold text-indigo-700 mb-6">Internship Updates 💼</h1>
        {emails.length === 0 ? (
          <p>No internship emails found.</p>
        ) : (
          emails.map((email) => (
            <div
              key={email.id}
              className="bg-white p-4 rounded-xl shadow mb-3 border border-gray-100 hover:shadow-md transition"
            >
              <h3 className="font-semibold">{email.subject}</h3>
              <p className="text-gray-600 text-sm">{email.date}</p>
              <p className="text-gray-500 text-sm mt-2">{email.snippet}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
