import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Package, History, FileText, LogOut } from 'lucide-react';

export const Layout: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} />, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { name: 'Customers', path: '/customers', icon: <Users size={20} />, roles: ['ADMIN', 'SALES', 'ACCOUNTS'] },
    { name: 'Products', path: '/products', icon: <Package size={20} />, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
    { name: 'Inventory', path: '/inventory', icon: <History size={20} />, roles: ['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS'] },
    { name: 'Challans', path: '/challans', icon: <FileText size={20} />, roles: ['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] },
  ];

  return (
    <div className="layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold', fontSize: '1.25rem', color: 'var(--primary-color)' }}>
          Mini ERP + CRM
        </div>
        <nav style={{ padding: '1rem 0', flex: 1 }}>
          {navItems.filter(item => hasRole(item.roles as any)).map(item => (
            <Link 
              key={item.path} 
              to={item.path} 
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '0.75rem 1.5rem',
                color: location.pathname.startsWith(item.path) ? 'var(--primary-color)' : 'var(--text-secondary)',
                backgroundColor: location.pathname.startsWith(item.path) ? '#eff6ff' : 'transparent',
                borderRight: location.pathname.startsWith(item.path) ? '3px solid var(--primary-color)' : '3px solid transparent',
                gap: '0.75rem',
                fontWeight: location.pathname.startsWith(item.path) ? '600' : '500'
              }}
            >
              {item.icon}
              {item.name}
            </Link>
          ))}
        </nav>
        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{user?.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>{user?.role}</div>
          <button onClick={handleLogout} className="btn btn-outline" style={{ width: '100%', gap: '0.5rem' }}>
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="header">
          <h1 style={{ fontSize: '1.25rem', fontWeight: '600' }}>
            {navItems.find(item => location.pathname.startsWith(item.path))?.name || 'Dashboard'}
          </h1>
        </header>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
