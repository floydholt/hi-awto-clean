// client/src/pages/MessagingCenterAdmin.jsx
import React, { useEffect, useState } from "react";
import { subscribeToInbox } from "../api/messages";
import MessageThreadView from "../components/MessageThreadView";

export default function MessagingCenterAdmin() {
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showThreads, setShowThreads] = useState(true);

  useEffect(() => {
    const unsub = subscribeToInbox("ADMIN", (t) => setThreads(t));
    return () => unsub();
  }, []);

  return (
    <div className="h-screen flex flex-col md:flex-row">
      <aside className={`md:w-96 w-full bg-white border-r ${showThreads ? "block" : "hidden"}`}>
        <div className="p-3 border-b flex items-center justify-between">
          <h3 className="text-lg font-semibold">Admin Inbox</h3>
          <button className="md:hidden text-sm text-blue-600" onClick={() => setShowThreads(false)}>Hide</button>
        </div>

        <div className="overflow-auto h-[calc(100vh-64px)]">
          {threads.map((t) => (
            <div key={t.id} className="p-3 border-b hover:bg-gray-50 cursor-pointer" onClick={() => { setSelected(t); if (window.innerWidth < 768) setShowThreads(false); }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">{t.otherUserName?.[0]?.toUpperCase()}</div>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{t.otherUserName || "User"}</div>
                  <div className="text-xs text-gray-500 truncate">{t.lastMessage}</div>
                </div>
                {!t.seen && <div className="ml-auto bg-blue-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center">•</div>}
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1">
        {selected ? (
          <MessageThreadView thread={selected} onBack={() => { setShowThreads(true); setSelected(null); }} />
        ) : (
          <div className="h-full flex items-center justify-center p-6 text-center">
            <div>
              <h3 className="text-xl font-semibold">Open a conversation</h3>
              <p className="text-sm text-gray-500 mt-2">Select a thread to view messages.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
