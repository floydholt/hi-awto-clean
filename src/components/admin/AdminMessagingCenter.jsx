// client/src/components/AdminMessagingCenter.jsx
import React, { useEffect, useState, useRef } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  addDoc,
  serverTimestamp,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { db, auth, functions } from "../firebase"; // adjust path if your firebase file is elsewhere

export default function AdminMessagingCenter() {
  const [threads, setThreads] = useState([]);
  const [filteredThreads, setFilteredThreads] = useState([]);
  const [search, setSearch] = useState("");

  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [currentAdmin, setCurrentAdmin] = useState(null);
  const [aiModal, setAiModal] = useState(false);
  const [aiQuery, setAiQuery] = useState("");
  const [aiResults, setAiResults] = useState([]);
  const messagesEndRef = useRef(null);

  // load auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setCurrentAdmin(u || null);
    });
    return () => unsub();
  }, []);

  // load threads (real-time)
  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(q, async (snap) => {
      const enriched = [];
      // fetch minimal enriched info for each thread
      for (const d of snap.docs) {
        const data = d.data();
        const buyerName = await fetchUserName(data.buyerId);
        const sellerName = await fetchUserName(data.sellerId);
        const lastMsg = await fetchLastMessage(d.id);
        enriched.push({
          id: d.id,
          ...data,
          buyerName,
          sellerName,
          lastMessage: lastMsg?.text || "",
        });
      }
      setThreads(enriched);
      setFilteredThreads(enriched);
    });
    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // fetch last message for thread
  const fetchLastMessage = async (threadId) => {
    try {
      const msgsCol = collection(db, "messages", threadId, "messages");
      const q = query(msgsCol, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      if (snap.docs.length === 0) return null;
      return snap.docs[0].data();
    } catch (err) {
      return null;
    }
  };

  // filter threads locally
  useEffect(() => {
    if (!search.trim()) {
      setFilteredThreads(threads);
      return;
    }
    const s = search.toLowerCase();
    setFilteredThreads(
      threads.filter((t) => {
        return (
          (t.buyerName || "").toLowerCase().includes(s) ||
          (t.sellerName || "").toLowerCase().includes(s) ||
          (t.lastMessage || "").toLowerCase().includes(s)
        );
      })
    );
  }, [search, threads]);

  const fetchUserName = async (uid) => {
    if (!uid) return "Unknown";
    try {
      const snap = await getDoc(doc(db, "users", uid));
      return snap.exists() ? snap.data().name || "Unnamed" : "Unknown";
    } catch (err) {
      return "Unknown";
    }
  };

  // subscribe to messages for selected thread
  useEffect(() => {
    if (!selectedThread) {
      setMessages([]);
      return;
    }
    const msgsRef = collection(db, "messages", selectedThread.id, "messages");
    const q = query(msgsRef, orderBy("createdAt", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const m = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setMessages(m);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    });
    return () => unsub();
  }, [selectedThread]);

  const sendMessage = async () => {
    if (!messageText.trim() || !currentAdmin || !selectedThread) return;
    try {
      const threadRef = doc(db, "messages", selectedThread.id);
      const msgsRef = collection(threadRef, "messages");
      await addDoc(msgsRef, {
        senderId: currentAdmin.uid,
        senderType: "admin",
        text: messageText.trim(),
        createdAt: serverTimestamp(),
      });
      // update thread's updatedAt (optional)
      await threadRef.update?.({ updatedAt: serverTimestamp() }).catch(()=>{});
      setMessageText("");
    } catch (err) {
      console.error("Send failed:", err);
      alert("Failed to send message (see console).");
    }
  };

  // AI search: call cloud function 'searchMessagesAI' (httpsCallable)
  const runAiSearch = async () => {
    if (!aiQuery.trim()) return;
    try {
      const call = httpsCallable(functions, "searchMessagesAI");
      const res = await call({ query: aiQuery });
      // res.data expected array of { threadId, messageId, score, text }
      setAiResults(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("AI search failed", err);
      alert("AI search failed (see console).");
    }
  };

  const openThread = (threadId) => {
    const t = threads.find((x) => x.id === threadId);
    if (t) setSelectedThread(t);
  };

  const highlight = (text) => {
    if (!search.trim()) return text;
    const regex = new RegExp(`(${search})`, "gi");
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <span key={i} className="bg-yellow-300">{part}</span> : part
    );
  };

  return (
    <div className="grid grid-cols-12 h-[85vh] gap-4">
      {/* LEFT SIDEBAR */}
      <div className="col-span-4 bg-white rounded-lg shadow p-4 overflow-y-auto">
        <h2 className="text-xl font-semibold mb-4">Conversations</h2>

        <input
          type="text"
          placeholder="Search buyer, seller, or message…"
          className="w-full border rounded px-3 py-2 mb-2 text-sm"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <button
          onClick={() => setAiModal(true)}
          className="px-3 py-2 bg-purple-600 text-white rounded w-full mb-3"
        >
          🔍 AI Search Conversations
        </button>

        {filteredThreads.length === 0 && (
          <p className="text-gray-500 text-sm">No matching conversations.</p>
        )}

        {filteredThreads.map((th) => (
          <div
            key={th.id}
            onClick={() => setSelectedThread(th)}
            className={`p-3 border rounded mb-2 cursor-pointer hover:bg-gray-100 transition ${selectedThread?.id === th.id ? "bg-gray-100 border-blue-400" : ""}`}
          >
            <p className="font-medium">{highlight(th.buyerName || "Unknown")} ↔ {highlight(th.sellerName || "Unknown")}</p>
            {th.lastMessage && <p className="text-xs mt-1 text-gray-600 line-clamp-1">{highlight(th.lastMessage)}</p>}
          </div>
        ))}
      </div>

      {/* RIGHT PANEL */}
      <div className="col-span-8 bg-white rounded-lg shadow flex flex-col p-4">
        {!selectedThread ? (
          <div className="flex flex-1 items-center justify-center text-gray-400">Select a conversation to view messages.</div>
        ) : (
          <>
            <div className="pb-3 border-b mb-4">
              <h3 className="font-semibold text-lg">{selectedThread.buyerName} ↔ {selectedThread.sellerName}</h3>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2">
              {messages.map((m) => {
                const isAdmin = m.senderType === "admin";
                const bubbleStyle = isAdmin ? "bg-blue-600 text-white" : m.senderType === "seller" ? "bg-gray-200" : "bg-green-200";
                return (
                  <div key={m.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div className={`p-3 rounded-lg max-w-[75%] shadow ${bubbleStyle}`}>
                      <p className="text-sm">{m.text}</p>
                      {m.createdAt?.toDate && <p className="text-[10px] mt-1 opacity-70">{m.createdAt.toDate().toLocaleString()}</p>}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="mt-4 flex gap-2">
              <input value={messageText} onChange={(e) => setMessageText(e.target.value)} className="flex-1 border rounded px-3 py-2" placeholder="Reply as admin…" />
              <button onClick={sendMessage} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Send</button>
            </div>
          </>
        )}
      </div>

      {/* AI modal */}
      {aiModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-[90%] max-w-lg">
            <h3 className="text-lg font-semibold mb-3">AI Search</h3>

            <textarea className="w-full border rounded p-3 h-32" placeholder="Find conversations where buyers mention bad credit" value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} />

            <div className="flex gap-3 mt-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={runAiSearch}>Run Search</button>
              <button className="px-4 py-2 border rounded" onClick={() => setAiModal(false)}>Close</button>
            </div>

            <div className="mt-4 space-y-3 max-h-64 overflow-y-auto">
              {aiResults.length === 0 && <p className="text-gray-500">No AI results yet.</p>}
              {aiResults.map((r) => (
                <div key={r.messageId} onClick={() => { openThread(r.threadId); setAiModal(false); }} className="p-3 border rounded cursor-pointer hover:bg-gray-100">
                  <p className="font-medium">Thread: {r.threadId}</p>
                  <p className="text-sm text-gray-600">{r.text}</p>
                  <p className="text-xs text-gray-400">Score: {Number(r.score).toFixed(3)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
