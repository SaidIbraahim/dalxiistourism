import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Lock, User, Eye, EyeOff, Shield, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    setTimeout(() => {
      if (login(formData.username, formData.password)) {
        navigate('/admin/dashboard');
      } else {
        setError('Invalid credentials. Please use the demo credentials provided.');
        setIsLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1c2c54] via-[#2f67b5] to-[#1c2c54] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center text-white hover:text-[#f29520] transition-colors mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Home
        </Link>

        {/* Login Card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-6 border border-white/20">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-[#f29520] to-[#e08420] rounded-full flex items-center justify-center mx-auto mb-3">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">Admin Login</h1>
            <p className="text-gray-300 text-sm">Access the Dalxiis Tourism admin panel</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
              <p className="text-red-300 text-xs">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-white mb-1">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-9 pr-4 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#f29520] focus:border-transparent backdrop-blur-sm text-sm"
                  placeholder="Enter your username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-white mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-9 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-[#f29520] focus:border-transparent backdrop-blur-sm text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-3 h-3 text-[#f29520] bg-white/10 border-white/20 rounded focus:ring-[#f29520] focus:ring-2"
                />
                <span className="ml-2 text-xs text-gray-300">Remember me</span>
              </label>
              <a href="#" className="text-xs text-[#f29520] hover:text-[#e08420] transition-colors">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#f29520] to-[#e08420] text-white py-2.5 px-6 rounded-lg font-semibold hover:shadow-lg hover:shadow-[#f29520]/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <LogIn className="h-4 w-4 mr-2" />
                  Sign In
                </div>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-4 p-3 bg-[#f29520]/20 border border-[#f29520]/30 rounded-lg">
            <div className="flex items-center mb-2">
              <Lock className="h-4 w-4 text-[#f29520] mr-2" />
              <h3 className="text-[#f29520] font-semibold text-sm">Demo Access</h3>
            </div>
            <div className="text-xs text-white/90 space-y-1">
              <p><span className="text-[#f29520]">Username:</span> admin</p>
              <p><span className="text-[#f29520]">Password:</span> dalxiis2024</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-xs">
              © 2024 Dalxiis Tourism. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;