import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <a href="/" className="text-2xl font-bold text-gray-900">
              WE Health Check
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <a href="#health-check" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium">
              Health Check
            </a>
            <a href="#services" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium">
              Services
            </a>
            <a href="#pricing" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium">
              Pricing
            </a>
            <a href="#resources" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium">
              Resources
            </a>
            <a href="#contact" className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium">
              Contact
            </a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <button className="text-gray-700 hover:text-gray-900 transition-colors text-sm font-medium">
              Login
            </button>
            <button className="bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-all text-sm font-medium">
              Start Health Check
            </button>
          </div>

          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-6 py-4 space-y-3">
            <a href="#health-check" className="block text-gray-700 hover:text-gray-900 py-2">
              Health Check
            </a>
            <a href="#services" className="block text-gray-700 hover:text-gray-900 py-2">
              Services
            </a>
            <a href="#pricing" className="block text-gray-700 hover:text-gray-900 py-2">
              Pricing
            </a>
            <a href="#resources" className="block text-gray-700 hover:text-gray-900 py-2">
              Resources
            </a>
            <a href="#contact" className="block text-gray-700 hover:text-gray-900 py-2">
              Contact
            </a>
            <div className="pt-3 space-y-2">
              <button className="w-full text-gray-700 hover:text-gray-900 py-2 text-left">
                Login
              </button>
              <button className="w-full bg-gray-900 text-white px-5 py-2.5 rounded-full hover:bg-gray-800 transition-all">
                Start Health Check
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
