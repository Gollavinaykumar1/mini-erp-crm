import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CustomerList } from './CustomerList';
import { CustomerDetails } from './CustomerDetails';
import { CustomerForm } from './CustomerForm';

export const CustomersRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<CustomerList />} />
      <Route path="/new" element={<CustomerForm />} />
      <Route path="/:id" element={<CustomerDetails />} />
      <Route path="/:id/edit" element={<CustomerForm />} />
    </Routes>
  );
};
