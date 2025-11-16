import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db } from '../firebase';
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';
import SellerBadges from './SellerBadges';
import MessageForm from './MessageForm';
import '../styles/SellerProfile.css';

function SellerProfile() {
  const { id: sellerId } = useParams();
  const [profile, setProfile] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchProfileAndReviews = async () => {
      try {
        const docRef = doc(db, 'sellers', sellerId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error('Seller not found');
        const sellerData = docSnap.data();
        setProfile(sellerData);

        const q = query(
          collection(db, 'reviews'),
          where('sellerId', '==', sellerId)
        );
        const reviewSnap = await getDocs(q);
        const reviewData = reviewSnap.docs.map((doc) => doc.data());
        setReviews(reviewData);
      } catch (err) {
        console.error(err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndReviews();
  }, [sellerId]);

  if (loading) return <p>Loading...</p>;
  if (error || !profile) return <p>Error loading seller profile.</p>;

  return (
    <div className="seller-profile">
      <h2>{profile.name}</h2>
      {profile.photoURL && (
        <img src={profile.photoURL} alt="Profile" style={{ height: '120px' }} />
      )}
      <p>{profile.bio}</p>
      <p>
        <strong>Specialties:</strong> {profile.specialties?.join(', ') || 'N/A'}
      </p>
      <p>
        <strong>Service Areas:</strong>{' '}
        {profile.serviceAreas?.join(', ') || 'N/A'}
      </p>

      <SellerBadges
        rating={profile.rating}
        transactions={profile.transactions}
        responseRate={profile.responseRate}
      />

      <h3>Reviews</h3>
      {reviews.length === 0 ? (
        <p>No reviews yet.</p>
      ) : (
        <ul>
          {reviews.map((r, i) => (
            <li key={i}>
              <strong>{r.buyerEmail}</strong> – ⭐ {r.rating}
              <p>{r.comment}</p>
            </li>
          ))}
        </ul>
      )}

      {profile.email && (
        <MessageForm sellerId={sellerId} sellerEmail={profile.email} />
      )}
    </div>
  );
}

export default SellerProfile;
