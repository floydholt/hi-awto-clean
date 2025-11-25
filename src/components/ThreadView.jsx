import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
} from 'firebase/firestore';
import '../styles/ThreadView.css';

function ThreadView({ sellerEmail }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const user = auth.currentUser;
        if (!user) throw new Error('Not authenticated');

        const q = query(
          collection(db, 'messages'),
          where('senderEmail', 'in', [user.email, sellerEmail]),
          where('sellerEmail', '==', sellerEmail),
          orderBy('timestamp', 'asc')
        );

        const snapshot = await getDocs(q);
        const data = snapshot.docs.map((doc) => doc.data());
        setMessages(data);
      } catch (err) {
        console.error('Error fetching messages:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [sellerEmail]);

  if (loading) return <p>Loading messages...</p>;
  if (error) return <p>Error loading thread.</p>;
  if (messages.length === 0) return <p>No messages yet.</p>;

  return (
    <div className="thread-view">
      <h3>Message Thread</h3>
      <ul>
        {messages.map((msg, i) => (
          <li key={i} className={msg.senderEmail === auth.currentUser.email ? 'sent' : 'received'}>
            <div className="meta">
              <strong>{msg.senderEmail}</strong> – {msg.subject}
            </div>
            <div className="body">{msg.message}</div>
            <div className="timestamp">
              {msg.timestamp?.toDate().toLocaleString() || 'Pending...'}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ThreadView;
