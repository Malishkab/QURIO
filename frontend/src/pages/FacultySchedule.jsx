import React from "react";
import Navbar from "../components/Navbar";

export default function FacultySchedule({ user, onLogout }) {
  const schedule = [
    { day: "Monday", classes: "CS101 - 10AM, MA102 - 2PM" },
    { day: "Tuesday", classes: "PH103 - 11AM, CS104 - 3PM" },
    { day: "Wednesday", classes: "EE105 - 9AM, CS101 - 2PM" },
    { day: "Thursday", classes: "MA102 - 10AM, PH103 - 1PM" },
    { day: "Friday", classes: "CS104 - 11AM, EE105 - 3PM" },
  ];

  return (
    <div className="min-h-screen bg-indigo-50">
      <Navbar user={user} onLogout={onLogout} />
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-2xl shadow p-8">
        <h2 className="text-2xl font-bold text-indigo-700 mb-6">Faculty Schedule 🗓️</h2>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-indigo-100 text-indigo-700">
              <th className="p-3 text-left">Day</th>
              <th className="p-3 text-left">Classes</th>
            </tr>
          </thead>
          <tbody>
            {schedule.map((s, i) => (
              <tr key={i} className="border-b hover:bg-indigo-50">
                <td className="p-3 font-medium">{s.day}</td>
                <td className="p-3 text-gray-600">{s.classes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
