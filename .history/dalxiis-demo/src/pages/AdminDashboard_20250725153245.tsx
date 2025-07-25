import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  MapPin, 
  Calendar, 
  Settings, 
  Bell, 
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  TrendingUp,
  DollarSign,
  Star,
  MessageSquare,
  Download,
  Filter,
  MoreVertical,
  Package,
  Plane,
  Building,
  Car,
  FileText,
  LogOut,
  Save,
  X,
  Check,
  AlertCircle,
  Mail,
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Package {
  id: number;
  name: string;
  type: 'VIP' | 'Basic';
  price: number;
  bookings: number;
  status: 'active' | 'inactive';
  description: string;
}

interface Booking {
  id: number;
  customer: string;
  email: string;
  phone: string;
  package: string;
  date: string;
  status: 'confirmed' | 'pending' | 'completed' | 'cancelled';
  amount: string;
}

interface ClientRequest {
  id: number;
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  subject: string;
  message: string;
  date: string;
  status: 'new' | 'responded' | 'closed';
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { logout, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [showAddPackage, setShowAddPackage] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  // Mock data with CRUD operations
  const [packages, setPackages] = useState<Package[]>([
    { id: 1, name: 'Garowe to Bosaso Adventure', type: 'VIP', price: 450, bookings: 127, status: 'active', description: 'Experience the coastal beauty of Bosaso with premium accommodations' },
    { id: 2, name: 'Eyl Beach Retreat', type: 'Basic', price: 280, bookings: 89, status: 'active', description: 'Relax and unwind at the beautiful Eyl beaches' },
    { id: 3, name: 'Puntland Explorer', type: 'VIP', price: 650, bookings: 45, status: 'active', description: 'Comprehensive tour covering the best of Puntland destinations' },
    { id: 4, name: 'Cultural Heritage Tour', type: 'VIP', price: 420, bookings: 71, status: 'active', description: 'Immerse yourself in authentic Somali culture' },
    { id: 5, name: 'Weekend Getaway', type: 'Basic', price: 195, bookings: 134, status: 'active', description: 'Perfect weekend escape to beautiful destinations' }
  ]);

  const [bookings, setBookings] = useState<Booking[]>([
    { id: 1, customer: 'Ahmed Hassan', email: 'ahmed@example.com', phone: '+252901234567', package: 'Garowe to Bosaso VIP', date: '2024-01-15', status: 'confirmed', amount: '$450' },
    { id: 2, customer: 'Sarah Johnson', email: 'sarah@example.com', phone: '+44123456789', package: 'Eyl Beach Retreat', date: '2024-01-14', status: 'pending', amount: '$280' },
    { id: 3, customer: 'Omar Ali', email: 'omar@example.com', phone: '+971501234567', package: 'Puntland Explorer', date: '2024-01-13', status: 'completed', amount: '$650' },
    { id: 4, customer: 'Fatima Al-Zahra', email: 'fatima@example.com', phone: '+1416123456', package: 'Cultural Heritage Tour', date: '2024-01-12', status: 'confirmed', amount: '$420' },
    { id: 5, customer: 'Marcus Williams', email: 'marcus@example.com', phone: '+61412345678', package: 'Photography Tour', date: '2024-01-11', status: 'completed', amount: '$380' }
  ]);

  const [clientRequests, setClientRequests] = useState<ClientRequest[]>([
    { id: 1, name: 'John Smith', email: 'john@example.com', phone: '+1234567890', serviceType: 'tour-packages', subject: 'Family vacation inquiry', message: 'Hi, I am interested in planning a family vacation to Puntland for 6 people. Could you provide more details about your family-friendly packages?', date: '2024-01-20', status: 'new' },
    { id: 2, name: 'Maria Garcia', email: 'maria@example.com', phone: '+34123456789', serviceType: 'accommodation', subject: 'Hotel booking assistance', message: 'I need help booking hotels in Garowe and Bosaso for my business trip next month. What are your recommendations?', date: '2024-01-19', status: 'responded' },
    { id: 3, name: 'David Chen', email: 'david@example.com', phone: '+86123456789', serviceType: 'vehicle-rental', subject: 'Car rental for photography tour', message: 'I am a professional photographer planning to visit Puntland. I need a reliable 4WD vehicle for 10 days. What options do you have?', date: '2024-01-18', status: 'new' },
    { id: 4, name: 'Amina Mohamed', email: 'amina@example.com', phone: '+252907123456', serviceType: 'airport-transfer', subject: 'Airport pickup service', message: 'I will be arriving at Garowe airport on February 5th at 3 PM. Can you arrange pickup service to my hotel?', date: '2024-01-17', status: 'responded' },
    { id: 5, name: 'Robert Taylor', email: 'robert@example.com', phone: '+44207123456', serviceType: 'custom-tour', subject: 'Custom cultural tour request', message: 'I am researching Somali culture for my documentary. Can you arrange meetings with local historians and cultural experts?', date: '2024-01-16', status: 'closed' }
  ]);

  const stats = [
    { title: 'Total Bookings', value: '2,847', change: '+12%', icon: Calendar, color: 'from-blue-500 to-blue-600' },
    { title: 'Revenue', value: '$284,750', change: '+8%', icon: DollarSign, color: 'from-green-500 to-green-600' },
    { title: 'Active Tours', value: '47', change: '+3%', icon: MapPin, color: 'from-purple-500 to-purple-600' },
    { title: 'Customer Rating', value: '4.9', change: '+0.1', icon: Star, color: 'from-yellow-500 to-yellow-600' }
  ];

  const services = [
    { id: 1, name: 'Airport Transfer', icon: Plane, requests: 245, revenue: '$6,125' },
    { id: 2, name: 'Hotel Booking', icon: Building, requests: 189, revenue: '$18,900' },
    { id: 3, name: 'Vehicle Rental', icon: Car, requests: 156, revenue: '$6,240' },
    { id: 4, name: 'Visa Services', icon: FileText, requests: 78, revenue: '$3,900' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleDeletePackage = (id: number) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      setPackages(packages.filter(pkg => pkg.id !== id));
    }
  };

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage({ ...pkg });
  };

