import {
    AlertTriangle,
    Award,
    Building,
    CheckCircle,
    Download,
    FileText,
    Loader2,
    Search,
    TrendingUp,
    Calendar,
    BarChart3,
    Users,
    Eye
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import AdminNavigation from '../components/AdminNavigation';
import { ADMIN_API_ENDPOINTS, apiRequest } from '../config/api';

// ... (Interface definitions remain the same)

interface ReportStats {
    totalReports: number;
    averageScore: number;
    criticalIssues: number;
    completedThisMonth: number;
    improvementRate: number;
    topPerformingCategory: string;
}

interface ComplianceReport {
    id: string; // This is the healthCheckResults._id
    userId?: string; // This is the user's main _id (68e49f5f4652adc7d3d94beb)
    userEmail: string;
    startupName: string;
    founderName?: string;
    score: number;
    completedAt: string;
    criticalIssues: number;
    status: 'Completed' | 'In Progress' | 'Failed';
    riskLevel?: 'low' | 'medium' | 'high' | 'critical';
    strengths?: string[];
    redFlags?: string[];
    recommendations?: string[];
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
    const [exportLoading, setExportLoading] = useState(false);
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

            // Assuming ADMIN_API_ENDPOINTS.REPORTS fetches the list of compliance reports
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

    const getRiskLevelColor = (riskLevel: string) => {
        switch (riskLevel) {
            case 'low':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'high':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'critical':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-600';
        if (score >= 60) return 'text-blue-600';
        if (score >= 40) return 'text-orange-600';
        return 'text-red-600';
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

    // ----------------------------------------------------------------------
    // MODIFIED FUNCTION: Navigates to the report detail page
    // ----------------------------------------------------------------------
    const handleViewReport = (report: ComplianceReport) => {
        const userId = report.userId;
        const reportId = report.id;

        if (userId && reportId) {
            // Navigate to the detail page: /admin/reports/:userId/:reportId
            navigate(`/reports/${userId}/${reportId}`);
        } else {
            console.error('Cannot view report detail: Missing User ID or Report ID.', report);
            // Fallback: Navigate to the general user profile if ID is missing for the report detail page
            const fallbackUserId = report.userId || report.id.split('_')[0];
            navigate(`/users/${fallbackUserId}`);
        }
    };
    // ----------------------------------------------------------------------

    // ----------------------------------------------------------------------
    // EXPORT FUNCTION: Generates and downloads Excel file with all report data
    // ----------------------------------------------------------------------
    const handleExportReports = async () => {
        // Show confirmation dialog before starting export
        const confirmResult = await Swal.fire({
            icon: 'question',
            title: 'Export Reports',
            showCancelButton: true,
            confirmButtonText: 'Export',
            cancelButtonText: 'Cancel',
            confirmButtonColor: '#1f2937',
            cancelButtonColor: '#6b7280',
            customClass: {
                popup: 'rounded-2xl',
                title: 'text-gray-900 font-bold',
                confirmButton: 'rounded-xl px-6 py-3 font-medium mr-2',
                cancelButton: 'rounded-xl px-6 py-3 font-medium'
            },
            buttonsStyling: false
        });

        if (!confirmResult.isConfirmed) {
            return; // User cancelled
        }

        try {
            console.log('Export button clicked - starting export process');
            setExportLoading(true);
            setError(null);

            // First, let's test with current reports data if API fails
            let allReports = reports;

            // Try to fetch all reports without filters for complete export
            try {
                console.log('Fetching reports from API...');
                const response = await apiRequest(ADMIN_API_ENDPOINTS.REPORTS);

                if (response.success && response.data.reports) {
                    allReports = response.data.reports;
                    console.log(`Fetched ${allReports.length} reports from API`);
                } else {
                    console.log('API response not successful, using current reports data');
                }
            } catch (apiError) {
                console.log('API fetch failed, using current reports data:', apiError);
            }

            if (!allReports || allReports.length === 0) {
                throw new Error('No reports data available for export');
            }

            console.log(`Preparing ${allReports.length} reports for export`);

            // Prepare data for Excel export
            const exportData = allReports.map((report: ComplianceReport) => ({
                'Report ID': report.id,
                'User ID': report.userId || 'N/A',
                'User Email': report.userEmail,
                'Startup Name': report.startupName,
                'Founder Name': report.founderName || 'N/A',
                'Overall Score': report.score,
                'Status': report.status,
                'Risk Level': report.riskLevel || 'N/A',
                'Completed Date': new Date(report.completedAt).toLocaleDateString('en-GB'),
                'Critical Issues': report.criticalIssues || 0,
                'Legal Score': report.categories?.legal || 0,
                'Financial Score': report.categories?.financial || 0,
                'Operational Score': report.categories?.operational || 0,
                'Regulatory Score': report.categories?.regulatory || 0,
                'Strengths Count': report.strengths?.length || 0,
                'Red Flags Count': report.redFlags?.length || 0,
                'Recommendations Count': report.recommendations?.length || 0,
                'Strengths': report.strengths?.join('; ') || 'None',
                'Red Flags': report.redFlags?.join('; ') || 'None',
                'Recommendations': report.recommendations?.join('; ') || 'None'
            }));

            console.log('Export data prepared, creating Excel file...');

            // Create workbook and worksheet
            const workbook = XLSX.utils.book_new();
            const worksheet = XLSX.utils.json_to_sheet(exportData);

            // Set column widths for better readability
            const columnWidths = [
                { wch: 25 }, // Report ID
                { wch: 25 }, // User ID
                { wch: 30 }, // User Email
                { wch: 25 }, // Startup Name
                { wch: 20 }, // Founder Name
                { wch: 12 }, // Overall Score
                { wch: 12 }, // Status
                { wch: 12 }, // Risk Level
                { wch: 15 }, // Completed Date
                { wch: 15 }, // Critical Issues
                { wch: 12 }, // Legal Score
                { wch: 15 }, // Financial Score
                { wch: 15 }, // Operational Score
                { wch: 15 }, // Regulatory Score
                { wch: 15 }, // Strengths Count
                { wch: 15 }, // Red Flags Count
                { wch: 20 }, // Recommendations Count
                { wch: 50 }, // Strengths
                { wch: 50 }, // Red Flags
                { wch: 50 }  // Recommendations
            ];
            worksheet['!cols'] = columnWidths;

            // Add worksheet to workbook
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Compliance Reports');

            // Generate filename with current date
            const currentDate = new Date().toISOString().split('T')[0];
            const filename = `compliance-reports-${currentDate}.xlsx`;

            console.log(`Writing Excel file: ${filename}`);

            // Write and download the file
            XLSX.writeFile(workbook, filename);

            console.log(`Successfully exported ${allReports.length} reports to ${filename}`);

            // Show success notification with SweetAlert2
            await Swal.fire({
                icon: 'success',
                title: 'Export Successful!',
                confirmButtonColor: '#1f2937',
                timer: 5000,
                timerProgressBar: true,
                customClass: {
                    popup: 'rounded-2xl',
                    title: 'text-gray-900 font-bold',
                    confirmButton: 'rounded-xl px-6 py-3 font-medium'
                },
                buttonsStyling: false
            });

        } catch (error) {
            console.error('Error exporting reports:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            setError(`Failed to export reports: ${errorMessage}`);

            // Show error notification with SweetAlert2
            await Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                html: `
                    <div class="text-center">
                        <p class="text-lg mb-2">Failed to export reports</p>
                        <p class="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">${errorMessage}</p>
                        <p class="text-sm text-gray-500 mt-2">Please try again or contact support if the issue persists.</p>
                    </div>
                `,
                confirmButtonText: 'Try Again',
                confirmButtonColor: '#1f2937',
                showCancelButton: true,
                cancelButtonText: 'Cancel',
                cancelButtonColor: '#6b7280',
                customClass: {
                    popup: 'rounded-2xl',
                    title: 'text-gray-900 font-bold',
                    confirmButton: 'rounded-xl px-6 py-3 font-medium mr-2',
                    cancelButton: 'rounded-xl px-6 py-3 font-medium'
                },
                buttonsStyling: false
            }).then((result) => {
                if (result.isConfirmed) {
                    // Retry the export
                    handleExportReports();
                }
            });
        } finally {
            setExportLoading(false);
        }
    };
    // ----------------------------------------------------------------------


    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <AdminNavigation />
                <div className="flex items-center mt-20 justify-center py-20">
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
                            <p className="text-gray-600 text-lg mb-2">
                                Monitor and analyze startup compliance assessments across the platform.
                            </p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{stats?.totalReports || 0} total reports</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <BarChart3 className="w-4 h-4" />
                                    <span>{stats?.averageScore || 0}% avg score</span>
                                </div>
                                <span>•</span>
                                <div className="flex items-center gap-1">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span>{stats?.criticalIssues || 0} critical issues</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={fetchReportsData}
                                className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300"
                            >
                                <TrendingUp className="h-4 w-4 mr-2" />
                                Refresh
                            </button>
                            <button
                                onClick={handleExportReports}
                                disabled={exportLoading || loading}
                                className="flex items-center px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {exportLoading ? (
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                ) : (
                                    <Download className="h-5 w-5 mr-2" />
                                )}
                                {exportLoading ? 'Exporting...' : 'Export Reports'}
                            </button>
                        </div>
                    </div>

                    {/* Stats Grid - (Content remains the same) */}
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

                    {/* Category Performance - (Content remains the same) */}
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

                    {/* Filters and Search - (Content remains the same) */}
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

                            <div className="text-sm text-gray-600 font-data">
                                Showing {filteredReports.length} of {reports.length} reports
                            </div>
                        </div>

                        {/* Enhanced Reports Display */}
                        <div className="space-y-4">
                            {filteredReports.map((report, index) => (
                                <div
                                    key={`${report.id}_${index}`}
                                    className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer"
                                    onClick={() => handleViewReport(report)}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                                                <Building className="h-6 w-6 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                                    {report.startupName}
                                                </h3>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <span>{report.userEmail}</span>
                                                    {report.founderName && (
                                                        <>
                                                            <span>•</span>
                                                            <span>{report.founderName}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            {report.riskLevel && (
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskLevelColor(report.riskLevel)}`}>
                                                    {report.riskLevel.toUpperCase()} RISK
                                                </span>
                                            )}
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                        <div className="flex items-center gap-2">
                                            <BarChart3 className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-500">Score:</span>
                                            <span className={`text-lg font-bold ${getScoreColor(report.score)}`}>
                                                {report.score}%
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-gray-500" />
                                            <span className="text-sm text-gray-500">Date:</span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {new Date(report.completedAt).toLocaleDateString('en-GB')}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                            <span className="text-sm text-gray-500">Strengths:</span>
                                            <span className="text-sm font-medium text-green-600">
                                                {report.strengths?.length || 0}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <AlertTriangle className="w-4 h-4 text-red-500" />
                                            <span className="text-sm text-gray-500">Issues:</span>
                                            <span className="text-sm font-medium text-red-600">
                                                {report.redFlags?.length || report.criticalIssues || 0}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                        <div className="flex items-center gap-4 text-sm text-gray-600">
                                            <span>Recommendations: {report.recommendations?.length || 0}</span>
                                            <span>•</span>
                                            <span>Report ID: {report.id.slice(-8)}</span>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewReport(report);
                                                }}
                                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm font-medium"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {filteredReports.length === 0 && (
                                <div className="text-center py-12">
                                    <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Found</h3>
                                    <p className="text-gray-600">No reports match your current search and filter criteria.</p>
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