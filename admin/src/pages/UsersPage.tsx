import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Download,
  Building,
  Loader2
} from 'lucide-react';
import AdminNavigation from '../components/AdminNavigation';
import { ADMIN_API_ENDPOINTS, apiRequest } from '../config/api';

interface User {
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
  isOnboarded: boolean;
  joinDate: string;
  lastLogin: string;
  lastHealthCheck?: string;
  complianceScore?: number;
  totalHealthChecks: number;
  status: 'Active' | 'Inactive' | 'Suspended';
}

const UsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPlan, setFilterPlan] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, searchTerm, filterPlan, filterStatus]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: usersPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterPlan !== 'all' && { subscription: filterPlan }),
        ...(filterStatus !== 'all' && { status: filterStatus })
      });

      const response = await apiRequest(`${ADMIN_API_ENDPOINTS.USERS_LIST}?${params}`);
      
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.startupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.founderName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPlan = filterPlan === 'all' || user.subscriptionPlan === filterPlan;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    
    return matchesSearch && matchesPlan && matchesStatus;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const getStatusBadge = (status: string) => {
    const styles = {
      Active: 'bg-green-100 text-green-800',
      Inactive: 'bg-yellow-100 text-yellow-800',
      Suspended: 'bg-red-100 text-red-800'
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
            <p className="text-gray-600">Loading users...</p>
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Users</h1>
              <p className="text-gray-600">Manage platform users and their subscriptions</p>
            </div>
            <div className="mt-4 sm:mt-0">
              <button className="flex items-center px-4 py-2 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300">
                <Download className="h-4 w-4 mr-2" />
                Export Users
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  />
                </div>
              </div>

              {/* Plan Filter */}
              <div>
                <select
                  value={filterPlan}
                  onChange={(e) => setFilterPlan(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                >
                  <option value="all">All Plans</option>
                  <option value="Free">Free</option>
                  <option value="Elite">Elite</option>
                  <option value="White Label">White Label</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                </select>
              </div>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Startup
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Compliance
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {currentUsers.map((user, index) => (
                    <tr key={`${user.id}_${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Building className="h-5 w-5 text-gray-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 font-lato">{user.founderName}</div>
                            <div className="text-sm text-gray-500 font-lato">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 font-lato">{user.startupName}</div>
                        <div className="text-sm text-gray-500 font-lato">{user.city}, {user.state}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPlanBadge(user.subscriptionPlan)}`}>
                          {user.subscriptionPlan}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.complianceScore ? (
                          <div className="flex items-center">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full font-lato ${
                              user.complianceScore >= 80 ? 'bg-green-100 text-green-800' :
                              user.complianceScore >= 60 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {user.complianceScore}%
                            </span>
                            <span className="ml-2 text-xs text-gray-500 font-lato">
                              ({user.totalHealthChecks} checks)
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400 font-lato">No assessments</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(user.status)}`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-lato">
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/users/${user.id}`}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
                <div className="text-sm text-gray-700 font-lato">
                  Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Previous
                  </button>
                  <span className="px-3 py-1 text-sm bg-gray-900 text-white rounded-lg font-lato">
                    {currentPage}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default UsersPage;