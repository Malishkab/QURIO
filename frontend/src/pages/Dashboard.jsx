import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";

export default function Dashboard({ user, onLogout }) {
  const navigate = useNavigate();

  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  const categories = [
    { name: "Internships", key: "Internship", description: "Find latest opportunities" },
    { name: "Hackathons", key: "Hackathon", description: "Upcoming competitions" },
    { name: "Faculty Search", key: "FacultySearch", description: "Find faculty availability" },
    { name: "Campus Map", key: "Map", description: "Find your way" },
  ];

  const handleCategorySelect = async (categoryKey) => {
    setSelectedCategory(categoryKey);

    // ⭐ Routing for Faculty Search
    if (categoryKey === "FacultySearch") {
      navigate("/faculty-search");
      return;
    }

    // ⭐ Routing for Campus Map
    if (categoryKey === "Map") {
      navigate("/campus-map");
      return;
    }

    setLoading(true);
    try {
      if (["Internship", "Hackathon", "Placement", "College"].includes(categoryKey)) {
        const res = await fetch(`https://qurio-chatbot.onrender.com/api/emails/${categoryKey}`);
        const data = await res.json();
        setEmails(data);
      } else {
        setEmails([]);
      }
    } catch (err) {
      console.error("Error fetching emails:", err);
      setEmails([]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar user={user} onLogout={onLogout} />

      <div className="max-w-6xl mx-auto mt-10 px-6">
        <h1 className="text-3xl font-bold text-indigo-700 mb-6">
          Welcome, {user.username}! 👋
        </h1>

        <h2 className="text-xl font-semibold text-indigo-700 mb-4">Quick Access</h2>

        {/* Quick Access Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategorySelect(cat.key)}
              className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm 
                         hover:shadow-lg hover:scale-[1.02] transition-all text-left cursor-pointer"
              style={{ pointerEvents: "auto" }}
            >
              <h3 className="font-semibold text-gray-800 pointer-events-none">
                {cat.name}
              </h3>
              <p className="text-sm text-gray-500 pointer-events-none">
                {cat.description}
              </p>
            </button>
          ))}
        </div>

        {/* Email Category Results */}
        {loading ? (
          <p className="text-gray-600 mt-8">Loading {selectedCategory} emails...</p>
        ) : (
          selectedCategory &&
          ["Internship", "Hackathon", "Placement", "College"].includes(selectedCategory) && (
            <div className="mt-10">
              <h2 className="text-2xl font-semibold text-indigo-700 mb-6">
                {selectedCategory} Emails
              </h2>

              {emails.length > 0 ? (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {emails.map((email) => (
                    <div
                      key={email.id}
                      className="p-4 bg-white shadow-md rounded-xl border border-indigo-100 hover:shadow-lg transition-all"
                    >
                      <h3 className="font-semibold text-lg text-indigo-800">
                        {email.subject || "No Subject"}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                        {email.snippet || "No content available."}
                      </p>
                      <p className="text-xs text-gray-400 mt-3">
                        {email.date ? new Date(email.date).toLocaleString() : "No date"}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 mt-4">
                  No {selectedCategory.toLowerCase()} emails found.
                </p>
              )}
            </div>
          )
        )}
      </div>
    </div>
  );
}

          
// import React, { useState } from "react";
// import Navbar from "../components/Navbar";
// import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";


// export default function Dashboard({ user, onLogout }) {
//   const [emails, setEmails] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState("");

//   // Quick Access Categories
//   const categories = [
//     { name: "Internships", key: "Internship", description: "Find latest opportunities" },
//     { name: "Hackathons", key: "Hackathon", description: "Upcoming competitions" },

//     // 🟣 CHANGE #1 → Faculty Schedule now opens the new page
//     { name: "Faculty Search", key: "FacultySearch", description: "Find faculty availability" },

//     { name: "Campus Map", key: "Map", description: "Find your way" },
//   ];

//   // Main Action Handler
//   const handleCategorySelect = async (categoryKey) => {
//     setSelectedCategory(categoryKey);

//     // 🟣 CHANGE #2 → Navigate to Faculty Search instead of fetching emails
//     if (categoryKey === "FacultySearch") {
//       window.location.href = "/faculty-search";   // (or use useNavigate)
//       return;
//     }

//     // 🌐 Open Flask Map Page
//     // if (categoryKey === "Map") {
//     //   window.open("http://127.0.0.1:5000/", "_blank");
//     //   return;
//     // }
//     if (categoryKey === "Map") {
//       window.location.href = "/campus-map";
//       return;
//     }


//     setLoading(true);

//     try {
//       if (["Internship", "Hackathon", "Placement", "College"].includes(categoryKey)) {
//         const res = await fetch(`http://localhost:5000/api/emails/${categoryKey}`);
//         const data = await res.json();
//         setEmails(data);
//       } else {
//         setEmails([]);
//       }
//     } catch (err) {
//       console.error("Error fetching emails:", err);
//       setEmails([]);
//     }

//     setLoading(false);
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
//       <Navbar user={user} onLogout={onLogout} />

//       <div className="max-w-6xl mx-auto mt-10 px-6">
//         <h1 className="text-3xl font-bold text-indigo-700 mb-6">
//           Welcome, {user.username}! 👋
//         </h1>

//         <h2 className="text-xl font-semibold text-indigo-700 mb-4">Quick Access</h2>

//         {/* Quick Access Cards */}
//         <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {categories.map((cat) => (
//             <button
//               key={cat.name}
//               onClick={() => handleCategorySelect(cat.key)}
//               className="bg-white p-5 rounded-xl border border-indigo-100 shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all text-left"
//             >
//               <h3 className="font-semibold text-gray-800">{cat.name}</h3>
//               <p className="text-sm text-gray-500">{cat.description}</p>
//             </button>
//           ))}
//         </div>

//         {/* Email Category Results */}
//         {loading ? (
//           <p className="text-gray-600 mt-8">Loading {selectedCategory} emails...</p>
//         ) : (
//           selectedCategory &&
//           ["Internship", "Hackathon", "Placement", "College"].includes(selectedCategory) && (
//             <div className="mt-10">
//               <h2 className="text-2xl font-semibold text-indigo-700 mb-6">
//                 {selectedCategory} Emails
//               </h2>

//               {emails.length > 0 ? (
//                 <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                   {emails.map((email) => (
//                     <div
//                       key={email.id}
//                       className="p-4 bg-white shadow-md rounded-xl border border-indigo-100 hover:shadow-lg transition-all"
//                     >
//                       <h3 className="font-semibold text-lg text-indigo-800">
//                         {email.subject || "No Subject"}
//                       </h3>
//                       <p className="text-sm text-gray-600 mt-1 line-clamp-3">
//                         {email.snippet || "No content available."}
//                       </p>
//                       <p className="text-xs text-gray-400 mt-3">
//                         {email.date ? new Date(email.date).toLocaleString() : "No date"}
//                       </p>
//                     </div>
//                   ))}
//                 </div>
//               ) : (
//                 <p className="text-gray-500 mt-4">
//                   No {selectedCategory.toLowerCase()} emails found.
//                 </p>
//               )}
//             </div>
//           )
//         )}
//       </div>
//     </div>
//   );
// }
