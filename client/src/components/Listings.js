// client/src/components/Listings.js
import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import ListingCard from "./ListingCard";

export default function Listings(){
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach(doc => arr.push({ id: doc.id, ...doc.data() }));
      setListings(arr);
    }, (err) => {
      console.error("Listings snapshot error", err);
    });
    return () => unsub();
  }, []);

  if(!listings.length) return <div className="card small">No listings yet. You can add sample listings in Firestore collection <strong>listings</strong>.</div>;

  return (
    <div className="grid" id="listings">
      {listings.map(l => <ListingCard key={l.id} listing={l} />)}
    </div>
  );
}
