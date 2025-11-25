import React from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

function FlagReview({ reviewId }) {
  const handleFlag = async () => {
    await updateDoc(doc(db, 'reviews', reviewId), { flagged: true });
    alert('Review flagged for moderation.');
  };

  return (
    <button onClick={handleFlag} style={{ color: 'red', marginTop: '0.5rem' }}>
      🚩 Flag Review
    </button>
  );
}

export default FlagReview;
