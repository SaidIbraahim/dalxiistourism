import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, MessageCircle, Facebook, Instagram, Twitter } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { isAdmin } = useAuth();

  // Admin functionality temporarily disabled

  return (
    <footer className="bg-[#1c2c54] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 lg:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#f29520] to-[#2f67b5] rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">D</span>
              </div>
              <div className="ml-3">
                <div className="text-2xl font-bold">Dalxiis Tourism</div>
                <div className="text-[#f29520]">Discover Puntland's Beauty</div>
              </div>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Premier tourism and travel service provider based in Garowe, Somalia. 
              We offer unforgettable travel experiences while promoting sustainable tourism 
              that benefits local communities.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-[#f29520] transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#f29520] transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-[#f29520] transition-colors">
                <Twitter className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#f29520]">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { path: '/', label: 'Home' },
                { path: '/about', label: 'About Us' },
                { path: '/packages', label: 'Tour Packages' },
                { path: '/services', label: 'Services' },
                { path: '/destinations', label: 'Destinations' }
              ].map((link) => (
                <li key={link.path}>
                  <Link 
                    to={link.path} 
                    className="text-gray-300 hover:text-[#f29520] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-[#f29520]">Contact Info</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-[#f29520]" />
                <span className="text-gray-300 text-sm">Garowe, Puntland, Somalia</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-[#f29520]" />
                <a href="tel:+252907793854" className="text-gray-300 text-sm hover:text-[#f29520] transition-colors">
                  +252 907793854
                </a>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-[#f29520]" />
                <a href="mailto:dalxiistta@gmail.com" className="text-gray-300 text-sm hover:text-[#f29520] transition-colors">
                  dalxiistta@gmail.com
                </a>
              </div>
              <div className="flex items-center">
                <MessageCircle className="h-5 w-5 mr-3 text-[#f29520]" />
                <a 
                  href="https://wa.me/252907793854" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-300 text-sm hover:text-[#f29520] transition-colors"
                >
                  WhatsApp Chat
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-sm">
              © 2025 Dalxiis Tourism. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/privacy" className="text-gray-300 text-sm hover:text-[#f29520] transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-300 text-sm hover:text-[#f29520] transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;