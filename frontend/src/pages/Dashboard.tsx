import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Users, Package, AlertTriangle, FileText } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    lowStock: 0,
    challans: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [custRes, prodRes, chalRes] = await Promise.all([
          api.get('/customers?limit=1'),
          api.get('/products?limit=1000'),
          api.get('/challans?limit=1')
        ]);
        
        const products = prodRes.data.data.products;
        const lowStockCount = products.filter((p: any) => p.currentStock <= p.minimumStock).length;

        setStats({
          customers: custRes.data.data.total,
          products: prodRes.data.data.total,
          lowStock: lowStockCount,
          challans: chalRes.data.data.total
        });
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: 'bold' }}>Overview</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: '#eff6ff', color: 'var(--primary-color)', borderRadius: '0.5rem' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Customers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.customers}</div>
          </div>
        </div>
        
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: '#f0fdf4', color: 'var(--success-color)', borderRadius: '0.5rem' }}>
            <Package size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Products</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.products}</div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: '#fef2f2', color: 'var(--danger-color)', borderRadius: '0.5rem' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Low Stock Alerts</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.lowStock}</div>
          </div>
        </div>

        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: '#fefce8', color: 'var(--warning-color)', borderRadius: '0.5rem' }}>
            <FileText size={24} />
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Challans</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.challans}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
