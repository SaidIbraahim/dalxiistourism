import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, Phone } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isAdmin } = useAuth();

  // Don't render navbar for admin users
  if (isAdmin) {
    return null;
  }

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/packages', label: 'Packages' },
    { path: '/services', label: 'Services' },
    { path: '/destinations', label: 'Destinations' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' }
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Top Bar */}
      <div className="bg-[#1c2c54] text-white py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                <span>Garowe, Puntland, Somalia</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-1" />
                <span>+252 907793854</span>
              </div>
            </div>
            <div className="hidden md:block">
              <span>Premium Tourism Services Since 2020</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-[#f29520] to-[#2f67b5] rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-xl">D</span>
                </div>
                <div className="ml-3">
                  <div className="text-2xl font-bold text-[#1c2c54]">Dalxiis</div>
                  <div className="text-sm text-[#f29520] font-medium">Tourism</div>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`font-medium transition-colors duration-200 ${
                    location.pathname === link.path
                      ? 'text-[#f29520] border-b-2 border-[#f29520]'
                      : 'text-[#1c2c54] hover:text-[#f29520]'
                  } py-2`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/admin/login"
                className={`font-medium transition-colors duration-200 ${
                  location.pathname === '/admin/login'
                    ? 'text-[#f29520] border-b-2 border-[#f29520]'
                    : 'text-[#1c2c54] hover:text-[#f29520]'
                } py-2`}
              >
                Admin
              </Link>
              <a
                href="https://wa.me/252905345879"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#f29520] text-white px-6 py-2 rounded-full font-medium hover:bg-[#e08420] transition-colors duration-200"
              >
                Book Now
              </a>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="text-[#1c2c54] hover:text-[#f29520] transition-colors"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={toggleMenu}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location.pathname === link.path
                      ? 'text-[#f29520] bg-[#e0dddf]'
                      : 'text-[#1c2c54] hover:text-[#f29520] hover:bg-[#e0dddf]'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/admin/login"
                onClick={toggleMenu}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  location.pathname === '/admin/login'
                    ? 'text-[#f29520] bg-[#e0dddf]'
                    : 'text-[#1c2c54] hover:text-[#f29520] hover:bg-[#e0dddf]'
                }`}
              >
                Admin Login
              </Link>
              <a
                href="https://wa.me/252905345879"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 bg-[#f29520] text-white rounded-md text-center font-medium"
              >
                Book Now
              </a>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;