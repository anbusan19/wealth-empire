import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${isScrolled ? 'w-[95%] max-w-6xl' : 'w-[96%] sm:w-[98%] max-w-7xl'
      }`}>
      <div className={`glass-nav rounded-xl sm:rounded-2xl border border-white/20 shadow-2xl transition-all duration-500 ${isScrolled ? 'bg-white/70 backdrop-blur-xl shadow-xl' : 'bg-white/60 backdrop-blur-lg'
        }`}>
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <Link to="/" className="text-lg sm:text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  wealthempire.
                </span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/health-check" className="nav-link text-gray-700 hover:text-gray-900 transition-all duration-300 text-sm font-medium relative">
                Health Check
              </Link>
              <a href="#services" className="nav-link text-gray-700 hover:text-gray-900 transition-all duration-300 text-sm font-medium relative">
                Services
              </a>
              <a href="#pricing" className="nav-link text-gray-700 hover:text-gray-900 transition-all duration-300 text-sm font-medium relative">
                Pricing
              </a>
              <a href="#resources" className="nav-link text-gray-700 hover:text-gray-900 transition-all duration-300 text-sm font-medium relative">
                Resources
              </a>
              <a href="#contact" className="nav-link text-gray-700 hover:text-gray-900 transition-all duration-300 text-sm font-medium relative">
                Contact
              </a>
            </div>

            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              <button className="text-gray-700 hover:text-gray-900 transition-all duration-300 text-sm font-medium px-3 lg:px-4 py-2 rounded-lg hover:bg-white/50">
                Login
              </button>
              <Link to="/health-check" className="bg-gradient-to-r from-gray-900 to-gray-700 text-white px-4 lg:px-6 py-2 lg:py-2.5 rounded-xl hover:from-gray-800 hover:to-gray-600 transition-all duration-300 text-xs lg:text-sm font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 inline-block">
                Start Health Check
              </Link>
            </div>

            <button
              className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={20} className="text-gray-700" /> : <Menu size={20} className="text-gray-700" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden border-t border-white/20 bg-white/80 backdrop-blur-xl rounded-b-2xl animate-slide-down">
            <div className="px-6 py-4 space-y-3">
              <Link to="/health-check" className="block text-gray-700 hover:text-gray-900 py-3 px-3 rounded-lg hover:bg-white/50 transition-all duration-300" onClick={() => setIsMenuOpen(false)}>
                Health Check
              </Link>
              <a href="#services" className="block text-gray-700 hover:text-gray-900 py-3 px-3 rounded-lg hover:bg-white/50 transition-all duration-300">
                Services
              </a>
              <a href="#pricing" className="block text-gray-700 hover:text-gray-900 py-3 px-3 rounded-lg hover:bg-white/50 transition-all duration-300">
                Pricing
              </a>
              <a href="#resources" className="block text-gray-700 hover:text-gray-900 py-3 px-3 rounded-lg hover:bg-white/50 transition-all duration-300">
                Resources
              </a>
              <a href="#contact" className="block text-gray-700 hover:text-gray-900 py-3 px-3 rounded-lg hover:bg-white/50 transition-all duration-300">
                Contact
              </a>
              <div className="pt-3 space-y-3 border-t border-white/20">
                <button className="w-full text-gray-700 hover:text-gray-900 py-3 px-3 text-left rounded-lg hover:bg-white/50 transition-all duration-300">
                  Login
                </button>
                <Link to="/health-check" className="w-full bg-gradient-to-r from-gray-900 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-800 hover:to-gray-600 transition-all duration-300 shadow-lg inline-block text-center" onClick={() => setIsMenuOpen(false)}>
                  Start Health Check
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
