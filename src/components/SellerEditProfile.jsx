import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import '../styles/SellerEditProfile.css';

function SellerEditProfile() {
  const [profile, setProfile] = useState({
    name: '',
    bio: '',
    specialties: '',
    serviceAreas: '',
    photoURL: '',
  });
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, 'sellers', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleUpload = async () => {
    if (!file) return null;
    const storageRef = ref(storage, `sellerPhotos/${auth.currentUser.uid}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Saving...');
    const user = auth.currentUser;
    if (!user) return;

    let photoURL = profile.photoURL;
    if (file) {
      photoURL = await handleUpload();
    }

    const updatedProfile = {
      ...profile,
      photoURL,
      specialties: profile.specialties.split(',').map(s => s.trim()),
      serviceAreas: profile.serviceAreas.split(',').map(s => s.trim()),
      uid: user.uid,
      email: user.email,
    };

    await setDoc(doc(db, 'sellers', user.uid), updatedProfile);
    setStatus('Profile updated!');
  };

  return (
    <div className="edit-profile">
      <h2>Edit Seller Profile</h2>
      <form onSubmit={handleSubmit}>
        <label>Name</label>
        <input name="name" value={profile.name} onChange={handleChange} />

        <label>Bio</label>
        <textarea name="bio" value={profile.bio} onChange={handleChange} />

        <label>Specialties (comma-separated)</label>
        <input name="specialties" value={profile.specialties} onChange={handleChange} />

        <label>Service Areas (comma-separated)</label>
        <input name="serviceAreas" value={profile.serviceAreas} onChange={handleChange} />

        <label>Profile Photo</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />

        <button type="submit">Save Profile</button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
}

export default SellerEditProfile;
