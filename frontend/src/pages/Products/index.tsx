import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProductList } from './ProductList';
import { ProductForm } from './ProductForm';

export const ProductsRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ProductList />} />
      <Route path="/new" element={<ProductForm />} />
    </Routes>
  );
};
