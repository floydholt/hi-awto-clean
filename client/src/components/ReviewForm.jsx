import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import '../styles/ReviewForm.css';

function ReviewForm({ sellerId }) {
  const [eligible, setEligible] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const checkEligibility = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;

        const q = query(
          collection(db, 'buyerApplications'),
          where('email', '==', user.email),
          where('sellerId', '==', sellerId),
          where('status', 'in', ['approved', 'completed'])
        );
        const snapshot = await getDocs(q);
        setEligible(!snapshot.empty);
      } catch (err) {
        console.error('Error checking eligibility:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    checkEligibility();
  }, [sellerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user || !eligible) return;

    try {
      await addDoc(collection(db, 'reviews'), {
        sellerId,
        buyerEmail: user.email,
        rating,
        comment,
        timestamp: serverTimestamp(),
        flagged: false,
      });

      setStatus('✅ Review submitted!');
      setRating(5);
      setComment('');
    } catch (err) {
      console.error('Error submitting review:', err);
      setStatus('❌ Failed to submit review.');
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading review form.</p>;
  if (!eligible) return <p>You must complete a transaction with this seller before leaving a review.</p>;

  return (
    <div className="review-form">
      <h3>Leave a Review</h3>
      <form onSubmit={handleSubmit}>
        <label>Rating</label>
        <div className="star-rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={star <= rating ? 'filled' : ''}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>

        <label>Comment</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          required
        />

        <button type="submit">Submit Review</button>
      </form>
      {status && <p className="status-message">{status}</p>}
    </div>
  );
}

export default ReviewForm;
