import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Product } from '../../types';

export const StockMovementForm: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState({
    productId: '',
    quantity: 1,
    movementType: 'IN',
    reason: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/products?limit=1000') // In reality, use search/select
      .then(res => setProducts(res.data.data.products))
      .catch(() => setError('Failed to load products'));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      await api.post('/inventory/movements', {
        ...formData,
        quantity: Number(formData.quantity)
      });
      navigate('/inventory');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to record movement');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="card" style={{ maxWidth: '32rem', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 'bold' }}>Record Stock Movement</h2>
      {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Product *</label>
          <select name="productId" value={formData.productId} onChange={handleChange} required className="input-field">
            <option value="">Select a product...</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.productName} ({p.sku}) - Stock: {p.currentStock}</option>
            ))}
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Movement Type *</label>
          <select name="movementType" value={formData.movementType} onChange={handleChange} required className="input-field">
            <option value="IN">IN (+)</option>
            <option value="OUT">OUT (-)</option>
          </select>
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Quantity *</label>
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} required min="1" className="input-field" />
        </div>
        
        <div>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Reason</label>
          <input type="text" name="reason" value={formData.reason} onChange={handleChange} className="input-field" placeholder="E.g. Restock, Damage, Correction" />
        </div>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', justifyContent: 'flex-end' }}>
          <button type="button" onClick={() => navigate('/inventory')} className="btn btn-outline">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Record Movement'}
          </button>
        </div>
      </form>
    </div>
  );
};
