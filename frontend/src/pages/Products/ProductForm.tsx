import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

export const ProductForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    productName: '',
    sku: '',
    category: '',
    unitPrice: 0,
    currentStock: 0,
    minimumStock: 0,
    warehouseLocation: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/products', {
        ...formData,
        unitPrice: Number(formData.unitPrice),
        currentStock: Number(formData.currentStock),
        minimumStock: Number(formData.minimumStock)
      });
      navigate('/products');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="card" style={{ maxWidth: '42rem', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 'bold' }}>Add New Product</h2>
      {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Product Name *</label>
            <input name="productName" value={formData.productName} onChange={handleChange} required className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>SKU *</label>
            <input name="sku" value={formData.sku} onChange={handleChange} required className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Category *</label>
            <input name="category" value={formData.category} onChange={handleChange} required className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Unit Price *</label>
            <input type="number" name="unitPrice" value={formData.unitPrice} onChange={handleChange} required min="0" step="0.01" className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Current Stock *</label>
            <input type="number" name="currentStock" value={formData.currentStock} onChange={handleChange} required min="0" className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Minimum Stock *</label>
            <input type="number" name="minimumStock" value={formData.minimumStock} onChange={handleChange} required min="0" className="input-field" />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Warehouse Location *</label>
            <input name="warehouseLocation" value={formData.warehouseLocation} onChange={handleChange} required className="input-field" />
          </div>
        </div>
        
        <div className="flex gap-2 mt-4" style={{ justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/products')} className="btn btn-outline">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Product'}
          </button>
        </div>
      </form>
    </div>
  );
};
