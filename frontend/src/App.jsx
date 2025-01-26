import React from 'react';
import { Routes, Route } from "react-router-dom";
import QueryPage from './pages/QueryPage';
import LandingPage from './pages/LandingPage';

const App = () => {
  return (
    <Routes>
      {/* Landing Page Route */}
      <Route path="/" element={<LandingPage />} />

      {/* Query Page Route */}
      <Route path="/plan" element={<QueryPage />} />
    </Routes>
    
  );
};

export default App;