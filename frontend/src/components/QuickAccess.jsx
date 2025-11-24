import React from "react";

const quickAccessItems = [
  { title: "Internships", desc: "Find latest opportunities" },
  { title: "Hackathons", desc: "Upcoming competitions" },
  { title: "Faculty Schedule", desc: "Check availability" },
  { title: "Campus Events", desc: "What’s happening" },
  { title: "Societies", desc: "Student organizations" },

  // Campus Map item with external link
  {
    title: "Campus Map",
    desc: "Find your way",
    external: "http://127.0.0.1:5000/",   // Flask map URL
  },
];

export default function QuickAccessPanel() {
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-indigo-600">
        Quick Access
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickAccessItems.map((item) => (
          <div
            key={item.title}
            className="bg-white rounded-xl p-4 shadow hover:shadow-lg transition cursor-pointer hover:bg-indigo-50"
            onClick={() => {
              if (item.external) {
                window.open(item.external, "_blank");
              }
            }}
          >
            <h3 className="font-semibold text-indigo-700">{item.title}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

