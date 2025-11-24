// import axios from "axios";

// // existing function
// export async function sendQueryToBot(query) {
//   const res = await axios.post("http://localhost:5000/query", { query });
//   return res.data;
// }

// // add these two missing functions
// export async function fetchEvents() {
//   // Replace with your actual API route if available
//   const res = await axios.get("http://localhost:5000/events");
//   return res.data;
// }

// export async function fetchFacultySchedules() {
//   // Replace with your actual API route if available
//   const res = await axios.get("http://localhost:5000/faculty-schedules");
//   return res.data;
// }

// src/api.js
export const fetchFacultySchedules = async () => {
  // Mock sample data
  return [
    { name: "Dr. Sharma", subject: "AI", time: "10:00 AM - 11:00 AM" },
    { name: "Prof. Mehta", subject: "DBMS", time: "11:00 AM - 12:00 PM" }
  ];
};

export const sendQueryToBot = async (message) => {
  // Mock bot reply
  return { reply: "This is a dummy response until backend is connected." };
};

// src/api.js

export const fetchEvents = async () => {
  // Temporary mock data — you can connect to backend later
  return [
    { id: 1, title: "AI Workshop", date: "2025-11-01", venue: "Auditorium" },
    { id: 2, title: "Hackathon", date: "2025-11-05", venue: "Tech Park" },
    { id: 3, title: "Cultural Fest", date: "2025-11-10", venue: "Main Ground" },
  ];
};

