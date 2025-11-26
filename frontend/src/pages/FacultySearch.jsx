import React, { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

export default function FacultySearch({ user, onLogout }) {
  const [name, setName] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const searchFaculty = async () => {
    setError("");
    setResult(null);

    try {
      const res = await axios.get(
        `https://qurio-faculty.onrender.com/faculty?name=${name}`
      );
      setResult(res.data);
    } catch (err) {
      setError("Faculty not found");
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-lg mx-auto mt-10 p-6 bg-white shadow rounded-xl">
        <h2 className="text-xl font-bold text-indigo-700 mb-4">
          Faculty Search 🔍
        </h2>

        <input
          type="text"
          placeholder="Enter faculty name"
          className="w-full border p-2 rounded mb-4"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <button
          onClick={searchFaculty}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700"
        >
          Search
        </button>

        {result && (
          <div className="mt-6 p-4 bg-indigo-100 rounded">
            <h3 className="font-semibold">{result.faculty}</h3>
            <p>Department: {result.department}</p>
            <p>Office: {result.office_room}</p>
            <p>Days: {result.available_days}</p>
            <p>Time: {result.available_time}</p>
          </div>
        )}

        {error && (
          <p className="text-red-500 text-center mt-4">{error}</p>
        )}
      </div>
    </div>
  );
}

