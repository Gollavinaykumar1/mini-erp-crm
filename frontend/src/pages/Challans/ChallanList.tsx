import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Challan } from '../../types';
import { Link } from 'react-router-dom';
import { Plus, Eye } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ChallanList: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(false);
  const { hasRole } = useAuth();

  useEffect(() => {
    setLoading(true);
    api.get('/challans')
      .then(res => setChallans(res.data.data.challans))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Sales Challans</h2>
        {hasRole(['ADMIN', 'SALES']) && (
          <Link to="/challans/new" className="btn btn-primary flex items-center gap-2">
            <Plus size={16} /> Create Challan
          </Link>
        )}
      </div>

      <div className="card table-container">
        {loading ? <div className="p-4 text-center">Loading...</div> : (
          <table>
            <thead>
              <tr>
                <th>Challan No</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total Qty</th>
                <th>Status</th>
                <th>Created By</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {challans.length === 0 && <tr><td colSpan={7} style={{textAlign: 'center'}}>No challans found.</td></tr>}
              {challans.map(c => (
                <tr key={c.id}>
                  <td style={{fontWeight: '500'}}>{c.challanNumber}</td>
                  <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td>{c.customer.businessName}</td>
                  <td>{c.totalQuantity}</td>
                  <td>
                    <span className={`badge ${c.status === 'CONFIRMED' ? 'badge-success' : c.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>{c.user.name}</td>
                  <td>
                    <Link to={`/challans/${c.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}><Eye size={16} /></Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
