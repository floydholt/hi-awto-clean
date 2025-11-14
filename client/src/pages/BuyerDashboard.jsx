import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection,
  query,
  where,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import '../styles/BuyerDashboard.css';
import ContactModal from '../components/ContactModal';
import ApplicationCard from '../components/ApplicationCard';
import ListingCard from '../components/ListingCard';
import MessageGroup from '../components/MessageGroup';

function BuyerDashboard() {
  const [user, setUser] = useState(null);
  const [application, setApplication] = useState(null);
  const [savedListings, setSavedListings] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessageAlert, setNewMessageAlert] = useState(false);
  const [replyTo, setReplyTo] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        const appQuery = query(
          collection(db, 'buyerApplications'),
          where('email', '==', currentUser.email)
        );
        const unsubscribeApp = onSnapshot(appQuery, (snapshot) => {
          if (!snapshot.empty) {
            setApplication(snapshot.docs[0].data());
          }
        });

        const listingsQuery = query(
          collection(db, 'savedListings'),
          where('userId', '==', currentUser.uid)
        );
        const unsubscribeListings = onSnapshot(listingsQuery, (snapshot) => {
          const listings = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSavedListings(listings);
        });

        const messagesQuery = query(
          collection(db, 'messages'),
          where('sellerEmail', '==', currentUser.email)
        );
        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
          const msgs = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setMessages((prev) => {
            const newUnread = msgs.filter((msg) => !msg.read).length > prev.filter((msg) => !msg.read).length;
            if (newUnread) {
              setNewMessageAlert(true);
              setTimeout(() => setNewMessageAlert(false), 4000);
            }
            return msgs;
          });
        });

        return () => {
          unsubscribeApp();
          unsubscribeListings();
          unsubscribeMessages();
        };
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const handleRemoveListing = async (listingId) => {
    try {
      await deleteDoc(doc(db, 'savedListings', listingId));
      setSavedListings((prev) => prev.filter((item) => item.id !== listingId));
    } catch (error) {
      console.error('Error removing listing:', error);
      alert('Failed to remove listing.');
    }
  };

  const statusSteps = ['Submitted', 'Under Review', 'Approved'];
  const getStatusIndex = (status) => {
    switch (status?.toLowerCase()) {
      case 'submitted':
        return 0;
      case 'under review':
        return 1;
      case 'approved':
        return 2;
      default:
        return 0;
    }
  };

  const formatTimestamp = (ts) => {
    if (!ts?.toDate) return '';
    return ts.toDate().toLocaleString();
  };

  const listingMap = savedListings.reduce((acc, listing) => {
    acc[listing.id] = listing.address;
    return acc;
  }, {});

  const groupedMessages = messages.reduce((acc, msg) => {
    const key = msg.listingId || 'general';
    if (!acc[key]) acc[key] = [];
    acc[key].push(msg);
    return acc;
  }, {});

  const handleReply = async (msg) => {
    setReplyTo(msg);
    if (!msg.read) {
      try {
        await updateDoc(doc(db, 'messages', msg.id), { read: true });
      } catch (error) {
        console.error('Failed to mark message as read:', error);
      }
    }
  };

  return (
    <div className="buyer-dashboard">
      <h2>Welcome to Your Dashboard</h2>
      {user && <p className="greeting">Logged in as: {user.email}</p>}

      {newMessageAlert && <div className="toast">📨 New unread message received!</div>}

      <section className="dashboard-section">
        <h3>Your Application</h3>
        {application ? (
          <ApplicationCard
            application={application}
            statusSteps={statusSteps}
            getStatusIndex={getStatusIndex}
          />
        ) : (
          <p>No application found.</p>
        )}
      </section>

      <section className="dashboard-section">
        <h3>Saved Listings</h3>
        {savedListings.length > 0 ? (
          <div className="listing-grid">
            {savedListings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                isSaved={true}
                onRemove={handleRemoveListing}
                onSave={() => {}}
              />
            ))}
          </div>
        ) : (
          <p>No saved listings yet.</p>
        )}
      </section>

      <section className="dashboard-section">
        <h3>Messages from Buyers</h3>
        {Object.keys(groupedMessages).length > 0 ? (
          Object.entries(groupedMessages).map(([listingId, msgs]) => (
            <MessageGroup
              key={listingId}
              listingLabel={listingMap[listingId] || 'Unspecified'}
              messages={msgs}
              formatTimestamp={formatTimestamp}
              handleReply={handleReply}
            />
          ))
        ) : (
          <p>No messages yet.</p>
        )}
      </section>

      {replyTo && (
        <ContactModal
          listingId={replyTo.listingId}
          sellerEmail={replyTo.senderEmail}
          sellerName={replyTo.senderName}
          onClose={() => setReplyTo(null)}
        />
      )}
    </div>
  );
}

export default BuyerDashboard;
