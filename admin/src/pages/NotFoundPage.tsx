import React from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Home } from 'lucide-react';
import AdminNavigation from '../components/AdminNavigation';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      <AdminNavigation />
      
      <section className="relative pt-20 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="mb-8">
            <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-6" />
            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
            <p className="text-lg text-gray-600 mb-8">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 font-medium"
            >
              <Home className="h-5 w-5 mr-2" />
              Back to Dashboard
            </Link>
            <Link
              to="/users"
              className="inline-flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300 font-medium"
            >
              View Users
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NotFoundPage;