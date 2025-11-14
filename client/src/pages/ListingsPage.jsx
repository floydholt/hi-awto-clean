import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  limit,
  startAfter,
} from 'firebase/firestore';
import '../styles/ListingsPage.css';
import ListingCard from '../components/ListingCard';


function ListingsPage() {
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [minBeds, setMinBeds] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [lastDoc, setLastDoc] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const savedQuery = query(
          collection(db, 'savedListings'),
          where('userId', '==', currentUser.uid)
        );

        const unsubscribeSaved = onSnapshot(savedQuery, (snapshot) => {
          const ids = snapshot.docs.map((doc) => doc.data().listingId);
          setSavedIds(ids);
        });

        return () => unsubscribeSaved();
      }
    });

    const unsubscribeListings = onSnapshot(collection(db, 'listings'), (snapshot) => {
      const updatedListings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListings(updatedListings);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeListings();
    };
  }, []);

  const fetchMoreListings = async () => {
    let q = query(collection(db, 'listings'), orderBy('postedDate', 'desc'), limit(10));
    if (lastDoc) q = query(q, startAfter(lastDoc), limit(10));

    const snapshot = await getDocs(q);
    const newListings = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setListings((prev) => [...prev, ...newListings]);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1]);
  };

  const handleSaveListing = async (listing) => {
    if (!user) {
      alert('Please log in to save listings.');
      return;
    }

    if (savedIds.includes(listing.id)) {
      alert('Listing already saved.');
      return;
    }

    try {
      await addDoc(collection(db, 'savedListings'), {
        ...listing,
        listingId: listing.id,
        userId: user.uid,
      });
    } catch (error) {
      console.error('Error saving listing:', error);
      alert('Failed to save listing.');
    }
  };

  const handleRemoveListing = async (listingId) => {
    try {
      const savedQuery = query(
        collection(db, 'savedListings'),
        where('userId', '==', user.uid),
        where('listingId', '==', listingId)
      );

      const unsubscribe = onSnapshot(savedQuery, (snapshot) => {
        if (!snapshot.empty) {
          const docId = snapshot.docs[0].id;
          deleteDoc(doc(db, 'savedListings', docId));
        }
      });

      setTimeout(() => unsubscribe(), 1000);
    } catch (error) {
      console.error('Error removing listing:', error);
      alert('Failed to remove listing.');
    }
  };

  const applyFiltersAndSort = (list) => {
    return list
      .filter((listing) => {
        const matchesSearch = listing.address
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesBeds = minBeds ? listing.beds >= parseInt(minBeds) : true;
        const matchesPrice = maxPrice ? listing.price <= parseInt(maxPrice) : true;
        return matchesSearch && matchesBeds && matchesPrice;
      })
      .sort((a, b) =>
        sortOrder === 'asc' ? a.price - b.price : b.price - a.price
      );
  };

  const allListings = applyFiltersAndSort(listings);
  const savedListingsFiltered = applyFiltersAndSort(
    listings.filter((listing) => savedIds.includes(listing.id))
  );

  return (
    <div className="listings-page">
      <h2>Listings</h2>

      <div className="tab-buttons">
        <button onClick={() => setActiveTab('all')}>All Listings</button>
        <button onClick={() => setActiveTab('saved')}>Saved Listings</button>
      </div>

      <div className="filters">
        <input
          type="text"
          placeholder="Search by address"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <input
          type="number"
          placeholder="Min Beds"
          value={minBeds}
          onChange={(e) => setMinBeds(e.target.value)}
        />
        <input
          type="number"
          placeholder="Max Price"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
        />
        <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          <option value="asc">Price: Low to High</option>
          <option value="desc">Price: High to Low</option>
        </select>
      </div>

      {activeTab === 'all' && (
        <div className="listing-grid">
          {allListings.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isSaved={savedIds.includes(listing.id)}
              onSave={handleSaveListing}
              onRemove={handleRemoveListing}
            />
          ))}
          <button onClick={fetchMoreListings}>Load More</button>
        </div>
      )}

      {activeTab === 'saved' && (
        <div className="listing-grid">
          {savedListingsFiltered.map((listing) => (
            <ListingCard
              key={listing.id}
              listing={listing}
              isSaved={true}
              onSave={handleSaveListing}
              onRemove={handleRemoveListing}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default ListingsPage;
