import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CustomersRoutes } from './pages/Customers';
import { ProductsRoutes } from './pages/Products';
import { InventoryRoutes } from './pages/Inventory';
import { ChallansRoutes } from './pages/Challans';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './layouts/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';


const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/customers/*" element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'ACCOUNTS']}><CustomersRoutes /></ProtectedRoute>} />
            <Route path="/products/*" element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']}><ProductsRoutes /></ProtectedRoute>} />
            <Route path="/inventory/*" element={<ProtectedRoute allowedRoles={['ADMIN', 'WAREHOUSE', 'SALES', 'ACCOUNTS']}><InventoryRoutes /></ProtectedRoute>} />
            <Route path="/challans/*" element={<ProtectedRoute allowedRoles={['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS']}><ChallansRoutes /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
