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
        console.log('Navigating to report detail with data:', report);

        const userId = report.userId;
        const reportId = report.id;

        console.log('Extracted IDs:', { userId, reportId });

        if (userId && reportId) {
            const navigationPath = `/reports/${userId}/${reportId}`;
            console.log('Navigating to:', navigationPath);
            // Navigate to the detail page: /admin/reports/:userId/:reportId
            navigate(navigationPath);
        } else {
            console.error('Cannot view report detail: Missing User ID or Report ID.', report);
            // Fallback: Navigate to the general user profile if ID is missing for the report detail page
            const fallbackUserId = report.userId || report.id.split('_')[0];
            if (fallbackUserId) {
                console.log('Using fallback navigation to user profile:', fallbackUserId);
                navigate(`/users/${fallbackUserId}`);
            } else {
                console.error('No valid user ID found for fallback navigation');
                // Show an error message to the user
                alert('Unable to view report details. Missing required information.');
            }
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
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8 lg:mb-12 gap-6 lg:gap-0">
                        <div>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 lg:mb-4">
                                Compliance Reports
                            </h1>
                            <p className="text-gray-600 text-base lg:text-lg mb-3 lg:mb-2">
                                Monitor and analyze startup compliance assessments across the platform.
                            </p>
                        </div>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={fetchReportsData}
                                className="flex items-center justify-center px-4 py-2 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-300"
                            >
                                <TrendingUp className="h-4 w-4 mr-2" />
                                <span className="sm:inline">Refresh</span>
                            </button>
                            <button
                                onClick={handleExportReports}
                                disabled={exportLoading || loading}
                                className="flex items-center justify-center px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
                        {/* Total Reports */}
                        <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white">
                            <div className="flex items-center justify-between mb-4">
                                <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
                                <span className="text-xs font-medium tracking-widest uppercase text-gray-400 text-right leading-tight">
                                    TOTAL<br className="sm:hidden" /><span className="hidden sm:inline"> </span>REPORTS
                                </span>
                            </div>
                            <div className="text-3xl sm:text-4xl font-bold mb-2 font-numbers">{stats?.totalReports.toLocaleString()}</div>
                            <div className="text-sm text-gray-300">
                                +<span className="font-numbers">{stats?.completedThisMonth}</span> this month
                            </div>
                        </div>

                        {/* Average Score */}
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-4">
                                <Award className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900" />
                                <span className="text-xs font-medium tracking-widest uppercase text-gray-600 text-right leading-tight">
                                    AVG<br className="sm:hidden" /><span className="hidden sm:inline"> </span>SCORE
                                </span>
                            </div>
                            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-numbers">
                                {stats?.averageScore}%
                            </div>
                            <div className="text-sm text-gray-700">
                                Platform average
                            </div>
                        </div>

                        {/* Critical Issues */}
                        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-4">
                                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900" />
                                <span className="text-xs font-medium tracking-widest uppercase text-gray-600 text-right leading-tight">
                                    CRITICAL<br className="sm:hidden" /><span className="hidden sm:inline"> </span>ISSUES
                                </span>
                            </div>
                            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-numbers">
                                {stats?.criticalIssues}
                            </div>
                            <div className="text-sm text-gray-700">
                                Require attention
                            </div>
                        </div>

                        {/* Improvement Rate */}
                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8">
                            <div className="flex items-center justify-between mb-4">
                                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-gray-900" />
                                <span className="text-xs font-medium tracking-widest uppercase text-gray-600 text-right leading-tight">
                                    IMPROVEMENT
                                </span>
                            </div>
                            <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2 font-numbers">
                                +{stats?.improvementRate}%
                            </div>
                            <div className="text-sm text-gray-700">
                                Month over month
                            </div>
                        </div>
                    </div>

                    {/* Category Performance */}
                    <div className="mb-8 sm:mb-12">
                        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 sm:p-6 lg:p-8">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Category Performance</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                                {categoryStats.map((category, index) => (
                                    <div key={`${category.category}_${index}`} className="p-4 sm:p-6 bg-gray-50 rounded-2xl">
                                        <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{category.category}</h3>
                                        <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 font-numbers">
                                            {category.averageScore}%
                                        </div>
                                        <div className="flex items-center text-xs sm:text-sm">
                                            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
                                            <span className="text-green-600 font-medium font-numbers">+{category.improvement}%</span>
                                            <span className="text-gray-500 ml-1 hidden sm:inline">vs last month</span>
                                            <span className="text-gray-500 ml-1 sm:hidden">vs last</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Filters and Search */}
                        <div className="bg-white mt-8 sm:mt-12 rounded-3xl shadow-xl border border-gray-100 p-6 sm:p-8 lg:p-10 mb-8 sm:mb-12">
                            <div className="flex flex-col gap-6 mb-8">
                                <div className="flex flex-col sm:flex-row gap-4 w-full">
                                    {/* Search */}
                                    <div className="relative flex-1 sm:flex-none sm:w-80">
                                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search reports..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm font-lato shadow-sm"
                                        />
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                        {/* Status Filter */}
                                        <select
                                            value={filterStatus}
                                            onChange={(e) => setFilterStatus(e.target.value as any)}
                                            className="px-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm min-w-0 sm:min-w-[140px] font-lato shadow-sm"
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
                                            className="px-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm min-w-0 sm:min-w-[140px] font-lato shadow-sm"
                                        >
                                            <option value="7d">Last 7 days</option>
                                            <option value="30d">Last 30 days</option>
                                            <option value="90d">Last 90 days</option>
                                            <option value="all">All time</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <div className="text-sm text-gray-600 font-lato">
                                        Showing <span className="font-semibold text-gray-900">{filteredReports.length}</span> of <span className="font-semibold text-gray-900">{reports.length}</span> reports
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Reports Display */}
                            <div className="space-y-6">
                                {filteredReports.map((report, index) => (
                                    <div
                                        key={`${report.id}_${index}`}
                                        className="bg-gray-50 border border-gray-200 rounded-3xl p-6 sm:p-8 hover:shadow-xl hover:bg-white transition-all duration-300 cursor-pointer group"
                                        onClick={() => handleViewReport(report)}
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4 sm:gap-0">
                                            <div className="flex items-center gap-4 sm:gap-5">
                                                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gray-900 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                                    <Building className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate font-lato">
                                                        {report.startupName}
                                                    </h3>
                                                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm text-gray-600 font-lato">
                                                        <span className="truncate font-medium">{report.userEmail}</span>
                                                        {report.founderName && (
                                                            <>
                                                                <span className="hidden sm:inline text-gray-400">•</span>
                                                                <span className="truncate">{report.founderName}</span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3">
                                                {report.riskLevel && (
                                                    <span className={`px-3 sm:px-4 py-1.5 rounded-full text-xs font-bold border shadow-sm ${getRiskLevelColor(report.riskLevel)} font-lato`}>
                                                        <span className="hidden sm:inline">{report.riskLevel.toUpperCase()} RISK</span>
                                                        <span className="sm:hidden">{report.riskLevel.toUpperCase()}</span>
                                                    </span>
                                                )}
                                                <span className={`px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold shadow-sm ${getStatusBadge(report.status)} font-lato`}>
                                                    {report.status}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                                            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                                <BarChart3 className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                                <div>
                                                    <span className="text-xs text-gray-500 font-lato block">Score</span>
                                                    <span className={`text-lg font-bold ${getScoreColor(report.score)} font-lato`}>
                                                        {report.score}%
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                                <Calendar className="w-5 h-5 text-gray-500 flex-shrink-0" />
                                                <div>
                                                    <span className="text-xs text-gray-500 font-lato block">Date</span>
                                                    <span className="text-sm font-bold text-gray-900 font-lato">
                                                        {new Date(report.completedAt).toLocaleDateString('en-GB')}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                                                <div>
                                                    <span className="text-xs text-gray-500 font-lato block">Strengths</span>
                                                    <span className="text-lg font-bold text-green-600 font-lato">
                                                        {report.strengths?.length || 0}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                                <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                                <div>
                                                    <span className="text-xs text-gray-500 font-lato block">Issues</span>
                                                    <span className="text-lg font-bold text-red-600 font-lato">
                                                        {report.redFlags?.length || report.criticalIssues || 0}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t border-gray-200 gap-4 sm:gap-0">
                                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 font-lato">
                                                <span className="font-medium">Recommendations: <span className="text-gray-900 font-bold">{report.recommendations?.length || 0}</span></span>
                                                <span className="hidden sm:inline text-gray-400">•</span>
                                                <span className="font-medium">ID: <span className="text-gray-900 font-mono">{report.id.slice(-8)}</span></span>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewReport(report);
                                                    }}
                                                    className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300 text-sm font-bold w-full sm:w-auto justify-center shadow-lg font-lato"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    <span className="hidden sm:inline">View Details</span>
                                                    <span className="sm:hidden">View</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {filteredReports.length === 0 && (
                                    <div className="text-center py-16">
                                        <FileText className="h-20 w-20 text-gray-300 mx-auto mb-6" />
                                        <h3 className="text-2xl font-bold text-gray-900 mb-3 font-lato">No Reports Found</h3>
                                        <p className="text-gray-600 font-lato text-lg">No reports match your current search and filter criteria.</p>
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

export default ReportsPage;