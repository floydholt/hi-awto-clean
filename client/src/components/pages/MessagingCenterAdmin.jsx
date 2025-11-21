// client/src/pages/MessagingCenterAdmin.jsx
import React, { useState, useEffect } from "react";
import useMessages from "../hooks/useMessages";
import MessageList from "../components/MessageList";
import MessageThreadView from "../components/MessageThreadView";
import { fetchInbox, fetchThread, sendMessage } from "../api/messages";
import { useAuthContext } from "../hooks/useAuth"; // if available

export default function MessagingCenterAdmin() {
  const { user } = useAuthContext ? useAuthContext() : { user: null };
  const uid = user?.uid;
  const { threads, queryThreads, sendMessage, useThreadMessages } = useMessages({ uid, role: "admin" });
  const [activeThread, setActiveThread] = useState(null);
  const [filter, setFilter] = useState({ buyerId: "", sellerId: "", listingId: "" });
  const [resultThreads, setResultThreads] = useState([]);

  useEffect(() => {
    // default to all threads (real-time threads from hook)
    setResultThreads(threads);
  }, [threads]);

  async function runFilter() {
    const res = await queryThreads(filter);
    setResultThreads(res);
    setActiveThread(null);
  }

  return (
    <div className="flex h-[80vh] bg-white shadow rounded overflow-hidden">
      <div className="w-1/3 border-r">
        <div className="p-3 border-b">
          <h3 className="font-semibold">Admin Messaging Center</h3>
          <div className="mt-2 flex gap-2">
            <input className="input" placeholder="buyerId" value={filter.buyerId} onChange={(e) => setFilter((s) => ({ ...s, buyerId: e.target.value }))} />
            <input className="input" placeholder="sellerId" value={filter.sellerId} onChange={(e) => setFilter((s) => ({ ...s, sellerId: e.target.value }))} />
          </div>
          <div className="mt-2 flex gap-2">
            <input className="input" placeholder="listingId" value={filter.listingId} onChange={(e) => setFilter((s) => ({ ...s, listingId: e.target.value }))} />
            <button className="button" onClick={runFilter}>Filter</button>
            <button className="button" onClick={() => { setResultThreads(threads); setFilter({ buyerId: "", sellerId: "", listingId: "" }); }}>Reset</button>
          </div>
        </div>

        <div className="p-0">
          <MessageList threads={resultThreads} onSelect={(t) => setActiveThread(t)} activeThreadId={activeThread?.id} currentUid={uid} />
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {activeThread ? (
          <div className="flex-1">
            <MessageThreadView
              threadId={activeThread.id}
              otherUserId={activeThread.participants?.find((p) => p !== uid)}
              listingId={activeThread.listingId}
              uid={uid}
              role="admin"
            />
          </div>
        ) : (
          <div className="p-6 text-gray-600">Select a thread to view messages</div>
        )}
      </div>
    </div>
  );
}
i