import React, { createContext, useContext, useEffect, useState } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'super_admin';
}

interface AdminAuthContextType {
  currentAdmin: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getToken: () => string | null;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}

interface AdminAuthProviderProps {
  children: React.ReactNode;
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  // For demo purposes, using localStorage. In production, use proper JWT tokens
  const login = async (email: string, password: string) => {
    // Demo credentials - in production, this would call your admin auth API
    if (email === 'admin@wealthempires.in' && password === 'admin123') {
      const adminUser: AdminUser = {
        id: 'admin-1',
        email: 'admin@wealthempires.in',
        name: 'Admin User',
        role: 'admin'
      };
      
      setCurrentAdmin(adminUser);
      localStorage.setItem('adminAuth', JSON.stringify({
        user: adminUser,
        token: 'demo-admin-token',
        expires: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }));
    } else {
      throw new Error('Invalid credentials');
    }
  };

  const logout = () => {
    setCurrentAdmin(null);
    localStorage.removeItem('adminAuth');
  };

  const getToken = (): string | null => {
    const authData = localStorage.getItem('adminAuth');
    if (authData) {
      const parsed = JSON.parse(authData);
      if (parsed.expires > Date.now()) {
        return parsed.token;
      } else {
        logout(); // Token expired
      }
    }
    return null;
  };

  useEffect(() => {
    // Check for existing auth on load
    const authData = localStorage.getItem('adminAuth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.expires > Date.now()) {
          setCurrentAdmin(parsed.user);
        } else {
          localStorage.removeItem('adminAuth');
        }
      } catch (error) {
        localStorage.removeItem('adminAuth');
      }
    }
    setLoading(false);
  }, []);

  const value: AdminAuthContextType = {
    currentAdmin,
    loading,
    login,
    logout,
    getToken
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg">
            <span className="text-white font-bold text-xl">WE</span>
          </div>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}