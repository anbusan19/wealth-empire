import {
    AlertTriangle,
    ArrowLeft,
    Award,
    Bookmark,
    Building,
    CheckCircle,
    ClipboardList,
    FileText,
    Globe,
    Loader2,
    Mail,
    Phone,
    TrendingUp,
    Users,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNavigation from '../components/AdminNavigation';
import { ADMIN_API_ENDPOINTS, apiRequest } from '../config/api';

// --- Type Definitions based on MongoDB structure ---

// Health Check Questions mapping (from QuestionFlow.tsx)
const healthCheckQuestions = {
    1: 'Is your company legally incorporated?',
    2: 'Have you filed your MCA annual returns (MGT-7 & AOC-4) for the last financial year?',
    3: 'Have you done DIN KYC for all directors for the last financial year?',
    4: 'Is your business registered under GST?',
    5: 'Have you filed all GST returns (GSTR-1, GSTR-3B) on time in the last 6 months?',
    6: 'Have you filed your Income Tax Return (ITR) for the last financial year?',
    7: 'Have you filed a trademark for your business name and/or logo?',
    8: 'If your business has unique products/technology, have you filed for patents?',
    9: 'Do you have any active copyright registrations (software, designs, content)?',
    10: 'Do you have ISO certification (e.g., ISO 9001, ISO 27001) or industry-specific certifications?',
    11: 'If operating in regulated sectors (F&B, Pharma, etc.), do you have mandatory licenses (FSSAI, Drug License, etc.)?',
    12: 'Do you maintain proper bookkeeping & audited financial statements?',
    13: 'Do you have outstanding loans or liabilities that are overdue?',
    14: 'Have you conducted tax planning to optimize deductions and reduce financial risks?',
    15: 'Do you have an external compliance officer for the regular compliance audit process?'
};

// Question categories mapping
const questionCategories = {
    1: 'Company & Legal Structure',
    2: 'Company & Legal Structure',
    3: 'Company & Legal Structure',
    4: 'Taxation & GST',
    5: 'Taxation & GST',
    6: 'Taxation & GST',
    7: 'Intellectual Property (IP)',
    8: 'Intellectual Property (IP)',
    9: 'Intellectual Property (IP)',
    10: 'Certifications & Industry Licenses',
    11: 'Certifications & Industry Licenses',
    12: 'Financial Health & Risk',
    13: 'Financial Health & Risk',
    14: 'Financial Health & Risk',
    15: 'Financial Health & Risk'
};

interface HealthCheckResult {
    _id: string;
    assessmentDate: string;
    answers: { [key: string]: string };
    score: number;
    recommendations: string[];
    strengths?: string[]; // Added optional based on example data
    redFlags?: string[]; // Added optional based on example data
    risks?: string[]; // Added optional based on example data
    followUpAnswers: { [key: string]: string };
}

interface UserDetails {
    _id: string;
    email: string;
    startupName: string;
    founderName: string;
    city: string;
    state: string;
    country: string;
    website?: string;
    contactNumber: string;
    subscription: { type: 'free' | 'premium' | 'enterprise' };
    healthCheckResults: HealthCheckResult[];
    memberSince: string;
}

interface ReportDetailsState {
    user: Omit<UserDetails, 'healthCheckResults'> | null;
    report: HealthCheckResult | null;
}



// Helper to get score badge style
const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
};

// Theme configurations for analysis cards
const themeConfig = {
    green: {
        bg: 'bg-green-50',
        border: 'border-green-200',
        text: 'text-green-800',
        iconColor: 'text-green-600',
        headerBg: 'bg-green-100'
    },
    red: {
        bg: 'bg-red-50',
        border: 'border-red-200',
        text: 'text-red-800',
        iconColor: 'text-red-600',
        headerBg: 'bg-red-100'
    },
    orange: {
        bg: 'bg-orange-50',
        border: 'border-orange-200',
        text: 'text-orange-800',
        iconColor: 'text-orange-600',
        headerBg: 'bg-orange-100'
    },
    blue: {
        bg: 'bg-blue-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        iconColor: 'text-blue-600',
        headerBg: 'bg-blue-100'
    }
};

