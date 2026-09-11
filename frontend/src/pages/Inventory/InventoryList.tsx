import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import type { StockMovement } from '../../types';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const InventoryList: React.FC = () => {
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(false);
  const { hasRole } = useAuth();

  useEffect(() => {
    setLoading(true);
    api.get('/inventory/movements')
      .then(res => setMovements(res.data.data.movements))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Stock Movements</h2>
        {hasRole(['ADMIN', 'WAREHOUSE']) && (
          <Link to="/inventory/new" className="btn btn-primary flex items-center gap-2">
            <Plus size={16} /> New Stock Movement
          </Link>
        )}
      </div>

      <div className="card table-container">
        {loading ? <div className="p-4 text-center">Loading...</div> : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Product</th>
                <th>SKU</th>
                <th>Type</th>
                <th>Quantity</th>
                <th>Reason</th>
                <th>Created By</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 && <tr><td colSpan={7} style={{textAlign: 'center'}}>No movements found.</td></tr>}
              {movements.map(m => (
                <tr key={m.id}>
                  <td>{new Date(m.createdAt).toLocaleDateString()}</td>
                  <td style={{fontWeight: '500'}}>{m.product.productName}</td>
                  <td>{m.product.sku}</td>
                  <td>
                    <span className={`badge ${m.movementType === 'IN' ? 'badge-success' : 'badge-danger'}`}>
                      {m.movementType}
                    </span>
                  </td>
                  <td>{m.quantity}</td>
                  <td>{m.reason || '-'}</td>
                  <td>{m.user.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
