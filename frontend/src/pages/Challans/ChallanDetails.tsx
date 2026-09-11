import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Challan } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const ChallanDetails: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasRole } = useAuth();
  
  const [challan, setChallan] = useState<Challan | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchChallan = async () => {
    try {
      const res = await api.get(`/challans/${id}`);
      setChallan(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallan();
  }, [id]);

  const handleAction = async (action: 'confirm' | 'cancel') => {
    if (!window.confirm(`Are you sure you want to ${action} this challan?`)) return;
    
    setActionLoading(true);
    try {
      await api.post(`/challans/${id}/${action}`);
      fetchChallan();
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${action} challan`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  if (!challan) return <div style={{ padding: '2rem', textAlign: 'center' }}>Challan not found.</div>;

  const canAction = challan.status === 'DRAFT' && hasRole(['ADMIN', 'WAREHOUSE', 'SALES']);

  return (
    <div className="card" style={{ maxWidth: '56rem', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Challan #{challan.challanNumber}</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{new Date(challan.createdAt).toLocaleString()}</p>
        </div>
        <div>
          <span className={`badge ${challan.status === 'CONFIRMED' ? 'badge-success' : challan.status === 'CANCELLED' ? 'badge-danger' : 'badge-warning'}`} style={{ fontSize: '1rem', padding: '0.25rem 1rem' }}>
            {challan.status}
          </span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-color)', borderRadius: '0.5rem' }}>
        <div>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.875rem', textTransform: 'uppercase' }}>Customer</div>
          <div style={{ fontWeight: '500', fontSize: '1.125rem' }}>{challan.customer.businessName}</div>
        </div>
        <div>
          <div style={{ color: 'var(--text-secondary)', fontWeight: 'bold', fontSize: '0.875rem', textTransform: 'uppercase' }}>Created By</div>
          <div>{challan.user.name}</div>
        </div>
      </div>

      <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Items</h3>
      <div className="table-container" style={{ marginBottom: '1.5rem' }}>
        <table>
          <thead>
            <tr>
              <th>SKU</th>
              <th>Product Name</th>
              <th>Unit Price</th>
              <th>Quantity</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {challan.items?.map(item => (
              <tr key={item.id}>
                <td>{item.sku}</td>
                <td>{item.productName}</td>
                <td>₹{item.unitPrice}</td>
                <td>{item.quantity}</td>
                <td>₹{item.unitPrice * item.quantity}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} style={{ textAlign: 'right', fontWeight: 'bold' }}>Total Quantity:</td>
              <td colSpan={2} style={{ fontWeight: 'bold' }}>{challan.totalQuantity}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
        <button onClick={() => navigate('/challans')} className="btn btn-outline">Back</button>
        {canAction && (
          <>
            <button onClick={() => handleAction('cancel')} disabled={actionLoading} className="btn btn-danger">Cancel</button>
            <button onClick={() => handleAction('confirm')} disabled={actionLoading} className="btn btn-primary">Confirm Challan</button>
          </>
        )}
      </div>
    </div>
  );
};
