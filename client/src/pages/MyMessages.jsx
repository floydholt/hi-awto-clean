// client/src/pages/MyMessages.jsx
import React, { useEffect, useState } from "react";
import { subscribeToInbox } from "../api/messages";
import MessageThreadView from "../components/MessageThreadView";
import { auth } from "../firebase";

export default function MyMessages() {
  const user = auth.currentUser;
  const [threads, setThreads] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showThreads, setShowThreads] = useState(true); // mobile toggle

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToInbox(user.uid, (list) => setThreads(list));
    return () => unsub();
  }, [user?.uid]);

  // if on desktop, show both panes; on mobile we toggle
  return (
    <div className="h-screen flex flex-col md:flex-row">
      {/* threads panel */}
      <aside className={`bg-white border-r border-gray-100 md:w-96 w-full md:block ${showThreads ? "block" : "hidden"}`}>
        <div className="p-3 border-b">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Messages</h3>
            <button
              className="md:hidden px-2 py-1 text-sm text-blue-600"
              onClick={() => setShowThreads(false)}
            >
              Close
            </button>
          </div>
        </div>

        <div className="overflow-auto h-[calc(100vh-64px)]">
          {threads.length === 0 && <div className="p-4 text-sm text-gray-500">No conversations yet</div>}
          {threads.map((t) => (
            <div
              key={t.id}
              onClick={() => {
                setSelected(t);
                // switch to thread view on mobile
                if (window.innerWidth < 768) setShowThreads(false);
              }}
              className={`p-3 flex items-start gap-3 cursor-pointer border-b hover:bg-gray-50 ${selected?.id === t.id ? "bg-gray-50" : ""}`}
            >
              <div className="w-11 h-11 bg-gray-200 rounded-full flex items-center justify-center text-gray-600">
                {t.otherUserName?.[0]?.toUpperCase() ?? "U"}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <div className="font-medium text-sm truncate">{t.otherUserName || "User"}</div>
                  <div className="text-xs text-gray-400 ml-auto">
                    {t.lastTimestamp ? new Date(t.lastTimestamp?.toDate?.() ?? t.lastTimestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : ""}
                  </div>
                </div>

                <div className="text-xs text-gray-500 truncate">{t.lastMessage || "—"}</div>
              </div>

              {!t.seen && <div className="ml-2 bg-blue-600 text-white rounded-full w-6 h-6 text-xs flex items-center justify-center">•</div>}
            </div>
          ))}
        </div>
      </aside>

      {/* thread view */}
      <main className="flex-1 h-full">
        {selected ? (
          <MessageThreadView
            thread={selected}
            onBack={() => {
              if (window.innerWidth < 768) setShowThreads(true);
              setSelected(null);
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center p-6 text-center">
            <div>
              <h3 className="text-xl font-semibold">Select a conversation</h3>
              <p className="text-sm text-gray-500 mt-2">Tap a thread on the left to open the chat.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
