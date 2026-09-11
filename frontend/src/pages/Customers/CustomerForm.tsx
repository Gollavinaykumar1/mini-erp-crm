import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../services/api';

export const CustomerForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    businessName: '',
    gstNumber: '',
    customerType: 'RETAIL',
    address: '',
    status: 'ACTIVE'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/customers/${id}`).then(res => {
        const c = res.data.data;
        setFormData({
          customerName: c.customerName || '',
          mobileNumber: c.mobileNumber || '',
          email: c.email || '',
          businessName: c.businessName || '',
          gstNumber: c.gstNumber || '',
          customerType: c.customerType || 'RETAIL',
          address: c.address || '',
          status: c.status || 'ACTIVE'
        });
      }).catch(() => setError('Failed to load customer data'));
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isEdit) {
        await api.put(`/customers/${id}`, formData);
      } else {
        await api.post('/customers', formData);
      }
      navigate('/customers');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="card" style={{ maxWidth: '42rem', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 'bold' }}>
        {isEdit ? 'Edit Customer' : 'Add New Customer'}
      </h2>
      {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Business Name *</label>
            <input name="businessName" value={formData.businessName} onChange={handleChange} required className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Contact Person *</label>
            <input name="customerName" value={formData.customerName} onChange={handleChange} required className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Mobile Number *</label>
            <input name="mobileNumber" value={formData.mobileNumber} onChange={handleChange} required className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Email</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>GST Number</label>
            <input name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Customer Type *</label>
            <select name="customerType" value={formData.customerType} onChange={handleChange} className="input-field" required>
              <option value="RETAIL">Retail</option>
              <option value="WHOLESALE">Wholesale</option>
              <option value="DISTRIBUTOR">Distributor</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Status *</label>
            <select name="status" value={formData.status} onChange={handleChange} className="input-field" required>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="LEAD">Lead</option>
            </select>
          </div>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Address</label>
          <textarea name="address" value={formData.address} onChange={handleChange} className="input-field" rows={3}></textarea>
        </div>

        <div className="flex gap-2 mt-4" style={{ justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/customers')} className="btn btn-outline">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Customer'}
          </button>
        </div>
      </form>
    </div>
  );
};
