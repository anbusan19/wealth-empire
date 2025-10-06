import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BarChart3,
  TrendingUp,
  Calendar,
  Award,
  AlertTriangle,
  CheckCircle,
  FileText,
  Loader2,
  ArrowUpRight,
  Building,
  Activity,
  DollarSign
} from 'lucide-react';
import AdminNavigation from '../components/AdminNavigation';
import { useAdminAuth } from '../contexts/AdminAuthContext';
import { ADMIN_API_ENDPOINTS, apiRequest } from '../config/api';

interface DashboardStats {
  totalUsers: number;
  totalHealthChecks: number;
  averageComplianceScore: number;
  newUsersThisMonth: number;
  activeSubscriptions: number;
  totalRevenue: number;
  completionRate: number;
  criticalIssues: number;
}

interface RecentUser {
  id: string;
  email: string;
  startupName: string;
  joinDate: string;
  lastHealthCheck: string | null;
  complianceScore: number | null;
  subscriptionPlan: string;
}

interface RecentHealthCheck {
  id: string;
  userEmail: string;
  startupName: string;
  score: number;
  completedAt: string;
  criticalIssues: number;
}

const DashboardPage: React.FC = () => {
  const { currentAdmin } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentHealthChecks, setRecentHealthChecks] = useState<RecentHealthCheck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch dashboard stats
      const statsResponse = await apiRequest(ADMIN_API_ENDPOINTS.DASHBOARD);
      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      // Fetch recent users
      const usersResponse = await apiRequest(ADMIN_API_ENDPOINTS.RECENT_USERS);
      if (usersResponse.success) {
        setRecentUsers(usersResponse.data);
      }

      // Fetch recent health checks
      const healthChecksResponse = await apiRequest(ADMIN_API_ENDPOINTS.RECENT_HEALTH_CHECKS);
      if (healthChecksResponse.success) {
        setRecentHealthChecks(healthChecksResponse.data);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <AdminNavigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-900 mx-auto mb-4" />
            <p className="text-gray-600">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <AdminNavigation />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300"
            >
              Try Again
            </button>
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
          <div className="mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Welcome back, {currentAdmin?.email}. Here's your platform overview.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {/* Total Users */}
            <div className="bg-gray-900 rounded-3xl p-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-8 w-8" />
                <span className="text-xs font-medium tracking-widest uppercase text-gray-400">
                  TOTAL USERS
                </span>
              </div>
              <div className="text-4xl font-bold mb-2">{stats?.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-300">
                +{stats?.newUsersThisMonth} this month
              </div>
            </div>

            {/* Health Checks */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="h-8 w-8 text-gray-900" />
                <span className="text-xs font-medium tracking-widest uppercase text-gray-600">
                  HEALTH CHECKS
                </span>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stats?.totalHealthChecks.toLocaleString()}
              </div>
              <div className="text-sm text-gray-700">
                {stats?.completionRate}% completion rate
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-4">
                <Award className="h-8 w-8 text-gray-900" />
                <span className="text-xs font-medium tracking-widest uppercase text-gray-600">
                  AVG SCORE
                </span>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                {stats?.averageComplianceScore}%
              </div>
              <div className="text-sm text-gray-700">
                Platform average
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-3xl p-8">
              <div className="flex items-center justify-between mb-4">
                <DollarSign className="h-8 w-8 text-gray-900" />
                <span className="text-xs font-medium tracking-widest uppercase text-gray-600">
                  REVENUE
                </span>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-2">
                ₹{(stats?.totalRevenue! / 100000).toFixed(1)}L
              </div>
              <div className="text-sm text-gray-700">
                {stats?.activeSubscriptions} active subscriptions
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Users */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-gray-900">Recent Users</h2>
                  <Link
                    to="/users"
                    className="text-gray-700 hover:text-gray-900 flex items-center text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-300"
                  >
                    View All
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>

                <div className="space-y-4">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <Building className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{user.startupName}</h3>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.subscriptionPlan === 'Elite'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                            }`}>
                            {user.subscriptionPlan}
                          </span>
                          {user.complianceScore && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.complianceScore >= 80
                                ? 'bg-green-100 text-green-800'
                                : user.complianceScore >= 60
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                              {user.complianceScore}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">
                          Joined {new Date(user.joinDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Critical Issues */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Critical Issues</h3>
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-red-600 mb-2">
                    {stats?.criticalIssues}
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Users with critical compliance issues
                  </p>
                  <Link
                    to="/reports"
                    className="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    View Details →
                  </Link>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
                <div className="space-y-3">
                  <Link
                    to="/users"
                    className="w-full flex items-center justify-center px-4 py-3 text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all duration-300"
                  >
                    <Users className="h-5 w-5 mr-3" />
                    Manage Users
                  </Link>

                  <Link
                    to="/reports"
                    className="w-full flex items-center justify-center px-4 py-3 text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all duration-300"
                  >
                    <BarChart3 className="h-5 w-5 mr-3" />
                    Health Check Reports
                  </Link>

                  <button
                    className="w-full flex items-center justify-center px-4 py-3 text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all duration-300"
                    disabled
                  >
                    <TrendingUp className="h-5 w-5 mr-3" />
                    Analytics (Coming Soon)
                  </button>

                  <button
                    className="w-full flex items-center justify-center px-4 py-3 text-gray-700 bg-gray-100 rounded-2xl hover:bg-gray-200 transition-all duration-300"
                    disabled
                  >
                    <FileText className="h-5 w-5 mr-3" />
                    Settings (Coming Soon)
                  </button>
                </div>
              </div>

              {/* Recent Health Checks */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Assessments</h3>
                <div className="space-y-4">
                  {recentHealthChecks.map((check) => (
                    <div key={check.id} className="border-l-4 border-gray-200 pl-4">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-gray-900 text-sm">{check.startupName}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${check.score >= 80
                            ? 'bg-green-100 text-green-800'
                            : check.score >= 60
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                          {check.score}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{check.userEmail}</p>
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                          {new Date(check.completedAt).toLocaleDateString()}
                        </p>
                        {check.criticalIssues > 0 && (
                          <span className="text-xs text-red-600 font-medium">
                            {check.criticalIssues} critical issues
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;