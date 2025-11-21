// client/src/pages/ViewThread.jsx
import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  updateDoc,
} from "firebase/firestore";
import useAuth from "../hooks/useAuth";
import MessageThreadView from "../components/MessageThreadView";

export default function ViewThread() {
  const { threadId } = useParams();
  const { user } = useAuth();

  useEffect(() => {
    if (!user || !threadId) return;

    const ref = doc(db, "threads", threadId);

    // Clear unread count for this user
    updateDoc(ref, {
      [`unreadCount.${user.uid}`]: 0,
    });

  }, [user, threadId]);

  return <MessageThreadView threadId={threadId} />;
}
