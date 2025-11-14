import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import ContactModal from './ContactModal';
import '../styles/SellerDashboard.css';

function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    let unsubscribeMessages = () => {};
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const messagesQuery = query(
          collection(db, 'messages'),
          where('sellerEmail', '==', currentUser.email)
        );

        unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
          const raw = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const grouped = {};
          raw.forEach((msg) => {
            const key = msg.senderEmail;
            if (!grouped[key] || msg.timestamp > grouped[key].timestamp) {
              grouped[key] = msg;
            }
          });

          const sorted = Object.values(grouped).sort(
            (a, b) => b.timestamp?.toMillis() - a.timestamp?.toMillis()
          );

          setMessages(sorted);
        });
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeMessages();
    };
  }, []);

  const handleReply = async (msg) => {
    setReplyTo(msg);
    if (!msg.read) {
      await updateDoc(doc(db, 'messages', msg.id), {
        replyTimestamp: serverTimestamp(),
        read: true,
      });
    }
  };

  return (
    <div className="seller-dashboard">
      <h2>📨 Seller Inbox</h2>
      {messages.length > 0 ? (
        <ul className="message-list">
          {messages.map((msg) => (
            <li
              key={msg.id}
              className={replyTo?.id === msg.id ? 'active' : ''}
            >
              <strong>{msg.senderName}</strong> ({msg.senderEmail})<br />
              <em>{msg.subject || 'No subject'}</em><br />
              <span>{msg.listingAddress || 'Unspecified'}</span>
              {!msg.read && <span className="unread-badge">🔵 Unread</span>}
              <button onClick={() => handleReply(msg)}>Reply</button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No messages yet.</p>
      )}
      {replyTo && (
        <ContactModal
          listingId={replyTo.listingId}
          sellerEmail={replyTo.senderEmail}
          sellerName={replyTo.senderName}
          onClose={() => setReplyTo(null)}
        />
      )}
    </div>
  );
}

export default SellerDashboard;
