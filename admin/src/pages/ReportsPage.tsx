import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    TrendingUp,
    Award,
    Download,
    Search,
    FileText,
    AlertTriangle,
    CheckCircle,
    Building,
    Loader2,
    ArrowUpRight
} from 'lucide-react';
import AdminNavigation from '../components/AdminNavigation';
import { ADMIN_API_ENDPOINTS, apiRequest } from '../config/api';

interface ReportStats {
    totalReports: number;
    averageScore: number;
    criticalIssues: number;
    completedThisMonth: number;
    improvementRate: number;
    topPerformingCategory: string;
}

interface ComplianceReport {
    id: string;
    userId?: string;
    userEmail: string;
    startupName: string;
    score: number;
    completedAt: string;
    criticalIssues: number;
    status: 'Completed' | 'In Progress' | 'Failed';
    categories: {
        legal: number;
        financial: number;
        operational: number;
        regulatory: number;
    };
}

interface CategoryStats {
    category: string;
    averageScore: number;
    totalReports: number;
    improvement: number;
}

const ReportsPage: React.FC = () => {
    const navigate = useNavigate();
    const [reports, setReports] = useState<ComplianceReport[]>([]);
    const [stats, setStats] = useState<ReportStats | null>(null);
    const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'in-progress' | 'failed'>('all');
    const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

    useEffect(() => {
        fetchReportsData();
    }, []);

    useEffect(() => {
        fetchReportsData();
    }, [searchTerm, filterStatus, dateRange]);

    const fetchReportsData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Build query parameters
            const params = new URLSearchParams({
                ...(searchTerm && { search: searchTerm }),
                ...(filterStatus !== 'all' && { status: filterStatus }),
                ...(dateRange !== 'all' && { dateRange })
            });

            const response = await apiRequest(`${ADMIN_API_ENDPOINTS.REPORTS}?${params}`);

            if (response.success) {
                setStats(response.data.stats);
                setReports(response.data.reports);
                setCategoryStats(response.data.categoryStats);
            }
        } catch (error) {
            console.error('Error fetching reports data:', error);
            setError('Failed to load reports data. Please check your connection.');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const styles = {
            Completed: 'bg-green-100 text-green-800',
            'In Progress': 'bg-yellow-100 text-yellow-800',
            Failed: 'bg-red-100 text-red-800'
        };
        return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    };

    const getScoreBadge = (score: number) => {
        if (score >= 80) return 'bg-green-100 text-green-800';
        if (score >= 60) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const filteredReports = reports.filter(report => {
        const matchesSearch = report.startupName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            report.userEmail.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = filterStatus === 'all' ||
            (filterStatus === 'completed' && report.status === 'Completed') ||
            (filterStatus === 'in-progress' && report.status === 'In Progress') ||
            (filterStatus === 'failed' && report.status === 'Failed');

        return matchesSearch && matchesStatus;
    });

    const handleUserClick = (report: ComplianceReport) => {
        // Extract user ID from the report ID or use a separate userId field
        const userId = report.userId || report.id.split('_')[0];
        navigate(`/users/${userId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <AdminNavigation />
                <div className="flex items-center justify-center py-20">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-900 mx-auto mb-4" />
                        <p className="text-gray-600">Loading reports...</p>
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
                            onClick={fetchReportsData}
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
                    <div className="flex items-center justify-between mb-12">
                        <div>
                            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
                                Compliance Reports
                            </h1>
                            <p className="text-gray-600 text-lg">
                                Monitor and analyze startup compliance assessments across the platform.
                            </p>
                        </div>
                        <button className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300">
                            <Download className="h-5 w-5 mr-2" />
                            Export Reports
                        </button>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 px-2 sm:px-0">
                        {/* Total Reports */}
                        <div className="bg-gray-900 rounded-3xl p-8 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <FileText className="h-8 w-8" />
                                <span className="text-xs font-medium tracking-widest uppercase text-gray-400">
                                    TOTAL REPORTS
                                </span>
                            </div>
                            <div className="text-4xl font-bold mb-2 font-numbers">{stats?.totalReports.toLocaleString()}</div>
                            <div className="text-sm text-gray-300">
                                +<span className="font-numbers">{stats?.completedThisMonth}</span> this month
                            </div>
                        </div>

                        {/* Average Score */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8">
                            <div className="flex items-center justify-between mb-4">
                                <Award className="h-8 w-8 text-gray-900" />
                                <span className="text-xs font-medium tracking-widest uppercase text-gray-600">
                                    AVG SCORE
                                </span>
                            </div>
                            <div className="text-4xl font-bold text-gray-900 mb-2 font-numbers">
                                {stats?.averageScore}%
                            </div>
                            <div className="text-sm text-gray-700">
                                Platform average
                            </div>
                        </div>

                        {/* Critical Issues */}
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-3xl p-8">
                            <div className="flex items-center justify-between mb-4">
                                <AlertTriangle className="h-8 w-8 text-gray-900" />
                                <span className="text-xs font-medium tracking-widest uppercase text-gray-600">
                                    CRITICAL ISSUES
                                </span>
                            </div>
                            <div className="text-4xl font-bold text-gray-900 mb-2 font-numbers">
                                {stats?.criticalIssues}
                            </div>
                            <div className="text-sm text-gray-700">
                                Require attention
                            </div>
                        </div>

                        {/* Improvement Rate */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8">
                            <div className="flex items-center justify-between mb-4">
                                <TrendingUp className="h-8 w-8 text-gray-900" />
                                <span className="text-xs font-medium tracking-widest uppercase text-gray-600">
                                    IMPROVEMENT
                                </span>
                            </div>
                            <div className="text-4xl font-bold text-gray-900 mb-2 font-numbers">
                                +{stats?.improvementRate}%
                            </div>
                            <div className="text-sm text-gray-700">
                                Month over month
                            </div>
                        </div>
                    </div>

                    {/* Category Performance */}
                    <div className="mb-12">
                        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Category Performance</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {categoryStats.map((category, index) => (
                                    <div key={`${category.category}_${index}`} className="p-6 bg-gray-50 rounded-2xl">
                                        <h3 className="font-semibold text-gray-900 mb-2">{category.category}</h3>
                                        <div className="text-3xl font-bold text-gray-900 mb-2 font-numbers">
                                            {category.averageScore}%
                                        </div>
                                        <div className="flex items-center text-sm">
                                            <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                                            <span className="text-green-600 font-medium font-numbers">+{category.improvement}%</span>
                                            <span className="text-gray-500 ml-1">vs last month</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 mb-8">
                        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
                            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search reports..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                    />
                                </div>

                                {/* Status Filter */}
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value as any)}
                                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="in-progress">In Progress</option>
                                    <option value="failed">Failed</option>
                                </select>

                                {/* Date Range */}
                                <select
                                    value={dateRange}
                                    onChange={(e) => setDateRange(e.target.value as any)}
                                    className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                                >
                                    <option value="7d">Last 7 days</option>
                                    <option value="30d">Last 30 days</option>
                                    <option value="90d">Last 90 days</option>
                                    <option value="all">All time</option>
                                </select>
                            </div>

                            <div className="text-sm text-gray-600">
                                Showing {filteredReports.length} of {reports.length} reports
                            </div>
                        </div>

                        {/* Reports Table */}
                        <div className="overflow-x-auto">
                            <div className="mb-4 text-sm text-gray-600">
                                💡 Click on any row to view the detailed user report
                            </div>
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-4 px-2 font-semibold text-gray-900">Startup</th>
                                        <th className="text-left py-4 px-2 font-semibold text-gray-900">Score</th>
                                        <th className="text-left py-4 px-2 font-semibold text-gray-900">Status</th>
                                        <th className="text-left py-4 px-2 font-semibold text-gray-900">Issues</th>
                                        <th className="text-left py-4 px-2 font-semibold text-gray-900">Date</th>
                                        <th className="text-left py-4 px-2 font-semibold text-gray-900">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredReports.map((report, index) => (
                                        <tr
                                            key={`${report.id}_${index}`}
                                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-200"
                                            onClick={() => handleUserClick(report)}
                                            title={`Click to view ${report.startupName}'s detailed report`}
                                        >
                                            <td className="py-4 px-2">
                                                <div className="flex items-center">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                                        <Building className="h-5 w-5 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                                            {report.startupName}
                                                        </div>
                                                        <div className="text-sm text-gray-600">{report.userEmail}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-2">
                                                {report.status === 'In Progress' ? (
                                                    <span className="text-gray-500">-</span>
                                                ) : (
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getScoreBadge(report.score)}`}>
                                                        {report.score}%
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-2">
                                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(report.status)}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-2">
                                                {report.criticalIssues > 0 ? (
                                                    <span className="text-red-600 font-medium">{report.criticalIssues}</span>
                                                ) : (
                                                    <CheckCircle className="h-5 w-5 text-green-600" />
                                                )}
                                            </td>
                                            <td className="py-4 px-2 text-sm text-gray-600">
                                                {new Date(report.completedAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-2">
                                                <button
                                                    className="text-gray-600 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleUserClick(report);
                                                    }}
                                                >
                                                    <ArrowUpRight className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {filteredReports.length === 0 && (
                                <div className="text-center py-12">
                                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">No reports found matching your criteria</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default ReportsPage;