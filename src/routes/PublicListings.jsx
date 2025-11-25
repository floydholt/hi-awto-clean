// client/src/routes/PublicListings.jsx
import React, { useEffect, useState, useCallback } from "react";
import {
  collection,
  query,
  where,
  orderBy,
  startAfter,
  limit,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import ListingCard from "../components/ListingCard";
import ListingFilters from "../components/ListingFilters";

const PAGE_SIZE = 9;

export default function PublicListings({ previewLimit = null }) {
  const [filters, setFilters] = useState({});
  const [listings, setListings] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const buildQuery = (filtersArg, startAfterDoc = null) => {
    // base collection
    let q = collection(db, "listings");

    // If city filter exists, do a simple where
    const constraints = [];

    if (filtersArg.city) {
      constraints.push(where("city", "==", filtersArg.city));
    }

    // price range: Firestore can't do range + inequality on different fields easily.
    if (filtersArg.minPrice != null) {
      constraints.push(where("price", ">=", filtersArg.minPrice));
    }
    if (filtersArg.maxPrice != null) {
      constraints.push(where("price", "<=", filtersArg.maxPrice));
    }

    // ordering — try to keep indexed fields first (price, createdAt)
    constraints.push(orderBy("createdAt", "desc"));

    if (startAfterDoc) {
      constraints.push(startAfter(startAfterDoc));
    }

    constraints.push(limit(PAGE_SIZE));

    return query(q, ...constraints);
  };

  const loadFirst = useCallback(async () => {
    setLoading(true);
    try {
      const q = buildQuery(filters);
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setListings(docs);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error("loadFirst error", err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    // reset paging when filters change
    setListings([]);
    setLastDoc(null);
    setHasMore(true);
    loadFirst();
  }, [filters, loadFirst]);

  const loadMore = async () => {
    if (!hasMore || !lastDoc) return;
    setLoading(true);
    try {
      const q = buildQuery(filters, lastDoc);
      const snap = await getDocs(q);
      const docs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setListings((prev) => [...prev, ...docs]);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err) {
      console.error("loadMore error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <ListingFilters onApply={(f) => setFilters(f)} />

      {loading && listings.length === 0 ? (
        <p>Loading listings…</p>
      ) : listings.length === 0 ? (
        <p>No listings found.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            {hasMore ? (
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded"
              >
                {loading ? "Loading…" : "Load more"}
              </button>
            ) : (
              <span className="text-gray-600">No more results</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}
