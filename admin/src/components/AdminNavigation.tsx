import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  User, 
  LogOut, 
  Users, 
  BarChart3, 
  FileText,
  Home
} from 'lucide-react';
import { useAdminAuth } from '../contexts/AdminAuthContext';

export default function AdminNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { currentAdmin, logout } = useAdminAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-2 sm:top-4 left-1/2 transform -translate-x-1/2 z-50 w-[96%] sm:w-[98%] max-w-7xl">
      <div className="glass-nav rounded-xl sm:rounded-2xl border border-white/20 shadow-2xl bg-white/60 backdrop-blur-lg">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <Link to="/" className="text-lg sm:text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                <span className="bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  wealthempire.
                </span>
                <span className="text-sm text-gray-600 ml-2">admin</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className={`nav-link transition-all duration-300 text-sm font-medium relative flex items-center gap-2 ${
                  isActive('/') ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Home size={16} />
                Dashboard
              </Link>
              <Link 
                to="/users" 
                className={`nav-link transition-all duration-300 text-sm font-medium relative flex items-center gap-2 ${
                  isActive('/users') ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <Users size={16} />
                Users
              </Link>
              <Link 
                to="/reports" 
                className={`nav-link transition-all duration-300 text-sm font-medium relative flex items-center gap-2 ${
                  isActive('/reports') ? 'text-gray-900' : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                <FileText size={16} />
                Reports
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-all duration-300 text-sm font-medium px-3 lg:px-4 py-2 rounded-lg hover:bg-white/50"
                >
                  <User size={16} />
                  {currentAdmin?.name}
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white/90 backdrop-blur-xl rounded-xl shadow-lg border border-white/20 py-2 z-50">
                    <div className="px-4 py-2 text-sm text-gray-600 border-b border-gray-200">
                      {currentAdmin?.email}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-white/50 flex items-center gap-2"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
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
              <Link 
                to="/" 
                className={`block py-3 px-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                  isActive('/') ? 'text-gray-900 bg-white/50' : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Home size={16} />
                Dashboard
              </Link>
              <Link 
                to="/users" 
                className={`block py-3 px-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                  isActive('/users') ? 'text-gray-900 bg-white/50' : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <Users size={16} />
                Users
              </Link>
              <Link 
                to="/reports" 
                className={`block py-3 px-3 rounded-lg transition-all duration-300 flex items-center gap-2 ${
                  isActive('/reports') ? 'text-gray-900 bg-white/50' : 'text-gray-700 hover:text-gray-900 hover:bg-white/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText size={16} />
                Reports
              </Link>
              
              <div className="pt-3 space-y-3 border-t border-white/20">
                <div className="px-3 py-2 text-sm text-gray-600">
                  {currentAdmin?.email}
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-gray-700 hover:text-gray-900 py-3 px-3 text-left rounded-lg hover:bg-white/50 transition-all duration-300 flex items-center gap-2"
                >
                  <LogOut size={16} />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}