import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import type { Product } from '../../types';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const { hasRole } = useAuth();

  useEffect(() => {
    setLoading(true);
    api.get('/products')
      .then(res => setProducts(res.data.data.products))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2>Products</h2>
        {hasRole(['ADMIN', 'WAREHOUSE']) && (
          <Link to="/products/new" className="btn btn-primary flex items-center gap-2">
            <Plus size={16} /> Add Product
          </Link>
        )}
      </div>

      <div className="card table-container">
        {loading ? <div className="p-4 text-center">Loading...</div> : (
          <table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Current Stock</th>
                <th>Location</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 && <tr><td colSpan={6} style={{textAlign: 'center'}}>No products found.</td></tr>}
              {products.map(p => (
                <tr key={p.id}>
                  <td className="font-medium">{p.productName}</td>
                  <td>{p.sku}</td>
                  <td>{p.category}</td>
                  <td>₹{p.unitPrice}</td>
                  <td>
                    {p.currentStock <= p.minimumStock ? (
                      <span className="badge badge-danger" title={`Min stock: ${p.minimumStock}`}>{p.currentStock} (Low)</span>
                    ) : (
                      <span>{p.currentStock}</span>
                    )}
                  </td>
                  <td>{p.warehouseLocation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
