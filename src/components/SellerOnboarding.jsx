import React, { useState } from 'react';
import { auth, db, storage } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import '../styles/SellerOnboarding.css';

function SellerOnboarding() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    bio: '',
    specialties: '',
    serviceAreas: '',
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleUpload = async (uid) => {
    if (!file) return null;
    const storageRef = ref(storage, `sellerPhotos/${uid}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Submitting...');
    const user = auth.currentUser;
    if (!user) {
      setStatus('You must be logged in.');
      return;
    }

    let photoURL = null;
    if (file) {
      photoURL = await handleUpload(user.uid);
    }

    const sellerData = {
      uid: user.uid,
      email: form.email || user.email,
      name: form.name,
      bio: form.bio,
      specialties: form.specialties.split(',').map(s => s.trim()),
      serviceAreas: form.serviceAreas.split(',').map(s => s.trim()),
      photoURL,
      rating: 0,
      reviewCount: 0,
      responseRate: 1,
      transactions: 0,
    };

    try {
      await setDoc(doc(db, 'sellers', user.uid), sellerData);
      setStatus('Seller profile created!');
      setForm({
        name: '',
        email: '',
        bio: '',
        specialties: '',
        serviceAreas: '',
      });
      setFile(null);
    } catch (error) {
      console.error('Error creating seller profile:', error);
      setStatus('Failed to create profile.');
    }
  };

  return (
    <div className="seller-onboarding">
      <h2>Seller Onboarding</h2>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Email</label>
        <input name="email" value={form.email} onChange={handleChange} type="email" />

        <label>Bio</label>
        <textarea name="bio" value={form.bio} onChange={handleChange} required />

        <label title="Comma-separated specialties like condos, townhomes, etc.">
          Specialties (comma-separated)
        </label>
        <input name="specialties" value={form.specialties} onChange={handleChange} required />

        <label title="Comma-separated service areas like San Diego, Carlsbad, etc.">
          Service Areas (comma-separated)
        </label>
        <input name="serviceAreas" value={form.serviceAreas} onChange={handleChange} required />

        <label>Profile Photo (optional)</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button type="submit">Submit Profile</button>
      </form>

      {status === 'Submitting...' && <p className="status-message">⏳ Submitting profile…</p>}
      {status === 'Seller profile created!' && <p className="status-message success">✅ Profile created!</p>}
      {status === 'Failed to create profile.' && <p className="status-message error">❌ Something went wrong.</p>}
      {status === 'You must be logged in.' && <p className="status-message error">⚠️ Please log in first.</p>}
    </div>
  );
}

export default SellerOnboarding;
