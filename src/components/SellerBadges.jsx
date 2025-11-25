import React from 'react';
import '../styles/SellerBadges.css';

function SellerBadges({ rating, transactions, responseRate }) {
  const badges = [];

  if (rating >= 4.8 && transactions >= 10) {
    badges.push({ label: 'Top Rated', icon: '🌟' });
  }

  if (transactions >= 25) {
    badges.push({ label: 'Power Seller', icon: '🚀' });
  }

  if (responseRate >= 0.95) {
    badges.push({ label: 'Responsive Pro', icon: '💬' });
  }

  if (badges.length === 0) {
    badges.push({ label: 'New Seller', icon: '🆕' });
  }

  return (
    <div className="seller-badges">
      {badges.map((b, i) => (
        <span key={i} className="badge">
          {b.icon} {b.label}
        </span>
      ))}
    </div>
  );
}

export default SellerBadges;
