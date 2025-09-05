import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import FloatingElements from './components/FloatingElements';
import ScrollToTop from './components/ScrollToTop';
import DataPreloader from './components/DataPreloader';
import HomePage from './pages/HomePage';
import PackagesPage from './pages/PackagesPage';
import ServicesPage from './pages/ServicesPage';
import DestinationsPage from './pages/DestinationsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BookingPage from './pages/BookingPage';
import BookingReviewPage from './pages/BookingReviewPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLoginPage from './pages/AdminLoginPage';
import ClientDetailPageWrapper from './pages/admin/ClientDetailPageWrapper';

// Helper component to handle conditional routing
function DalxiisRoutes() {
  const { isAdmin, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Debug logging
  console.log('=== ROUTING DEBUG ===');
  console.log('Current location:', location.pathname);
  console.log('Is loading:', isLoading);
  console.log('Is authenticated:', isAuthenticated);
  console.log('Is admin:', isAdmin);
  console.log('===================');

  // Check if user is trying to access admin routes
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Show loading during authentication ONLY for admin routes
  if (isLoading && isAdminRoute) {
    console.log('Auth is loading for admin route, showing spinner...');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // If user is on admin login page, always show it (no redirects)
  if (location.pathname === '/admin/login') {
    console.log('Showing admin login page');
    return <AdminLoginPage />;
  }

  // If user is trying to access other admin routes but not authenticated, redirect to login
  if (isAdminRoute && !isAuthenticated) {
    console.log('Redirecting to admin login');
    return <Navigate to="/admin/login" replace />;
  }

  // If user is not admin but trying to access admin routes, redirect to home
  if (isAdminRoute && !isAdmin) {
    console.log('Redirecting non-admin user to home');
    return <Navigate to="/" replace />;
  }

  // Admin routes (no navbar/footer) - only for authenticated admin users
  if (isAdminRoute && isAdmin) {
    console.log('Showing admin routes');
    return (
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/clients/:clientId" element={<ClientDetailPageWrapper />} />
      </Routes>
    );
  }

  // Public user: show all public pages
  console.log('Showing public pages');
  const isBookingRoute = location.pathname.startsWith('/book');
  return (
    <>
      <Navbar />
      {!isBookingRoute && <FloatingElements />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/destinations" element={<DestinationsPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/book/:serviceType" element={<BookingPage />} />
        <Route path="/book" element={<BookingPage />} />
        <Route path="/book/review" element={<BookingReviewPage />} />
      </Routes>
      {!isBookingRoute && <Footer />}
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router>
          <ScrollToTop />
          <DataPreloader />
          <div className="min-h-screen bg-gray-50">
            <DalxiisRoutes />
          </div>
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;