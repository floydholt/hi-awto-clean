// client/src/components/admin/AdminReviewModeration.jsx
import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

export default function AdminReviewModeration() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const snap = await getDocs(collection(db, "reviews"));
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setReviews(list);
      } catch (err) {
        console.error("fetchReviews failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const toggleApproval = async (review) => {
    try {
      const ref = doc(db, "reviews", review.id);
      await updateDoc(ref, { approved: !review.approved });

      setReviews((prev) =>
        prev.map((r) => (r.id === review.id ? { ...r, approved: !r.approved } : r))
      );
    } catch (err) {
      console.error("toggle approval err", err);
    }
  };

  if (loading) return <p>Loading reviews...</p>;

  if (reviews.length === 0)
    return <p className="p-4">No reviews found.</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-3">Review Moderation</h2>

      <div className="space-y-3">
        {reviews.map((r) => (
          <div key={r.id} className="bg-white p-3 shadow rounded border">
            <p className="font-medium">{r.author}</p>
            <p className="text-gray-600 text-sm">{r.content}</p>

            <button
              className={`mt-2 px-3 py-1 rounded ${
                r.approved ? "bg-red-600 text-white" : "bg-green-600 text-white"
              }`}
              onClick={() => toggleApproval(r)}
            >
              {r.approved ? "Unapprove" : "Approve"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
