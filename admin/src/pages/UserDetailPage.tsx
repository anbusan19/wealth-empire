import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Mail,
  Phone,
  Globe,
  MapPin,
  Calendar,
  Award,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Edit,
  Trash2,
  Loader2,
  User,
  CreditCard,
  Activity
} from 'lucide-react';
import AdminNavigation from '../components/AdminNavigation';
import { ADMIN_API_ENDPOINTS, apiRequest } from '../config/api';

interface UserDetail {
  id: string;
  email: string;
  startupName: string;
  founderName: string;
  city: string;
  state: string;
  country: string;
  website?: string;
  contactNumber: string;
  subscriptionPlan: 'Free' | 'Elite' | 'White Label';
  subscriptionStatus: 'Active' | 'Expired' | 'Cancelled';
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  isOnboarded: boolean;
  joinDate: string;
  lastLogin: string;
  lastHealthCheck?: string;
  complianceScore?: number;
  totalHealthChecks: number;
  status: 'Active' | 'Inactive' | 'Suspended';
  totalRevenue: number;
}

interface HealthCheckHistory {
  id: string;
  date: string;
  score: number;
  criticalIssues: number;
  recommendations: string[];
}

const UserDetailPage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [healthCheckHistory, setHealthCheckHistory] = useState<HealthCheckHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'health-checks' | 'subscription'>('overview');

  useEffect(() => {
    if (userId) {
      fetchUserDetail(userId);
    }
  }, [userId]);

  const fetchUserDetail = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest(ADMIN_API_ENDPOINTS.USER_DETAIL(id));
      
      if (response.success) {
        const userData = response.data;
        setUser(userData);
        setHealthCheckHistory(userData.healthCheckHistory || []);
      }
    } catch (error) {
      console.error('Error fetching user detail:', error);
      setError('Failed to load user details');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-yellow-100 text-yellow-800',
      Suspended: 'bg-red-100 text-red-800',
      Expired: 'bg-red-100 text-red-800',
      Cancelled: 'bg-gray-100 text-gray-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getPlanBadge = (plan: string) => {
    const styles = {
      Free: 'bg-gray-100 text-gray-800',
      Elite: 'bg-blue-100 text-blue-800',
      'White Label': 'bg-purple-100 text-purple-800'
    };
    return styles[plan as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <AdminNavigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-900 mx-auto mb-4" />
            <p className="text-gray-600">Loading user details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-white">
        <AdminNavigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error || 'User not found'}</p>
            <Link
              to="/admin/users"
              className="px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300"
            >
              Back to Users
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminNavigation />
      
      <section className="relative pt-20 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link
                to="/admin/users"
                className="mr-4 p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">{user.startupName}</h1>
                <p className="text-gray-600">{user.founderName} • {user.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                {user.status}
              </span>
              <button className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100">
                <Edit className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('health-checks')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'health-checks'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Health Checks
              </button>
              <button
                onClick={() => setActiveTab('subscription')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'subscription'
                    ? 'border-gray-900 text-gray-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Subscription
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User Info */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">User Information</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <User className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Founder Name</p>
                          <p className="text-lg font-semibold text-gray-900">{user.founderName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Mail className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Email</p>
                          <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <Phone className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Contact Number</p>
                          <p className="text-lg font-semibold text-gray-900">{user.contactNumber}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <Building className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Startup Name</p>
                          <p className="text-lg font-semibold text-gray-900">{user.startupName}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <MapPin className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Location</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {user.city}, {user.state}, {user.country}
                          </p>
                        </div>
                      </div>
                      
                      {user.website && (
                        <div className="flex items-start">
                          <Globe className="h-5 w-5 text-gray-400 mt-1 mr-3" />
                          <div>
                            <p className="text-sm font-medium text-gray-500">Website</p>
                            <a
                              href={user.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg font-semibold text-blue-600 hover:text-blue-700"
                            >
                              {user.website}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Sidebar */}
              <div className="space-y-6">
                {/* Compliance Score */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
                  <div className="text-center">
                    <Award className="h-8 w-8 text-gray-900 mx-auto mb-4" />
                    <div className="text-4xl font-bold text-gray-900 mb-2">
                      {user.complianceScore || 0}%
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Latest Compliance Score</p>
                    {user.lastHealthCheck && (
                      <p className="text-xs text-gray-500">
                        Last check: {new Date(user.lastHealthCheck).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {/* Activity Stats */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Activity</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Health Checks</span>
                      <span className="font-semibold text-gray-900">{user.totalHealthChecks}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Member Since</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(user.joinDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Login</span>
                      <span className="font-semibold text-gray-900">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Revenue */}
                <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Revenue</h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900 mb-2">
                      ₹{user.totalRevenue.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'health-checks' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Health Check History</h2>
                
                {healthCheckHistory.length > 0 ? (
                  <div className="space-y-6">
                    {healthCheckHistory.map((check) => (
                      <div key={check.id} className="border border-gray-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                              check.score >= 80 ? 'bg-green-100' :
                              check.score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
                            }`}>
                              <span className={`text-lg font-bold ${
                                check.score >= 80 ? 'text-green-800' :
                                check.score >= 60 ? 'text-yellow-800' : 'text-red-800'
                              }`}>
                                {check.score}%
                              </span>
                            </div>
                            <div className="ml-4">
                              <h3 className="text-lg font-semibold text-gray-900">
                                Compliance Assessment
                              </h3>
                              <p className="text-sm text-gray-600">
                                {new Date(check.date).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          {check.criticalIssues > 0 && (
                            <span className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                              {check.criticalIssues} Critical Issues
                            </span>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h4>
                          <ul className="space-y-1">
                            {check.recommendations.slice(0, 3).map((rec, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-start">
                                <span className="w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No health checks completed yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'subscription' && (
            <div className="space-y-6">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Details</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Plan</h3>
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                        <div className="flex items-center">
                          <CreditCard className="h-6 w-6 text-gray-600 mr-3" />
                          <div>
                            <p className="font-semibold text-gray-900">{user.subscriptionPlan}</p>
                            <p className="text-sm text-gray-600">Current subscription</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(user.subscriptionStatus)}`}>
                          {user.subscriptionStatus}
                        </span>
                      </div>
                    </div>

                    {user.subscriptionStartDate && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Period</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Start Date</span>
                            <span className="font-semibold text-gray-900">
                              {new Date(user.subscriptionStartDate).toLocaleDateString()}
                            </span>
                          </div>
                          {user.subscriptionEndDate && (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">End Date</span>
                              <span className="font-semibold text-gray-900">
                                {new Date(user.subscriptionEndDate).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>
                    <div className="p-4 bg-gray-50 rounded-2xl">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900 mb-2">
                          ₹{user.totalRevenue.toLocaleString()}
                        </div>
                        <p className="text-sm text-gray-600">Total Revenue Generated</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserDetailPage;