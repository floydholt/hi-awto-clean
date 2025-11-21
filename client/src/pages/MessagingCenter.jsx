// client/src/pages/MessagingCenter.jsx
import React from "react";
import { Outlet } from "react-router-dom";
import MyMessages from "./MyMessages";
import "../styles/chat.css";

export default function MessagingCenter() {
  // Page layout: left = inbox (on large screens), right = thread view
  return (
    <div className="messaging-center grid md:grid-cols-3 gap-4 p-4">
      <div className="md:col-span-1">
        <MyMessages />
      </div>
      <div className="md:col-span-2">
        <Outlet />
      </div>
    </div>
  );
}
