import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
} from 'firebase/firestore';

function AdminReviewModeration() {
  const [flaggedReviews, setFlaggedReviews] = useState([]);

  useEffect(() => {
    const fetchFlagged = async () => {
      const q = query(collection(db, 'reviews'), where('flagged', '==', true));
      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setFlaggedReviews(reviews);
    };
    fetchFlagged();
  }, []);

  const handleApprove = async (id) => {
    await updateDoc(doc(db, 'reviews', id), { flagged: false });
    setFlaggedReviews((prev) => prev.filter((r) => r.id !== id));
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'reviews', id));
    setFlaggedReviews((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      <h2>🚨 Flagged Reviews</h2>
      {flaggedReviews.length === 0 ? (
        <p>No flagged reviews.</p>
      ) : (
        <ul>
          {flaggedReviews.map((r) => (
            <li key={r.id}>
              <strong>{r.buyerEmail}</strong> – ⭐ {r.rating}<br />
              <em>{r.comment}</em>
              <div style={{ marginTop: '0.5rem' }}>
                <button onClick={() => handleApprove(r.id)}>✅ Approve</button>
                <button onClick={() => handleDelete(r.id)} style={{ marginLeft: '1rem', color: 'red' }}>
                  🗑 Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default AdminReviewModeration;
