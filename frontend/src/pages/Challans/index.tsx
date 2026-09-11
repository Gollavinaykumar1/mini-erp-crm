import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ChallanList } from './ChallanList';
import { ChallanForm } from './ChallanForm';
import { ChallanDetails } from './ChallanDetails';

export const ChallansRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ChallanList />} />
      <Route path="/new" element={<ChallanForm />} />
      <Route path="/:id" element={<ChallanDetails />} />
    </Routes>
  );
};
