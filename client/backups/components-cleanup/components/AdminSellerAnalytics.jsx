import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

function AdminSellerAnalytics() {
  const [sellers, setSellers] = useState([]);

  useEffect(() => {
    const fetchSellers = async () => {
      const q = query(collection(db, 'sellers'), orderBy('responseRate', 'desc'));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => doc.data());
      setSellers(data);
    };
    fetchSellers();
  }, []);

  return (
    <div>
      <h2>📊 Seller Response Analytics</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Response Rate</th>
            <th>Transactions</th>
          </tr>
        </thead>
        <tbody>
          {sellers.map((s, i) => (
            <tr key={i}>
              <td>{s.name}</td>
              <td>{s.email}</td>
              <td>{(s.responseRate * 100).toFixed(0)}%</td>
              <td>{s.transactions || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminSellerAnalytics;
