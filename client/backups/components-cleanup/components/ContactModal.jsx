import React from 'react';
import '../styles/ContactModal.css';

import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

function ContactModal({ listingId, sellerEmail, sellerName, onClose }) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const senderName = formData.get('name');
    const senderEmail = formData.get('email');
    const message = formData.get('message');

    try {
      await addDoc(collection(db, 'messages'), {
        senderName,
        senderEmail,
        message,
        listingId,
        sellerEmail,
        timestamp: serverTimestamp(),
      });
      alert('Message sent!');
      onClose();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Contact {sellerName || 'Seller'}</h3>
        <form onSubmit={handleSubmit}>
          <input name="name" type="text" placeholder="Your name" required />
          <input name="email" type="email" placeholder="Your email" required />
          <textarea name="message" placeholder="Your message" rows="4" required />
          <button type="submit">Send Message</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </form>
      </div>
    </div>
  );
}

export default ContactModal;
