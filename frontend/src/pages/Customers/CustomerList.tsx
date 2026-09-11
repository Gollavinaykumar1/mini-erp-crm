import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import type { Customer } from '../../types';
import { Search, Plus, Eye, Edit2 } from 'lucide-react';

export const CustomerList: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchCustomers = async (query = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?search=${query}`);
      setCustomers(res.data.data.customers);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCustomers(search);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input 
            type="text" 
            placeholder="Search customers..." 
            className="input-field" 
            value={search} 
            onChange={e => setSearch(e.target.value)}
          />
          <button type="submit" className="btn btn-primary"><Search size={16} /></button>
        </form>
        <Link to="/customers/new" className="btn btn-primary flex items-center gap-2">
          <Plus size={16} /> Add Customer
        </Link>
      </div>

      <div className="card table-container">
        {loading ? <div className="p-4 text-center">Loading...</div> : (
          <table>
            <thead>
              <tr>
                <th>Business Name</th>
                <th>Contact Person</th>
                <th>Mobile</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 && (
                <tr><td colSpan={6} style={{textAlign: 'center'}}>No customers found.</td></tr>
              )}
              {customers.map(c => (
                <tr key={c.id}>
                  <td style={{fontWeight: '500'}}>{c.businessName}</td>
                  <td>{c.customerName}</td>
                  <td>{c.mobileNumber}</td>
                  <td><span className="badge badge-neutral">{c.customerType}</span></td>
                  <td>
                    <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : c.status === 'INACTIVE' ? 'badge-danger' : 'badge-warning'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="flex gap-2">
                    <Link to={`/customers/${c.id}`} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}><Eye size={16} /></Link>
                    <Link to={`/customers/${c.id}/edit`} className="btn btn-outline" style={{ padding: '0.25rem 0.5rem' }}><Edit2 size={16} /></Link>
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
