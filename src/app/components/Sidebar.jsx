"use client";
import React from "react";

const Sidebar = ({ usernames, activeUser, onSelectUser }) => {
  return (
    <ul className="space-y-2">
      {usernames.map((username) => (
        <li key={username}>
          <button
            onClick={() => onSelectUser(username)}
            className={`w-full text-left px-3 py-2 rounded ${
              activeUser === username ? "bg-blue-600 text-white" : "bg-white hover:bg-blue-100"
            }`}
          >
            {username}
          </button>
        </li>
      ))}
    </ul>
  );
};

export default Sidebar;