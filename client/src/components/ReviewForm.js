// src/components/ReviewForm.js
import React, { useState } from 'react';
import { db } from '../utils/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

export default function ReviewForm({ sellerId, buyerEmail }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const submitReview = async () => {
    await addDoc(collection(db, 'reviews'), {
      sellerId,
      buyerEmail,
      rating,
      comment,
      createdAt: Timestamp.now(),
    });
  };

  return (
    <div>
      <h3>Leave a Review</h3>
      <input type="number" value={rating} onChange={e => setRating(+e.target.value)} min="1" max="5" />
      <textarea value={comment} onChange={e => setComment(e.target.value)} />
      <button onClick={submitReview}>Submit</button>
    </div>
  );
}