  const handleSavePackage = () => {
    if (editingPackage) {
      if (editingPackage.id === 0) {
        // Add new package
        const newPackage = { ...editingPackage, id: Math.max(...packages.map(p => p.id)) + 1, bookings: 0 };
        setPackages([...packages, newPackage]);
      } else {
        // Update existing package
        setPackages(packages.map(pkg => pkg.id === editingPackage.id ? editingPackage : pkg));
      }
      setEditingPackage(null);
      setShowAddPackage(false);
    }
  };

  const handleAddNewPackage = () => {
    setEditingPackage({
      id: 0,
      name: '',
      type: 'Basic',
      price: 0,
      bookings: 0,
      status: 'active',
      description: ''
    });
    setShowAddPackage(true);
  };

  const updateBookingStatus = (id: number, status: Booking['status']) => {
    setBookings(bookings.map(booking => 
      booking.id === id ? { ...booking, status } : booking
    ));
  };

  const updateRequestStatus = (id: number, status: ClientRequest['status']) => {
    setClientRequests(clientRequests.map(request => 
      request.id === id ? { ...request, status } : request
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'new': return 'bg-red-100 text-red-800';
      case 'responded': return 'bg-blue-100 text-blue-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
              </div>
              <div className={`w-12 h-12 bg-gradient-to-r ${stat.color} rounded-lg flex items-center justify-center`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Trends</h3>
          <div className="h-64 bg-gradient-to-br from-[#f29520]/10 to-[#2f67b5]/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-16 w-16 text-[#f29520] mx-auto mb-4" />
              <p className="text-gray-600">Chart visualization would go here</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Analytics</h3>
          <div className="h-64 bg-gradient-to-br from-[#2f67b5]/10 to-[#f29520]/10 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <TrendingUp className="h-16 w-16 text-[#2f67b5] mx-auto mb-4" />
              <p className="text-gray-600">Revenue chart would go here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Bookings</h3>
          <button 
            onClick={() => setActiveTab('bookings')}
            className="text-[#f29520] hover:text-[#e08420] font-medium"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-600">Customer</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Package</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Date</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {bookings.slice(0, 5).map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium text-gray-900">{booking.customer}</td>
                  <td className="py-3 px-4 text-gray-600">{booking.package}</td>
                  <td className="py-3 px-4 text-gray-600">{booking.date}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-900">{booking.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPackages = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Tour Packages</h2>
        <button 
          onClick={handleAddNewPackage}
          className="bg-[#f29520] text-white px-4 py-2 rounded-lg hover:bg-[#e08420] transition-colors flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Package
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <div key={pkg.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                pkg.type === 'VIP' ? 'bg-[#f29520] text-white' : 'bg-[#2f67b5] text-white'
              }`}>
                {pkg.type}
              </span>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handleEditPackage(pkg)}
                  className="text-gray-400 hover:text-[#2f67b5] p-1"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button 
                  onClick={() => handleDeletePackage(pkg.id)}
                  className="text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{pkg.name}</h3>
            <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-[#f29520]">${pkg.price}</span>
              <span className="text-sm text-gray-600">{pkg.bookings} bookings</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                pkg.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {pkg.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Edit/Add Package Modal */}
      {(editingPackage || showAddPackage) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">
                {editingPackage?.id === 0 ? 'Add New Package' : 'Edit Package'}
              </h3>
              <button 
                onClick={() => {
                  setEditingPackage(null);
                  setShowAddPackage(false);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                <input
                  type="text"
                  value={editingPackage?.name || ''}
                  onChange={(e) => setEditingPackage(prev => prev ? {...prev, name: e.target.value} : null)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={editingPackage?.type || 'Basic'}
                  onChange={(e) => setEditingPackage(prev => prev ? {...prev, type: e.target.value as 'VIP' | 'Basic'} : null)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent"
                >
                  <option value="Basic">Basic</option>
                  <option value="VIP">VIP</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price ($)</label>
                <input
                  type="number"
                  value={editingPackage?.price || 0}
                  onChange={(e) => setEditingPackage(prev => prev ? {...prev, price: parseInt(e.target.value)} : null)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingPackage?.description || ''}
                  onChange={(e) => setEditingPackage(prev => prev ? {...prev, description: e.target.value} : null)}
                  rows={3}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingPackage?.status || 'active'}
                  onChange={(e) => setEditingPackage(prev => prev ? {...prev, status: e.target.value as 'active' | 'inactive'} : null)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setEditingPackage(null);
                  setShowAddPackage(false);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSavePackage}
                className="bg-[#f29520] text-white px-4 py-2 rounded-lg hover:bg-[#e08420] transition-colors flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderBookings = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Bookings Management</h2>
        <div className="flex items-center space-x-3">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-transparent">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Customer</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Contact</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Package</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Date</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Status</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Amount</th>
                <th className="text-left py-4 px-6 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => (
                <tr key={booking.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-900">{booking.customer}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-sm text-gray-600">
                      <div className="flex items-center mb-1">
                        <Mail className="h-3 w-3 mr-1" />
                        {booking.email}
                      </div>
                      <div className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {booking.phone}
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-gray-600">{booking.package}</td>
                  <td className="py-4 px-6 text-gray-600">{booking.date}</td>
                  <td className="py-4 px-6">
                    <select
                      value={booking.status}
                      onChange={(e) => updateBookingStatus(booking.id, e.target.value as Booking['status'])}
                      className={`px-2 py-1 rounded-full text-xs font-medium border-0 ${getStatusColor(booking.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-4 px-6 font-medium text-gray-900">{booking.amount}</td>
                  <td className="py-4 px-6">
                    <div className="flex items-center space-x-2">
                      <button className="text-gray-400 hover:text-[#f29520] p-1">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-[#2f67b5] p-1">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="text-gray-400 hover:text-red-500 p-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderClientRequests = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Client Requests</h2>
        <div className="flex items-center space-x-3">
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            {clientRequests.filter(r => r.status === 'new').length} New
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {clientRequests.map((request) => (
          <div key={request.id} className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{request.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {request.email}
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2" />
                    {request.phone}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {request.date}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-2">Service: {request.serviceType}</div>
                <div className="flex items-center space-x-2">
                  <select
                    value={request.status}
                    onChange={(e) => updateRequestStatus(request.id, e.target.value as ClientRequest['status'])}
                    className="text-xs px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-[#f29520] focus:border-transparent"
                  >
                    <option value="new">New</option>
                    <option value="responded">Responded</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="font-medium text-gray-900 mb-2">Subject: {request.subject}</h4>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{request.message}</p>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <button className="text-[#2f67b5] hover:text-[#1c2c54] font-medium text-sm flex items-center">
                <Mail className="h-4 w-4 mr-1" />
                Reply via Email
              </button>
              <button className="bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#20b858] transition-colors text-sm flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                WhatsApp
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Minimalist Responsive Sidebar */}
      <aside className="fixed md:static z-30 top-0 left-0 h-full md:h-auto w-64 bg-white border-r border-gray-100 flex flex-col justify-between transition-all duration-300 shadow-none md:shadow-lg">
        <div>
          {/* Logo & Title */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-100">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f29520] to-[#2f67b5] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <div className="text-lg font-bold text-[#1c2c54] tracking-tight">Dalxiis</div>
              <div className="text-xs text-[#f29520] font-medium tracking-wide">Admin Panel</div>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex flex-col gap-2 mt-8 px-4">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#f29520] focus:bg-[#f29520]/10
                  ${activeTab === item.id
                    ? 'bg-gradient-to-r from-[#f29520] to-[#e08420] text-white shadow-md'
                    : 'text-gray-600 hover:text-[#1c2c54] hover:bg-gray-100'}
                `}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span>{item.label}</span>
                {item.id === 'requests' && clientRequests.filter(r => r.status === 'new').length > 0 && (
                  <span className="ml-auto bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {clientRequests.filter(r => r.status === 'new').length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Logout */}
        <div className="px-4 pb-6 mt-8">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full bg-gray-100 text-gray-600 px-4 py-3 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors font-medium text-sm gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 min-h-screen">
        {/* Header */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#1c2c54] tracking-tight capitalize leading-tight">{activeTab.replace('-', ' ')}</h1>
            <p className="text-gray-400 text-sm mt-1">Manage your tourism business</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:ring-2 focus:ring-[#f29520] focus:border-transparent outline-none"
              />
            </div>
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-gray-400 hover:text-[#f29520] focus:outline-none"
              >
                <Bell className="h-5 w-5" />
                {clientRequests.filter(r => r.status === 'new').length > 0 && (
                  <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 z-50">
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="font-semibold text-[#1c2c54] text-sm">Notifications</h3>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {clientRequests.filter(r => r.status === 'new').map(request => (
                      <div key={request.id} className="p-4 border-b border-gray-50 hover:bg-gray-50">
                        <div className="flex items-start">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-1 mr-2 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-[#1c2c54]">New request from {request.name}</p>
                            <p className="text-xs text-gray-500">{request.subject}</p>
                            <p className="text-xs text-gray-400 mt-1">{request.date}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              <img
                src="https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=100"
                alt="Admin"
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
              />
              <span className="text-sm font-medium text-gray-700">Admin User</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 bg-gray-50">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'packages' && renderPackages()}
          {activeTab === 'bookings' && renderBookings()}
          {activeTab === 'requests' && renderClientRequests()}
          {activeTab === 'services' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl md:text-2xl font-bold text-[#1c2c54]">Services</h2>
                <button className="bg-[#f29520] text-white px-4 py-2 rounded-lg hover:bg-[#e08420] transition-colors flex items-center text-sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {services.map((service) => (
                  <div key={service.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#f29520] to-[#2f67b5] rounded-lg flex items-center justify-center mr-4">
                          <service.icon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-base font-semibold text-[#1c2c54]">{service.name}</h3>
                          <p className="text-xs text-gray-400">{service.requests} requests</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-[#f29520]">{service.revenue}</p>
                        <p className="text-xs text-gray-400">Revenue</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 mt-2">
                      <button className="flex-1 bg-[#2f67b5] text-white px-4 py-2 rounded-lg hover:bg-[#1c2c54] transition-colors text-xs">
                        Manage Service
                      </button>
                      <button className="text-gray-400 hover:text-[#f29520] p-2">
                        <Edit className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeTab === 'customers' && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <Users className="h-16 w-16 text-[#2f67b5] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#1c2c54] mb-2">Customer Management</h3>
              <p className="text-gray-400">Customer database and management tools would be implemented here</p>
            </div>
          )}
          {activeTab === 'destinations' && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <MapPin className="h-16 w-16 text-[#f29520] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#1c2c54] mb-2">Destinations Management</h3>
              <p className="text-gray-400">Destination content management system would be implemented here</p>
            </div>
          )}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <TrendingUp className="h-16 w-16 text-[#f29520] mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-[#1c2c54] mb-2">Analytics & Reports</h3>
              <p className="text-gray-400">Detailed analytics and reporting dashboard would be implemented here</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;