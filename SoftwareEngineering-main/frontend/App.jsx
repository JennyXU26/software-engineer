import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DoctorPanel from './components/DoctorPanel';
import PharmacistPanel from './components/PharmacistPanel';
import FLDashboard from './components/FLDashboard';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
        <nav className="bg-blue-600 text-white p-4 shadow-md">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold">💊 MedChain & FL System</h1>
            <div className="space-x-6">
              <Link to="/" className="hover:text-blue-200">医生工作台</Link>
              <Link to="/pharmacist" className="hover:text-blue-200">药师工作台</Link>
              <Link to="/fl-dashboard" className="hover:text-blue-200">联邦学习监控</Link>
            </div>
          </div>
        </nav>

        <div className="container mx-auto p-6">
          <Routes>
            <Route path="/" element={<DoctorPanel />} />
            <Route path="/pharmacist" element={<PharmacistPanel />} />
            <Route path="/fl-dashboard" element={<FLDashboard />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
