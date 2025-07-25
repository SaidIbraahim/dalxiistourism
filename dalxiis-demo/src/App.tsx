import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingElements from './components/FloatingElements';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './pages/HomePage';
import PackagesPage from './pages/PackagesPage';
import ServicesPage from './pages/ServicesPage';
import DestinationsPage from './pages/DestinationsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BookingPage from './pages/BookingPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminDashboard from './pages/AdminDashboard';

// Helper component to handle conditional routing
function DalxiisRoutes() {
  const { isAdmin, isAuthenticated } = useAuth();
  const location = useLocation();

  // If admin is logged in, restrict to dashboard only
  if (isAdmin) {
    // Allow access to dashboard only
    if (location.pathname === '/admin/dashboard') {
      return <AdminDashboard />;
    }
    // Allow logout by navigating to /admin/login, but redirect to dashboard if already authenticated
    if (location.pathname === '/admin/login') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    // For any other route, redirect to dashboard
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Public user: show all public pages and admin login
  return (
    <>
      <Navbar />
      <FloatingElements />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/book/:serviceType" element={<BookingPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        {/* Redirect any attempt to access dashboard to login if not admin */}
        <Route path="/admin/dashboard" element={<Navigate to="/admin/login" replace />} />
        {/* Optionally, add a 404 page here */}
      </Routes>
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-gray-50">
          <DalxiisRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;