import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";

import Dashboard from "./pages/Dashboard";
import Chatbot from "./pages/Chatbot";
import FacultySchedule from "./pages/FacultySchedule";
import Login from "./pages/Login";
import EmailDashboard from "./components/EmailDashboard";
import Internships from "./pages/Internships";
import Hackathons from "./pages/Hackathons";
import EventsList from "./pages/EventsList";
import FacultySearch from "./pages/FacultySearch";

// ⭐ ADD THIS
import CampusMap from "./pages/CampusMap";

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!user) return <Login onLogin={setUser} />;

  return (
    <Routes>
      <Route path="/" element={<Dashboard user={user} onLogout={handleLogout} />} />
      <Route path="/chatbot" element={<Chatbot user={user} onLogout={handleLogout} />} />
      <Route path="/faculty-schedule" element={<FacultySchedule user={user} onLogout={handleLogout} />} />
      <Route path="/faculty-search" element={<FacultySearch user={user} onLogout={handleLogout} />} />
      <Route path="/internships" element={<Internships user={user} onLogout={handleLogout} />} />
      <Route path="/eventslist" element={<EventsList user={user} onLogout={handleLogout} />} />
      <Route path="/hackathons" element={<Hackathons user={user} onLogout={handleLogout} />} />
      <Route path="/emails" element={<EmailDashboard user={user} onLogout={handleLogout} />} />

      {/* ⭐ ADD THIS ROUTE */}
      <Route path="/campus-map" element={<CampusMap user={user} onLogout={handleLogout} />} />

      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}


// import React, { useState, useEffect } from "react";
// import { Routes, Route, Navigate } from "react-router-dom";
// import { onAuthStateChanged, signOut } from "firebase/auth";
// import { auth } from "./firebaseConfig";

// import Dashboard from "./pages/Dashboard";
// import Chatbot from "./pages/Chatbot";
// import FacultySchedule from "./pages/FacultySchedule";
// import Login from "./pages/Login";
// import EmailDashboard from "./components/EmailDashboard";
// import Internships from "./pages/Internships";
// import Hackathons from "./pages/Hackathons";
// import EventsList from "./pages/EventsList";
// import FacultySearch from "./pages/FacultySearch";


// export default function App() {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
//       setUser(firebaseUser);
//       setLoading(false);
//     });
//     return () => unsubscribe();
//   }, []);

//   const handleLogout = async () => {
//     await signOut(auth);
//     setUser(null);
//   };

//   if (loading) return <p className="text-center mt-20">Loading...</p>;
//   if (!user) return <Login onLogin={setUser} />;

//   return (
//     <Routes>
//   <Route path="/" element={<Dashboard user={user} onLogout={handleLogout} />} />
//   <Route path="/chatbot" element={<Chatbot user={user} onLogout={handleLogout} />} />
//   <Route path="/faculty-schedule" element={<FacultySchedule user={user} onLogout={handleLogout} />} />
//   <Route path="/faculty-search" element={<FacultySearch user={user} onLogout={handleLogout} />} />
//   <Route path="/internships" element={<Internships user={user} onLogout={handleLogout} />} />
//   <Route path="/eventslist" element={<EventsList user={user} onLogout={handleLogout} />} />
//   <Route path="/hackathons" element={<Hackathons user={user} onLogout={handleLogout} />} />
//   <Route path="/emails" element={<EmailDashboard user={user} onLogout={handleLogout} />} />
//   <Route path="*" element={<Navigate to="/" />} />
// </Routes>

//   );
// }
