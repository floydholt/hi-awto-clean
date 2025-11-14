import React, { useState, useEffect } from 'react';
import '../styles/BuyerPortal.css';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { db, auth } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

function BuyerPortal() {
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    income: '',
    creditScore: '',
    location: '',
    budget: '',
    leaseTerm: '',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'buyerApplications'), formData);
      alert('Application submitted successfully!');
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('Submission failed. Try again.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    alert('Logged out');
  };

  return (
    <div className="buyer-portal">
      <div className="portal-header">
        <div>
          <h2>Buyer Application</h2>
          {user && <p className="greeting">Welcome, {user.email}</p>}
        </div>
        <button onClick={handleLogout}>Logout</button>
      </div>

      <form onSubmit={handleSubmit}>
        <input name="name" placeholder="Full Name" onChange={handleChange} required />
        <input name="email" placeholder="Email" onChange={handleChange} required />
        <input name="phone" placeholder="Phone Number" onChange={handleChange} required />
        <input name="income" placeholder="Monthly Income" onChange={handleChange} />
        <input name="creditScore" placeholder="Credit Score (optional)" onChange={handleChange} />
        <input name="location" placeholder="Desired Location" onChange={handleChange} />
        <input name="budget" placeholder="Monthly Budget" onChange={handleChange} />
        <select name="leaseTerm" onChange={handleChange}>
          <option value="">Select Lease Term</option>
          <option value="12 months">12 months</option>
          <option value="24 months">24 months</option>
          <option value="36 months">36 months</option>
        </select>
        <button type="submit">Submit Application</button>
      </form>
    </div>
  );
}

export default BuyerPortal;
