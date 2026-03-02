import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Register from './pages/Register';

// Placeholder — swap in a real Dashboard once it exists
const Dashboard = () => (
  <main className="flex-grow flex items-center justify-center">
    <div className="text-center space-y-3">
      <h1 className="text-3xl font-extrabold text-gray-900">Dashboard</h1>
      <p className="text-gray-500">You are logged in 🎉</p>
    </div>
  </main>
);

function App() {
  return (
    <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 text-gray-900">
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />

        {/* Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
      <footer className="w-full text-center py-8 text-sm font-medium text-gray-400">
        &copy; {new Date().getFullYear()} STUDTRADE. Verified student marketplace.
      </footer>
    </div>
  );
}

export default App;
