import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  BarChart3,
  Award,
  AlertTriangle,
  Loader2,
  ArrowUpRight,
  Building,
  IndianRupee
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
        <div className="flex items-center mt-20 justify-center py-20">
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
          <div className="mb-8 lg:mb-12">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-base lg:text-lg break-words">
              Welcome back, {currentAdmin?.email}. Here's your platform overview.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 lg:mb-12">
            {/* Total Users */}
            <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white">
              <div className="flex items-center justify-between mb-4">
                <Users className="h-6 w-6 sm:h-8 sm:w-8" />
                <span className="text-xs font-medium tracking-widest uppercase text-gray-400 text-right leading-tight">
                  TOTAL<br className="sm:hidden" /><span className="hidden sm:inline"> </span>USERS
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold mb-2 font-numbers">{stats?.totalUsers.toLocaleString()}</div>
              <div className="text-sm text-gray-300">
                +<span className="font-numbers">{stats?.newUsersThisMonth}</span> this month
              </div>
            </div>

            {/* Health Checks */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900" />
                <span className="text-xs font-medium tracking-widest uppercase text-gray-600 text-right leading-tight">
                  HEALTH<br className="sm:hidden" /><span className="hidden sm:inline"> </span>CHECKS
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-numbers">
                {stats?.totalHealthChecks.toLocaleString()}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-numbers">{stats?.completionRate}%</span> completion rate
              </div>
            </div>

            {/* Average Score */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900" />
                <span className="text-xs font-medium tracking-widest uppercase text-gray-600 text-right leading-tight">
                  AVG<br className="sm:hidden" /><span className="hidden sm:inline"> </span>SCORE
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-numbers">
                {stats?.averageComplianceScore}%
              </div>
              <div className="text-sm text-gray-700">
                Platform average
              </div>
            </div>

            {/* Revenue */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
              <div className="flex items-center justify-between mb-4">
                <IndianRupee className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900" />
                <span className="text-xs font-medium tracking-widest uppercase text-gray-600 text-right leading-tight">
                  REVENUE
                </span>
              </div>
              <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-numbers">
                ₹{(stats?.totalRevenue! / 100000).toFixed(1)}L
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-numbers">{stats?.activeSubscriptions}</span> active subscriptions
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Recent Users */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 lg:mb-8 gap-3 sm:gap-0">
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Recent Users</h2>
                  <Link
                    to="/users"
                    className="text-gray-700 hover:text-gray-900 flex items-center text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-300 self-start sm:self-auto"
                  >
                    <span className="hidden sm:inline">View All</span>
                    <span className="sm:hidden">View All</span>
                    <ArrowUpRight className="h-4 w-4 ml-2" />
                  </Link>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {recentUsers.map((user, index) => (
                    <div key={`${user.id}_${index}`} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-3 sm:p-4 bg-gray-50 rounded-2xl gap-3 sm:gap-0">
                      <div className="flex items-center space-x-3 sm:space-x-4 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <Building className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-gray-900 font-lato text-sm sm:text-base truncate">{user.startupName}</h3>
                          <p className="text-xs sm:text-sm text-gray-600 font-lato truncate">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex flex-col sm:text-right gap-2 sm:gap-1 sm:items-end">
                        <div className="flex items-center space-x-2 flex-wrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${user.subscriptionPlan === 'Elite'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {user.subscriptionPlan}
                          </span>
                          {user.complianceScore && (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${user.complianceScore >= 80
                              ? 'bg-green-100 text-green-800'
                              : user.complianceScore >= 60
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                              }`}>
                              {user.complianceScore}%
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 font-lato whitespace-nowrap">
                          Joined {new Date(user.joinDate).toLocaleDateString('en-GB')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {recentUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-sm">No recent users found</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 lg:space-y-8">
              {/* Critical Issues */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Critical Issues</h3>
                  <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 text-red-500" />
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-red-600 mb-2 font-numbers">
                    {stats?.criticalIssues}
                  </div>
                  <p className="text-sm text-gray-600 mb-3 lg:mb-4">
                    Users with critical compliance issues
                  </p>
                  <Link
                    to="/reports"
                    className="text-red-600 hover:text-red-700 font-medium text-sm inline-block px-3 py-1 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    View Details →
                  </Link>
                </div>
              </div>

              {/* Recent Health Checks */}
              <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 sm:p-6 lg:p-8">
                <div className="flex items-center justify-between mb-4 lg:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Recent Assessments</h3>
                  <Link
                    to="/reports"
                    className="text-gray-700 hover:text-gray-900 flex items-center text-xs font-medium px-3 py-1 rounded-lg hover:bg-gray-100 transition-all duration-300"
                  >
                    View All
                    <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Link>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  {recentHealthChecks.slice(0, 3).map((check, index) => (
                    <div key={`${check.id}_${index}`} className="border-l-4 border-gray-200 pl-3 sm:pl-4">
                      <div className="flex items-start justify-between mb-1 gap-2">
                        <h4 className="font-medium text-gray-900 text-sm font-lato truncate flex-1 min-w-0">{check.startupName}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium font-numbers whitespace-nowrap flex-shrink-0 ${check.score >= 80
                          ? 'bg-green-100 text-green-800'
                          : check.score >= 60
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                          }`}>
                          {check.score}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1 font-lato truncate">{check.userEmail}</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-gray-500 font-lato whitespace-nowrap">
                          {new Date(check.completedAt).toLocaleDateString('en-GB')}
                        </p>
                        {check.criticalIssues > 0 && (
                          <span className="text-xs text-red-600 font-medium whitespace-nowrap">
                            <span className="font-numbers">{check.criticalIssues}</span> critical
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {recentHealthChecks.length === 0 && (
                  <div className="text-center py-6">
                    <BarChart3 className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 text-sm">No recent assessments</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;