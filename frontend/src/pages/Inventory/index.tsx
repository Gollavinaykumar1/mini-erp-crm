import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { InventoryList } from './InventoryList';
import { StockMovementForm } from './StockMovementForm';

export const InventoryRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<InventoryList />} />
      <Route path="/new" element={<StockMovementForm />} />
    </Routes>
  );
};
