import React, { useEffect, useState } from "react";

export default function EventsList() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/emails/Event")
      .then((res) => res.json())
      .then((data) => {
        setEmails(data);
        setLoading(false);
      })
      .catch((err) => console.error(err));
  }, []);

  if (loading) return <div className="text-center mt-10">Loading events...</div>;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">🎉 Upcoming Events</h1>
      {emails.length === 0 ? (
        <p>No event emails found.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {emails.map((email) => (
            <div key={email.id} className="bg-white p-4 shadow rounded-lg">
              <h2 className="font-semibold text-lg">{email.subject}</h2>
              <p className="text-sm text-gray-500">{email.date}</p>
              <p className="text-gray-700 mt-2">{email.snippet}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
