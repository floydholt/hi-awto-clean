import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import '../styles/MessageForm.css';

function MessageForm({ sellerId, sellerEmail }) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return;

    try {
      await addDoc(collection(db, 'messages'), {
        sellerId,
        sellerEmail,
        senderEmail: user.email,
        subject,
        message,
        timestamp: serverTimestamp(),
        read: false,
      });

      setSubject('');
      setMessage('');
      setStatus('✅ Message sent!');
    } catch (err) {
      console.error('Error sending message:', err);
      setStatus('❌ Failed to send message.');
    }
  };

  return (
    <div className="message-form">
      <h3>Contact Seller</h3>
      <form onSubmit={handleSubmit}>
        <label>Subject</label>
        <input
          type="text"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
        />

        <label>Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />

        <button type="submit">Send Message</button>
      </form>
      {status && <p className="status-message">{status}</p>}
    </div>
  );
}

export default MessageForm;
