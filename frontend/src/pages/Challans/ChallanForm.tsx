import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import type { Customer, Product } from '../../types';
import { Trash2 } from 'lucide-react';

export const ChallanForm: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  
  const [customerId, setCustomerId] = useState('');
  const [items, setItems] = useState<{productId: string; quantity: number}[]>([
    { productId: '', quantity: 1 }
  ]);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/customers?limit=1000').then(res => setCustomers(res.data.data.customers));
    api.get('/products?limit=1000').then(res => setProducts(res.data.data.products));
  }, []);

  const handleAddItem = () => {
    setItems([...items, { productId: '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      const newItems = [...items];
      newItems.splice(index, 1);
      setItems(newItems);
    }
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: field === 'quantity' ? Number(value) : value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const validItems = items.filter(i => i.productId && i.quantity > 0);
      if (validItems.length === 0) throw new Error("At least one valid item is required");
      
      const res = await api.post('/challans', {
        customerId,
        items: validItems
      });
      navigate(`/challans/${res.data.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to create challan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: '56rem', margin: '0 auto' }}>
      <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', fontWeight: 'bold' }}>Create New Challan</h2>
      {error && <div style={{ backgroundColor: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '0.375rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Customer *</label>
          <select value={customerId} onChange={e => setCustomerId(e.target.value)} required className="input-field" style={{ maxWidth: '28rem' }}>
            <option value="">Select a customer...</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.businessName} ({c.customerName})</option>
            ))}
          </select>
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', marginBottom: '1rem' }}>Items</h3>
        
        {items.map((item, index) => (
          <div key={index} className="flex gap-4 items-end mb-4" style={{ backgroundColor: '#f8fafc', padding: '1rem', borderRadius: '0.25rem', border: '1px solid #e2e8f0' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Product</label>
              <select value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)} required className="input-field">
                <option value="">Select product...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.productName} (Stock: {p.currentStock})</option>
                ))}
              </select>
            </div>
            <div style={{ width: '120px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', marginBottom: '0.25rem' }}>Quantity</label>
              <input type="number" min="1" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} required className="input-field" />
            </div>
            <button type="button" onClick={() => handleRemoveItem(index)} className="btn btn-danger" style={{ padding: '0.5rem 0.75rem' }} disabled={items.length === 1}>
              <Trash2 size={16} />
            </button>
          </div>
        ))}
        
        <div style={{ marginBottom: '1.5rem' }}>
          <button type="button" onClick={handleAddItem} className="btn btn-outline" style={{ fontSize: '0.875rem' }}>
            + Add Another Item
          </button>
        </div>
        
        <div className="flex gap-2 justify-end">
          <button type="button" onClick={() => navigate('/challans')} className="btn btn-outline">Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Draft Challan'}
          </button>
        </div>
      </form>
    </div>
  );
};
