// src/components/EmailDashboard.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function EmailDashboard() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = [
    { name: "All", key: "All" },
    { name: "Internships", key: "Internship" },
    { name: "Hackathons", key: "Hackathon" },
    { name: "Placements", key: "Placement" },
    { name: "College Events", key: "College" },
  ];

  // Fetch emails from Firebase on mount
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "emails"));
        const emailList = querySnapshot.docs.map(doc => doc.data());
        setEmails(emailList);
      } catch (error) {
        console.error("Error fetching emails:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmails();
  }, []);

  // Filter emails by selected category
  const filteredEmails =
    selectedCategory === "All"
      ? emails
      : emails.filter(email => email.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white p-8">
      <h1 className="text-3xl font-bold text-indigo-700 mb-6">📧 Emails Dashboard</h1>

      {/* Category Buttons */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {categories.map(cat => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategory(cat.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium ${
              selectedCategory === cat.key
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Emails */}
      {loading ? (
        <p>Loading emails...</p>
      ) : filteredEmails.length === 0 ? (
        <p className="text-gray-500 mt-4">
          No emails found for "{selectedCategory}".
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmails.map(email => (
            <div
              key={email.id}
              className="p-4 bg-white rounded-lg shadow hover:shadow-md transition"
            >
              <h3 className="font-semibold text-indigo-600">
                {email.subject || "No Subject"}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                {email.date ? new Date(email.date).toLocaleString() : "No date"}
              </p>
              <p className="text-gray-700 mt-2">{email.snippet || "No content available."}</p>
              <p className="mt-2 text-xs text-gray-400">Category: {email.category}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
