// client/src/pages/MyMessages.jsx
import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import useAuth from "../hooks/useAuth";
import { Link } from "react-router-dom";
import "../styles/swipe.css"; 

export default function MyMessages() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);

  // ----------------------------------------------
  // Load threads
  // ----------------------------------------------
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "threads"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setThreads(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });

    return () => unsub();
  }, [user]);

  // ----------------------------------------------
  // Mark thread read/unread
  // ----------------------------------------------
  async function updateUnread(thread, unreadValue) {
    const ref = doc(db, "threads", thread.id);
    const unreadCount = { ...(thread.unreadCount || {}) };

    unreadCount[user.uid] = unreadValue;
    await updateDoc(ref, { unreadCount });
  }

  // ----------------------------------------------
  // DELETE THREAD
  // ----------------------------------------------
  async function deleteThread(thread) {
    if (!window.confirm("Delete this conversation? This cannot be undone.")) {
      return;
    }

    await deleteDoc(doc(db, "threads", thread.id));
  }

  // ----------------------------------------------
  // Swipe gesture logic
  // ----------------------------------------------
  const startX = useRef({});
  const deltaX = useRef({});

  function onStart(e, id) {
    startX.current[id] = e.touches ? e.touches[0].clientX : e.clientX;
  }

  function onMove(e, id) {
    const current =
      e.touches?.[0].clientX ?? e.clientX;

    const diff = current - startX.current[id];
    deltaX.current[id] = diff;

    const el = document.getElementById("thread-" + id);
    if (!el) return;

    // Allow sliding up to -120px to reveal delete action
    const clamped = Math.max(-120, Math.min(diff, 80));
    el.style.transform = `translateX(${clamped}px)`;
  }

  function onEnd(thread) {
    const id = thread.id;
    const diff = deltaX.current[id] || 0;
    const el = document.getElementById("thread-" + id);
    if (!el) return;

    el.style.transition = "transform .25s ease";

    if (diff > 60) {
      // Swipe right → Mark unread
      updateUnread(thread, 1);
      el.style.transform = "translateX(0px)";
    } else if (diff < -100) {
      // Swipe left far → DELETE immediately
      el.style.transform = "translateX(-200px)";
      setTimeout(() => deleteThread(thread), 160);
    } else if (diff < -60) {
      // Swipe left → Show delete button
      el.style.transform = "translateX(-100px)";
    } else {
      // Snap back
      el.style.transform = "translateX(0px)";
    }

    setTimeout(() => {
      el.style.transition = "";
    }, 260);

    startX.current[id] = 0;
    deltaX.current[id] = 0;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">My Messages</h2>

      {threads.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">
          No conversations yet.
        </p>
      ) : (
        <div className="thread-list flex flex-col gap-2">
          {threads.map((t) => {
            const unread = t.unreadCount?.[user.uid] || 0;

            return (
              <div key={t.id} className="relative">

                {/* RIGHT SWIPE ACTION */}
                <div className="swipe-action-left">Unread</div>

                {/* LEFT SWIPE ACTIONS */}
                <div className="swipe-delete-action">Delete</div>

                <Link
                  id={`thread-${t.id}`}
                  to={`/messages/${t.id}`}
                  className="thread-tile p-3 border rounded bg-white flex justify-between items-center"
                  onTouchStart={(e) => onStart(e, t.id)}
                  onTouchMove={(e) => onMove(e, t.id)}
                  onTouchEnd={() => onEnd(t)}
                  onMouseDown={(e) => onStart(e, t.id)}
                  onMouseMove={(e) => onMove(e, t.id)}
                  onMouseUp={() => onEnd(t)}
                >
                  <div>
                    <div className="font-semibold">{t.title || "Conversation"}</div>
                    <div className="text-sm opacity-70">
                      {t.lastMessagePreview || "No messages yet"}
                    </div>
                  </div>

                  {unread > 0 && (
                    <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                      {unread}
                    </span>
                  )}
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
