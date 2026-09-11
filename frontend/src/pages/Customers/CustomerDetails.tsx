import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import type { Customer } from '../../types';

export const CustomerDetails: React.FC = () => {
  const { id } = useParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [note, setNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchCustomer = async () => {
    try {
      const res = await api.get(`/customers/${id}`);
      setCustomer(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingNote(true);
    try {
      const d = new Date(followUpDate).toISOString();
      await api.post(`/customers/${id}/followups`, { note, followUpDate: d });
      setNote('');
      setFollowUpDate('');
      fetchCustomer(); // Refresh details
    } catch (err) {
      console.error(err);
      alert('Failed to add follow-up note');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!customer) return <div>Customer not found.</div>;

  return (
    <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
      <div className="card" style={{ flex: '1 1 300px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>{customer.businessName}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{customer.customerName}</p>
          </div>
          <Link to={`/customers/${customer.id}/edit`} className="btn btn-outline">Edit</Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Status</div>
            <div style={{ marginTop: '0.25rem' }}>
              <span className={`badge ${customer.status === 'ACTIVE' ? 'badge-success' : customer.status === 'INACTIVE' ? 'badge-danger' : 'badge-warning'}`}>
                {customer.status}
              </span>
            </div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Type</div>
            <div style={{ marginTop: '0.25rem' }}>{customer.customerType}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Mobile</div>
            <div style={{ marginTop: '0.25rem' }}>{customer.mobileNumber}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Email</div>
            <div style={{ marginTop: '0.25rem' }}>{customer.email || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>GST</div>
            <div style={{ marginTop: '0.25rem' }}>{customer.gstNumber || 'N/A'}</div>
          </div>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Next Follow-up</div>
            <div style={{ marginTop: '0.25rem', color: 'var(--danger-color)', fontWeight: '500' }}>
              {customer.followUpDate ? new Date(customer.followUpDate).toLocaleDateString() : 'None scheduled'}
            </div>
          </div>
        </div>
        
        <div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', fontWeight: 'bold' }}>Address</div>
          <div style={{ marginTop: '0.25rem' }}>{customer.address || 'N/A'}</div>
        </div>
      </div>

      <div className="card" style={{ flex: '1 1 300px' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>CRM Follow-ups</h3>
        
        <form onSubmit={handleAddFollowup} style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '0.5rem' }}>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Note</label>
            <textarea required value={note} onChange={e=>setNote(e.target.value)} className="input-field" rows={2} placeholder="Met with customer..."></textarea>
          </div>
          <div style={{ marginBottom: '0.75rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Next Follow-up Date</label>
            <input required type="datetime-local" value={followUpDate} onChange={e=>setFollowUpDate(e.target.value)} className="input-field" />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submittingNote}>Add Follow-up</button>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {customer.followups && customer.followups.length > 0 ? customer.followups.map(f => (
            <div key={f.id} style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                <span style={{ fontWeight: '600' }}>{f.user.name}</span>
                <span style={{ color: 'var(--text-secondary)' }}>{new Date(f.createdAt).toLocaleDateString()}</span>
              </div>
              <p style={{ fontSize: '0.875rem' }}>{f.note}</p>
              <div style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--primary-color)' }}>
                Scheduled next for: {new Date(f.followUpDate).toLocaleString()}
              </div>
            </div>
          )) : <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>No follow-up history.</p>}
        </div>
      </div>
    </div>
  );
};
