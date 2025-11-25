import axios from "axios";

// =========================
// FACULTY BACKEND (RENDER)
// =========================
export async function fetchFacultySchedules(name) {
  const res = await axios.get(
    `https://qurio-faculty.onrender.com/faculty?name=${name}`
  );
  return res.data;
}

// =========================
// CHATBOT BACKEND
// =========================
export async function sendQueryToBot(query) {
  const res = await axios.post(
    "https://qurio-chatbot.onrender.com/query",
    { query }
  );
  return res.data;
}

// =========================
// EVENTS (FROM CHATBOT BACKEND)
// =========================
export async function fetchEvents() {
  const res = await axios.get(
    "https://qurio-chatbot.onrender.com/events"
  );
  return res.data;
}

// =========================
// LOCATION BACKEND (OSRM + CUSTOM PATHS)
// =========================
export async function getRoute(from, to) {
  const res = await axios.get(
    `https://qurio-location.onrender.com/route?src=${from}&dest=${to}`
  );
  return res.data;
}

