// client/src/components/ListingManager.jsx
import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc, limit, startAfter, getDocs } from "firebase/firestore";
import ListingCard from "./ListingCard";
import ListingForm from "./ListingForm";
import ListingFilters from "./ListingFilters";
import useAuth from "../hooks/useAuth";

export default function ListingManager() {
  const { user, role } = useAuth();
  const [listings, setListings] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filters, setFilters] = useState({ city: "", min: null, max: null, q: "" });
  const [lastDoc, setLastDoc] = useState(null);
  const PAGE_SIZE = 12;
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "listings"), orderBy("createdAt", "desc"), limit(PAGE_SIZE));
    const unsub = onSnapshot(q, (snap) => {
      const arr = [];
      snap.forEach((d) => arr.push({ id: d.id, ...d.data() }));
      setListings(arr);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
    }, (err) => console.error("Listings snapshot error:", err));
    return () => unsub();
  }, []);

  const handleAdd = () => { setEditing(null); setShowForm(true); };
  const handleEdit = (listing) => { setEditing(listing); setShowForm(true); };
  const handleDelete = async (id) => {
    if (!confirm("Delete this listing?")) return;
    await deleteDoc(doc(db, "listings", id));
  };

  const loadMore = async () => {
    if (!lastDoc) return;
    setLoadingMore(true);
    try {
      const qMore = query(collection(db, "listings"), orderBy("createdAt", "desc"), startAfter(lastDoc), limit(PAGE_SIZE));
      const snap = await getDocs(qMore);
      const arr = [];
      snap.forEach(d => arr.push({ id: d.id, ...d.data() }));
      setListings(prev => [...prev, ...arr]);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
    } finally {
      setLoadingMore(false);
    }
  };

  const onSaved = () => { setShowForm(false); setEditing(null); };

  // local filter for admin view
  const filtered = listings.filter(item => {
    if (filters.city && item.city !== filters.city) return false;
    if (filters.min != null && item.price != null && Number(item.price) < filters.min) return false;
    if (filters.max != null && item.price != null && Number(item.price) > filters.max) return false;
    if (filters.q && !((item.title||"").toLowerCase().includes(filters.q.toLowerCase()) || (item.address||"").toLowerCase().includes(filters.q.toLowerCase()))) return false;
    return true;
  });

  return (
    <div>
      <div className="header" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <h2>Listings</h2>
        {(role === "admin" || role === "seller") && <button className="button" onClick={handleAdd}>+ Add Listing</button>}
      </div>

      <ListingFilters onApply={(f)=>setFilters(f)} />

      {showForm && <ListingForm initial={editing} onSaved={onSaved} onCancel={()=>{setShowForm(false); setEditing(null)}} />}

      <div className="grid" style={{ marginTop: 12 }}>
        {filtered.length === 0 ? <div className="card small">No listings yet.</div> : filtered.map(l => (
          <ListingCard key={l.id} listing={l} onEdit={handleEdit} onDelete={handleDelete} currentUid={user?.uid} role={role} />
        ))}
      </div>

      <div style={{ textAlign:"center", marginTop:12 }}>
        <button className="button" onClick={loadMore} disabled={loadingMore}>{loadingMore ? "Loading..." : "Load more"}</button>
      </div>
    </div>
  );
}
