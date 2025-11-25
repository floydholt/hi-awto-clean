import React from 'react';
import SellerDashboard from '../components/SellerDashboard';
import SellerEditProfile from '../components/SellerEditProfile';
import SellerLeaderboard from '../components/SellerLeaderboard';
import SellerProfile from '../components/SellerProfile';

export default function SellerPortal() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Welcome to the Seller Portal</h1>
      <SellerProfile />
      <SellerEditProfile />
      <SellerDashboard />
      <SellerLeaderboard />
    </div>
  );
}
