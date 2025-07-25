import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Users, MapPin, Calendar, Settings, MessageSquare, Package, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { usePagination } from './admin/hooks';
import AdminSidebar from './admin/AdminSidebar';
import AdminHeader from './admin/AdminHeader';
import OverviewSection from './admin/OverviewSection';
import PackagesSection from './admin/PackagesSection';
import BookingsSection from './admin/BookingsSection';
import ClientRequestsSection from './admin/ClientRequestsSection';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPackage, setEditingPackage] = useState(null);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Mock data with CRUD operations
  const [packages, setPackages] = useState([
    { id: 1, name: 'Garowe to Bosaso Adventure', type: 'VIP', price: 450, bookings: 127, status: 'active', description: 'Experience the coastal beauty of Bosaso with premium accommodations' },
    { id: 2, name: 'Eyl Beach Retreat', type: 'Basic', price: 280, bookings: 89, status: 'active', description: 'Relax and unwind at the beautiful Eyl beaches' },
    { id: 3, name: 'Puntland Explorer', type: 'VIP', price: 650, bookings: 45, status: 'active', description: 'Comprehensive tour covering the best of Puntland destinations' },
    { id: 4, name: 'Cultural Heritage Tour', type: 'VIP', price: 420, bookings: 71, status: 'active', description: 'Immerse yourself in authentic Somali culture' },
    { id: 5, name: 'Weekend Getaway', type: 'Basic', price: 195, bookings: 134, status: 'active', description: 'Perfect weekend escape to beautiful destinations' }
  ]);
  const [bookings, setBookings] = useState([
    { id: 1, customer: 'Ahmed Hassan', email: 'ahmed@example.com', phone: '+252901234567', package: 'Garowe to Bosaso VIP', date: '2024-01-15', status: 'confirmed', amount: '$450' },
    { id: 2, customer: 'Sarah Johnson', email: 'sarah@example.com', phone: '+44123456789', package: 'Eyl Beach Retreat', date: '2024-01-14', status: 'pending', amount: '$280' },
    { id: 3, customer: 'Omar Ali', email: 'omar@example.com', phone: '+971501234567', package: 'Puntland Explorer', date: '2024-01-13', status: 'completed', amount: '$650' },
    { id: 4, customer: 'Fatima Al-Zahra', email: 'fatima@example.com', phone: '+1416123456', package: 'Cultural Heritage Tour', date: '2024-01-12', status: 'confirmed', amount: '$420' },
    { id: 5, customer: 'Marcus Williams', email: 'marcus@example.com', phone: '+61412345678', package: 'Photography Tour', date: '2024-01-11', status: 'completed', amount: '$380' }
  ]);
  const [clientRequests, setClientRequests] = useState([
    { id: 1, name: 'John Smith', email: 'john@example.com', phone: '+1234567890', serviceType: 'tour-packages', subject: 'Family vacation inquiry', message: 'Hi, I am interested in planning a family vacation to Puntland for 6 people. Could you provide more details about your family-friendly packages?', date: '2024-01-20', status: 'new' },
    { id: 2, name: 'Maria Garcia', email: 'maria@example.com', phone: '+34123456789', serviceType: 'accommodation', subject: 'Hotel booking assistance', message: 'I need help booking hotels in Garowe and Bosaso for my business trip next month. What are your recommendations?', date: '2024-01-19', status: 'responded' },
    { id: 3, name: 'David Chen', email: 'david@example.com', phone: '+86123456789', serviceType: 'vehicle-rental', subject: 'Car rental for photography tour', message: 'I am a professional photographer planning to visit Puntland. I need a reliable 4WD vehicle for 10 days. What options do you have?', date: '2024-01-18', status: 'new' },
    { id: 4, name: 'Amina Mohamed', email: 'amina@example.com', phone: '+252907123456', serviceType: 'airport-transfer', subject: 'Airport pickup service', message: 'I will be arriving at Garowe airport on February 5th at 3 PM. Can you arrange pickup service to my hotel?', date: '2024-01-17', status: 'responded' },
    { id: 5, name: 'Robert Taylor', email: 'robert@example.com', phone: '+44207123456', serviceType: 'custom-tour', subject: 'Custom cultural tour request', message: 'I am researching Somali culture for my documentary. Can you arrange meetings with local historians and cultural experts?', date: '2024-01-16', status: 'closed' }
  ]);

  const stats = [
    { title: 'Total Bookings', value: '2,847', change: '+12%', icon: Calendar, color: 'from-blue-500 to-blue-600' },
    { title: 'Revenue', value: '$284,750', change: '+8%', icon: null, color: 'from-green-500 to-green-600' },
    { title: 'Active Tours', value: '47', change: '+3%', icon: MapPin, color: 'from-purple-500 to-purple-600' },
    { title: 'Customer Rating', value: '4.9', change: '+0.1', icon: null, color: 'from-yellow-500 to-yellow-600' }
  ];

  const sidebarItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'packages', label: 'Tour Packages', icon: Package },
    { id: 'services', label: 'Services', icon: Settings },
    { id: 'bookings', label: 'Bookings', icon: Calendar },
    { id: 'requests', label: 'Client Requests', icon: MessageSquare },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'destinations', label: 'Destinations', icon: MapPin },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp }
  ];

  // Pagination hooks
  const bookingsPagination = usePagination(bookings, 5);
  const packagesPagination = usePagination(packages, 6);
  const requestsPagination = usePagination(clientRequests, 5);

  // CRUD handlers for packages
  const handleAddNewPackage = () => {
    setEditingPackage({ id: 0, name: '', type: 'Basic', price: 0, bookings: 0, status: 'active', description: '' });
    setShowAddPackage(true);
  };
  const handleEditPackage = (pkg) => setEditingPackage({ ...pkg });
  const handleDeletePackage = (id) => setPackages(packages.filter(pkg => pkg.id !== id));
  const handleSavePackage = () => {
    if (editingPackage) {
      if (editingPackage.id === 0) {
        const newPackage = { ...editingPackage, id: Math.max(...packages.map(p => p.id)) + 1, bookings: 0 };
        setPackages([...packages, newPackage]);
      } else {
        setPackages(packages.map(pkg => pkg.id === editingPackage.id ? editingPackage : pkg));
      }
      setEditingPackage(null);
      setShowAddPackage(false);
    }
  };

  // CRUD handlers for bookings
  const updateBookingStatus = (id, status) => setBookings(bookings.map(booking => booking.id === id ? { ...booking, status } : booking));
  // CRUD handlers for client requests
  const updateRequestStatus = (id, status) => setClientRequests(clientRequests.map(request => request.id === id ? { ...request, status } : request));

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clientRequests={clientRequests}
        handleLogout={logout}
        sidebarItems={sidebarItems}
      />
      <div className="flex flex-col min-h-screen transition-all duration-300 md:ml-60" style={{ maxWidth: '100vw' }}>
        <AdminHeader
          activeTab={activeTab}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          showNotifications={showNotifications}
          setShowNotifications={setShowNotifications}
          clientRequests={clientRequests}
        />
        <main className="flex-1 p-2 md:p-4 bg-gray-50">
          {activeTab === 'overview' && (
            <OverviewSection stats={stats} bookings={bookings} setActiveTab={setActiveTab} />
          )}
          {activeTab === 'packages' && (
            <PackagesSection
              packagesPagination={packagesPagination}
              editingPackage={editingPackage}
              showAddPackage={showAddPackage}
              setEditingPackage={setEditingPackage}
              setShowAddPackage={setShowAddPackage}
              handleAddNewPackage={handleAddNewPackage}
              handleEditPackage={handleEditPackage}
              handleDeletePackage={handleDeletePackage}
              handleSavePackage={handleSavePackage}
            />
          )}
          {activeTab === 'bookings' && (
            <BookingsSection bookingsPagination={bookingsPagination} updateBookingStatus={updateBookingStatus} />
          )}
          {activeTab === 'requests' && (
            <ClientRequestsSection requestsPagination={requestsPagination} updateRequestStatus={updateRequestStatus} />
          )}
          {/* Add similar imports and usage for services, customers, destinations, analytics as needed */}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;