// Compact Analysis Card Component
const AnalysisCard: React.FC<{
    title: string;
    icon: React.ElementType;
    count: number;
    items: string[];
    theme: keyof typeof themeConfig;
}> = ({ title, icon: Icon, count, items, theme }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const config = themeConfig[theme];

    return (
        <div className={`${config.bg} ${config.border} border rounded-xl overflow-hidden`}>
            {/* Header */}
            <div
                className={`${config.headerBg} px-4 py-3 cursor-pointer hover:opacity-80 transition-opacity`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Icon className={`h-5 w-5 ${config.iconColor}`} />
                        <h3 className={`font-semibold ${config.text} font-lato`}>
                            {title} ({count})
                        </h3>
                    </div>
                    {isExpanded ? (
                        <ChevronUp className={`h-4 w-4 ${config.iconColor}`} />
                    ) : (
                        <ChevronDown className={`h-4 w-4 ${config.iconColor}`} />
                    )}
                </div>
            </div>

            {/* Content */}
            {isExpanded && (
                <div className="p-4">
                    <div className="space-y-2">
                        {items.map((item, index) => (
                            <div key={index} className="flex items-start gap-2">
                                <div className={`w-1.5 h-1.5 rounded-full ${config.iconColor.replace('text-', 'bg-')} mt-2 flex-shrink-0`} />
                                <p className={`text-sm ${config.text} font-lato leading-relaxed`}>
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

const ReportDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    // Assuming the route is /admin/reports/:userId/:reportId
    const { userId, reportId } = useParams<{ userId: string, reportId: string }>();

    const [data, setData] = useState<ReportDetailsState>({ user: null, report: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('ReportDetailPage mounted with params:', { userId, reportId });

        if (!userId || !reportId) {
            console.error('Missing parameters:', { userId, reportId });
            setError('Missing User ID or Report ID in URL.');
            setLoading(false);
            return;
        }
        fetchReportData();
    }, [userId, reportId]);

    const fetchReportData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Use the dedicated REPORT_DETAIL endpoint
            const reportApiUrl = ADMIN_API_ENDPOINTS.REPORT_DETAIL(userId!, reportId!);
            const response = await apiRequest(reportApiUrl);

            if (response.success && response.data) {
                // The API should return both user and report data
                const { user, report } = response.data;

                if (user && report) {
                    setData({
                        user: user,
                        report: report
                    });
                } else {
                    setError('Report or user data not found.');
                }
            } else {
                // If the dedicated endpoint doesn't exist, fall back to the old method
                console.log('Dedicated endpoint failed, trying fallback method...');
                await fetchReportDataFallback();
            }
        } catch (error) {
            console.error('Error fetching report details:', error);
            // Try fallback method if main endpoint fails
            try {
                await fetchReportDataFallback();
            } catch (fallbackError) {
                console.error('Fallback method also failed:', fallbackError);
                // If both methods fail, try mock data for development
                if (process.env.NODE_ENV === 'development') {
                    console.log('Using mock data for development...');
                    setMockData();
                } else {
                    setError('Unable to load report data. Please try again later.');
                }
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchReportDataFallback = async () => {
        try {
            console.log('Trying fallback method with USER_DETAIL endpoint...');

            // Fallback: Fetch User Details (which includes healthCheckResults)
            const userApiUrl = ADMIN_API_ENDPOINTS.USER_DETAIL(userId!);
            console.log('Fetching from URL:', userApiUrl);

            const response = await apiRequest(userApiUrl);
            console.log('Fallback API response:', response);

            if (response.success && response.data) {
                // Handle different possible response structures
                const userData = response.data.user || response.data;
                console.log('User data structure:', userData);

                if (userData && userData.healthCheckResults && Array.isArray(userData.healthCheckResults)) {
                    console.log('Health check results found:', userData.healthCheckResults.length);

                    // Find the specific report
                    const report = userData.healthCheckResults.find((r: any) => {
                        console.log('Checking report:', r._id || r.id, 'against', reportId);
                        return r._id === reportId || r.id === reportId;
                    });

                    if (report) {
                        console.log('Report found:', report);
                        const userDataForState = { ...userData };
                        delete (userDataForState as any).healthCheckResults;

                        setData({
                            user: userDataForState,
                            report: report
                        });
                    } else {
                        console.error('Report not found in health check results');
                        setError(`Report with ID "${reportId}" not found for this user. Available reports: ${userData.healthCheckResults.map((r: any) => r._id || r.id).join(', ')}`);
                    }
                } else {
                    console.error('Invalid user data structure:', userData);
                    setError('User data not found or has invalid format. The user may not have any health check results.');
                }
            } else {
                console.error('API response not successful:', response);
                setError('Failed to load user data. The API endpoint may not be implemented yet or the user does not exist.');
            }
        } catch (error) {
            console.error('Error in fallback method:', error);
            setError(`Failed to load report data: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your connection or try again later.`);
        }
    };

    const setMockData = () => {
        console.log('Setting mock data for development...');
        const mockUser = {
            _id: userId!,
            email: 'demo@example.com',
            startupName: 'Demo Startup',
            founderName: 'John Doe',
            city: 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            website: 'https://demo-startup.com',
            contactNumber: '+91 9876543210',
            subscription: { type: 'premium' as const },
            memberSince: new Date().toISOString()
        };

        const mockReport = {
            _id: reportId!,
            assessmentDate: new Date().toISOString(),
            score: 75,
            answers: {
                '1': 'Yes',
                '2': 'No',
                '3': 'Partially',
                '4': 'Yes',
                '5': 'No'
            },
            followUpAnswers: {
                '2': 'We are working on implementing this feature',
                '5': 'This is planned for next quarter'
            },
            // Dedicated arrays for better organization
            strengths: [
                'Good financial planning and budgeting processes in place',
                'Strong team structure with clear roles and responsibilities',
                'Proper documentation of business processes',
                'Active compliance monitoring system'
            ],
            redFlags: [
                'Missing compliance documentation for data protection regulations',
                'No trademark registration for business name and logo',
                'Outstanding GST returns not filed for last 3 months',
                'No formal employment contracts in place'
            ],
            risks: [
                'Insufficient backup systems for critical business data',
                'No formal board governance structure established',
                'Lack of external compliance audit process',
                'Potential penalty exposure due to delayed filings'
            ],
            recommendations: [
                'Implement regular security audits and assessments',
                'Establish formal board governance structure',
                'Set up automated backup systems for data protection',
                'Create comprehensive employee handbook',
                'Develop disaster recovery plan'
            ]
        };

        setData({
            user: mockUser,
            report: mockReport
        });
    };

    const { user, report } = data;

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <AdminNavigation />
                <div className="flex items-center mt-20 justify-center py-20">
                    <div className="text-center">
                        <Loader2 className="h-8 w-8 animate-spin text-gray-900 mx-auto mb-4" />
                        <p className="text-gray-600">Loading report details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <AdminNavigation />
                <div className="flex items-center mt-20 justify-center py-20 px-4">
                    <div className="text-center max-w-md">
                        <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-6" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-3 font-lato">Unable to Load Report</h2>
                        <p className="text-gray-600 mb-6 text-sm leading-relaxed font-lato">{error}</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={fetchReportData}
                                className="px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300"
                            >
                                Try Again
                            </button>
                            <button
                                onClick={() => navigate('/reports')}
                                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-all duration-300"
                            >
                                Back to Reports
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user || !report) return null; // Should be caught by error handling, but for safety

    // Calculate counts from both dedicated arrays and recommendations array
    const counts = {
        'Strength': (report.strengths?.length || 0) + report.recommendations.filter(rec => rec.toLowerCase().startsWith('strength:')).length,
        'Red Flag': (report.redFlags?.length || 0) + report.recommendations.filter(rec => rec.toLowerCase().startsWith('red flag:')).length,
        'Risk': (report.risks?.length || 0) + report.recommendations.filter(rec => rec.toLowerCase().startsWith('risk:')).length,
        'Recommendation': report.recommendations.filter(rec => !rec.toLowerCase().match(/^(strength|red flag|risk):/)).length
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNavigation />

            <section className="relative pt-20 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-8 lg:mb-10">
                        <button
                            onClick={() => navigate('/reports')}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4 p-2 -ml-2 rounded-lg hover:bg-gray-100"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            <span className="text-sm sm:text-base">Back to All Reports</span>
                        </button>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-gray-900 mb-2 break-words">
                            {user.startupName} Compliance Report
                        </h1>
                        <p className="text-gray-600 text-sm sm:text-base lg:text-lg font-lato">
                            Assessment completed on{' '}
                            <span className="font-semibold text-gray-800 font-lato">
                                {new Date(report.assessmentDate).toLocaleDateString('en-GB')}
                            </span>
                        </p>
                    </div>

                    {/* Score and Overview Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                        {/* Score Card */}
                        <div className="lg:col-span-1 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 flex flex-col items-center justify-center">
                            <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-gray-900 mb-3 sm:mb-4" />
                            <p className="text-xs sm:text-sm font-medium tracking-widest uppercase text-gray-600 mb-2 text-center">
                                Final Compliance Score
                            </p>
                            <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-3 sm:mb-4 font-lato">
                                {report.score}%
                            </div>
                            <span className={`px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-sm sm:text-md font-bold ${getScoreBadge(report.score)} border font-lato`}>
                                {report.score >= 80 ? 'Excellent' : report.score >= 60 ? 'Good' : 'Critical'}
                            </span>
                        </div>

                        {/* Recommendation Stats */}
                        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Assessment Summary</h2>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                                <SummaryStat icon={TrendingUp} title="Strengths" count={counts['Strength'] || 0} color="text-green-600" />
                                <SummaryStat icon={AlertTriangle} title="Risks" count={counts['Risk'] || 0} color="text-orange-600" />
                                <SummaryStat icon={Bookmark} title="Red Flags" count={counts['Red Flag'] || 0} color="text-red-600" />
                                <SummaryStat icon={ClipboardList} title="Other Recs" count={counts['Recommendation'] || 0} color="text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* User & Report Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
                        {/* User Profile */}
                        <div className="lg:col-span-1 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                                <Users className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-gray-700" />
                                <span className="text-base sm:text-2xl">Startup Profile</span>
                            </h2>
                            <div className="space-y-3 sm:space-y-4">
                                <DetailItem icon={Users} label="Founder" value={user.founderName} />
                                <DetailItem icon={Building} label="Startup Name" value={user.startupName} />
                                <DetailItem icon={Mail} label="Email" value={user.email} isLink={`mailto:${user.email}`} />
                                <DetailItem icon={Phone} label="Contact" value={user.contactNumber} isLink={`tel:${user.contactNumber}`} />
                                <DetailItem icon={Globe} label="Website" value={user.website || 'N/A'} isLink={user.website} />
                                <DetailItem icon={Bookmark} label="Subscription" value={user.subscription.type.toUpperCase()} badgeColor={user.subscription.type === 'premium' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'} />
                            </div>
                        </div>

                        {/* Recommendations */}
                        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100">
                            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                                <ClipboardList className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-gray-700" />
                                <span className="text-base sm:text-2xl">Assessment Analysis</span>
                            </h2>

                            {/* Compact Assessment Analysis */}
                            <div className="space-y-4">
                                {/* Analysis Grid - Compact Cards */}
                                <div className="grid grid-cols-1 gap-4">
                                    {/* Strengths Card */}
                                    {((report.strengths && report.strengths.length > 0) || report.recommendations.filter(rec => rec.toLowerCase().startsWith('strength:')).length > 0) && (
                                        <AnalysisCard
                                            title="Strengths"
                                            icon={Award}
                                            count={(report.strengths?.length || 0) + report.recommendations.filter(rec => rec.toLowerCase().startsWith('strength:')).length}
                                            items={[
                                                ...(report.strengths || []),
                                                ...report.recommendations
                                                    .filter(rec => rec.toLowerCase().startsWith('strength:'))
                                                    .map(rec => rec.replace(/^strength:\s*/i, '').trim())
                                            ]}
                                            theme="green"
                                        />
                                    )}

                                    {/* Red Flags Card */}
                                    {((report.redFlags && report.redFlags.length > 0) || report.recommendations.filter(rec => rec.toLowerCase().startsWith('red flag:')).length > 0) && (
                                        <AnalysisCard
                                            title="Red Flags"
                                            icon={AlertTriangle}
                                            count={(report.redFlags?.length || 0) + report.recommendations.filter(rec => rec.toLowerCase().startsWith('red flag:')).length}
                                            items={[
                                                ...(report.redFlags || []),
                                                ...report.recommendations
                                                    .filter(rec => rec.toLowerCase().startsWith('red flag:'))
                                                    .map(rec => rec.replace(/^red flag:\s*/i, '').trim())
                                            ]}
                                            theme="red"
                                        />
                                    )}

                                    {/* Risks Card */}
                                    {((report.risks && report.risks.length > 0) || report.recommendations.filter(rec => rec.toLowerCase().startsWith('risk:')).length > 0) && (
                                        <AnalysisCard
                                            title="Risks"
                                            icon={AlertTriangle}
                                            count={(report.risks?.length || 0) + report.recommendations.filter(rec => rec.toLowerCase().startsWith('risk:')).length}
                                            items={[
                                                ...(report.risks || []),
                                                ...report.recommendations
                                                    .filter(rec => rec.toLowerCase().startsWith('risk:'))
                                                    .map(rec => rec.replace(/^risk:\s*/i, '').trim())
                                            ]}
                                            theme="orange"
                                        />
                                    )}

                                    {/* Recommendations Card */}
                                    {report.recommendations.filter(rec => !rec.toLowerCase().match(/^(strength|red flag|risk):/)).length > 0 && (
                                        <AnalysisCard
                                            title="Recommendations"
                                            icon={ClipboardList}
                                            count={report.recommendations.filter(rec => !rec.toLowerCase().match(/^(strength|red flag|risk):/)).length}
                                            items={report.recommendations
                                                .filter(rec => !rec.toLowerCase().match(/^(strength|red flag|risk):/))
                                                .map(rec => rec.replace(/^recommendation:\s*/i, '').trim())
                                            }
                                            theme="blue"
                                        />
                                    )}
                                </div>

                                {/* No data message */}
                                {!report.strengths?.length &&
                                    !report.redFlags?.length &&
                                    !report.risks?.length &&
                                    report.recommendations.length === 0 && (
                                        <div className="text-center py-12">
                                            <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                            <p className="text-gray-500 text-lg font-semibold mb-2">No Analysis Data</p>
                                            <p className="text-gray-400 text-sm font-lato">No assessment analysis data available for this report.</p>
                                        </div>
                                    )}
                            </div>
                        </div>
                    </div>

                    {/* Assessment Answers */}
                    <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 mb-8 sm:mb-12">
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                            <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 mr-2 sm:mr-3 text-gray-700" />
                            <span className="text-base sm:text-2xl">Assessment Responses</span>
                        </h2>
                        <div className="space-y-4 sm:space-y-6">
                            {Object.entries(report.answers).map(([key, value]) => {
                                const questionId = parseInt(key);
                                const question = healthCheckQuestions[questionId as keyof typeof healthCheckQuestions];
                                const category = questionCategories[questionId as keyof typeof questionCategories];

                                return (
                                    <div key={key} className="p-4 sm:p-6 bg-gray-50 rounded-xl border border-gray-100">
                                        {/* Category Badge */}
                                        {category && (
                                            <div className="mb-3">
                                                <span className="inline-block px-3 py-1 bg-gray-200 text-gray-700 text-xs font-semibold rounded-full font-lato">
                                                    {category}
                                                </span>
                                            </div>
                                        )}

                                        {/* Question */}
                                        <div className="mb-3">
                                            <h3 className="text-sm sm:text-base font-medium text-gray-900 mb-2 font-lato leading-relaxed">
                                                {question || `Question ${key}`}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-500 font-lato">Answer:</span>
                                                <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium font-lato ${value === 'Yes' ? 'bg-green-100 text-green-800' :
                                                    value === 'No' ? 'bg-red-100 text-red-800' :
                                                        value === 'Not Sure' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-blue-100 text-blue-800'
                                                    }`}>
                                                    {value}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Follow-up Answer */}
                                        {report.followUpAnswers[key] && report.followUpAnswers[key].trim() !== '' && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                                <div className="flex items-start gap-2">
                                                    <span className="text-xs text-gray-500 font-lato mt-1">Follow-up:</span>
                                                    <span className="text-sm text-gray-700 font-lato break-words flex-1">
                                                        {report.followUpAnswers[key]}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Reusable component for summary statistics
const SummaryStat: React.FC<{ icon: React.ElementType, title: string, count: number, color: string }> = ({ icon: Icon, title, count, color }) => (
    <div className="p-3 sm:p-4 bg-gray-50 rounded-2xl flex items-center space-x-3 sm:space-x-4">
        <Icon className={`h-6 w-6 sm:h-8 sm:w-8 ${color} p-1 sm:p-1.5 rounded-full bg-white shadow-sm flex-shrink-0`} />
        <div className="min-w-0 flex-1">
            <div className="text-xl sm:text-2xl font-bold text-gray-900 font-lato">{count}</div>
            <div className="text-xs sm:text-sm text-gray-500 truncate font-lato">{title}</div>
        </div>
    </div>
);

// Reusable component for profile details
const DetailItem: React.FC<{ icon: React.ElementType, label: string, value: string, isLink?: string, badgeColor?: string }> = ({ icon: Icon, label, value, isLink, badgeColor }) => (
    <div className="flex items-start">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-2 sm:mr-3 mt-1 flex-shrink-0" />
        <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-medium text-gray-500 font-lato">{label}</div>
            {badgeColor ? (
                <span className={`mt-1 px-2 sm:px-3 py-1 rounded-full text-xs font-bold ${badgeColor} inline-block font-lato`}>
                    {value}
                </span>
            ) : isLink ? (
                <a
                    href={isLink.startsWith('http') || isLink.startsWith('mailto') || isLink.startsWith('tel') ? isLink : `https://${isLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors break-all text-sm sm:text-base font-lato"
                >
                    {value}
                </a>
            ) : (
                <div className="font-semibold text-gray-900 break-words text-sm sm:text-base font-lato">{value}</div>
            )}
        </div>
    </div>
);

export default ReportDetailsPage;