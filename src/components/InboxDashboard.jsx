import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import { Link } from 'react-router-dom';
import '../styles/InboxDashboard.css';

function InboxDashboard() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInbox = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'messages'),
        where('senderEmail', '==', user.email),
        orderBy('timestamp', 'desc')
      );

      const snapshot = await getDocs(q);
      const messages = snapshot.docs.map((doc) => doc.data());

      const grouped = {};
      messages.forEach((msg) => {
        const key = msg.sellerEmail;
        if (!grouped[key]) grouped[key] = msg;
      });

      const threadList = Object.entries(grouped).map(([sellerEmail, msg]) => ({
        sellerEmail,
        subject: msg.subject,
        preview: msg.message,
        timestamp: msg.timestamp?.toDate().toLocaleString() || 'Pending...',
      }));

      setThreads(threadList);
      setLoading(false);
    };

    fetchInbox();
  }, []);

  if (loading) return <p>Loading inbox...</p>;
  if (threads.length === 0) return <p>No messages yet.</p>;

  return (
    <div className="inbox-dashboard">
      <h2>📥 Your Inbox</h2>
      <ul>
        {threads.map((t, i) => (
          <li key={i}>
            <Link to={`/messages/${t.sellerEmail}`}>
              <strong>{t.sellerEmail}</strong> – {t.subject}
              <p>{t.preview}</p>
              <small>{t.timestamp}</small>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default InboxDashboard;
