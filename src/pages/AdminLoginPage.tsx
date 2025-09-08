import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';

const AdminLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Preload background image for smooth loading (high priority)
  useEffect(() => {
    const img = new Image();
    (img as any).fetchPriority = 'high';
    img.onload = () => {
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.warn('Failed to load background image, using fallback');
      setImageLoaded(true); // Still show the page even if image fails
    };
    img.src = '/login-page-background-image.jpg';
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      showToast('error', 'Error', 'Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        showToast('success', 'Success', 'Login successful');
        navigate('/admin');
      } else {
        showToast('error', 'Login Failed', result.error || 'Unknown error occurred');
      }
    } catch (error: any) {
      showToast('error', 'Error', error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="relative min-h-screen flex items-center justify-center px-4 py-8"
    >
      {/* Background image (local file) with smooth loading */}
      <div
        className={`absolute inset-0 bg-cover bg-center transition-opacity duration-500 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: imageLoaded ? "url('/login-page-background-image.jpg')" : 'none',
        }}
      />
      {/* Fallback background while image loads */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-orange-900" />
      )}
      {/* Dark gradient overlay: top (60%) -> bottom (40%) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/40" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Loading indicator while image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded-2xl">
            <div className="text-white text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-400 mb-2"></div>
              <p className="text-sm">Loading...</p>
            </div>
          </div>
        )}
        {/* Login Card - Smaller and more compact */}
        <div className="backdrop-blur-md bg-white/20 rounded-2xl shadow-2xl p-6 md:p-8 border border-white/30">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white">Admin Login</h1>
            <div className="mt-2 flex justify-center">
              <span className="h-1 w-12 rounded-full bg-[#f29520]" />
            </div>
          </div>

          {/* Login Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-medium text-gray-200 mb-2">
                Username / Email
              </label>
              <div className="group relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 transition-colors group-focus-within:text-[#f29520]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-white/70 text-gray-900 border border-white/60 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-[#f29520] transition-colors placeholder:text-gray-500 text-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-medium text-gray-200 mb-2">
                Password
              </label>
              <div className="group relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 transition-colors group-focus-within:text-[#f29520]" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-2.5 bg-white/70 text-gray-900 border border-white/60 rounded-lg focus:ring-2 focus:ring-[#f29520] focus:border-[#f29520] transition-colors placeholder:text-gray-500 text-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Forgot Password */}
              <div className="mt-2">
                <Link to="#" className="text-xs font-medium text-[#cfe0ff] hover:text-white/90">
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f29520] text-white py-2.5 px-4 rounded-lg font-semibold shadow-md hover:shadow-lg hover:bg-[#e08518] focus:outline-none focus:ring-2 focus:ring-[#f29520] focus:ring-offset-2 focus:ring-offset-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Login'
              )}
            </button>
          </form>

          {/* Card bottom accent line */}
          <div className="mt-6 h-1 rounded-full bg-[#f29520]/70" />
        </div>

        {/* Go Back to Home Page */}
        <div className="mt-4 text-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center w-full border-2 border-[#f29520] text-[#f29520] rounded-lg py-2 font-semibold transition-colors bg-white/80 hover:bg-[#f29520] hover:text-white text-sm"
          >
            Go Back to Home Page
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-white/80 text-xs">
          <p>&copy; 2025 Dalxiis Tourism. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;
