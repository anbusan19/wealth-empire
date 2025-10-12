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
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AdminNavigation from '../components/AdminNavigation';
import { ADMIN_API_ENDPOINTS, apiRequest } from '../config/api';

// --- Type Definitions based on MongoDB structure ---

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

// Helper to get recommendation type
const getRecommendationType = (rec: string) => {
    if (rec.toLowerCase().startsWith('strength:')) return { type: 'Strength', icon: Award, color: 'text-green-600' };
    if (rec.toLowerCase().startsWith('red flag:')) return { type: 'Red Flag', icon: AlertTriangle, color: 'text-red-600' };
    if (rec.toLowerCase().startsWith('risk:')) return { type: 'Risk', icon: AlertTriangle, color: 'text-orange-600' };
    return { type: 'Recommendation', icon: ClipboardList, color: 'text-blue-600' };
};

// Helper to get score badge style
const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
};

const ReportDetailsPage: React.FC = () => {
    const navigate = useNavigate();
    // Assuming the route is /admin/reports/:userId/:reportId
    const { userId, reportId } = useParams<{ userId: string, reportId: string }>();

    const [data, setData] = useState<ReportDetailsState>({ user: null, report: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId || !reportId) {
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

            // 1. Fetch User Details (which includes healthCheckResults)
            const userApiUrl = ADMIN_API_ENDPOINTS.USER_DETAIL(userId!);
            const response = await apiRequest(userApiUrl);

            if (response.success && response.data.user) {
                const user: UserDetails = response.data.user;

                // 2. Find the specific report
                const report = user.healthCheckResults.find(r => r._id === reportId);

                if (report) {
                    const userDataForState = { ...user };
                    delete (userDataForState as any).healthCheckResults;

                    setData({
                        user: userDataForState,
                        report: report
                    });
                } else {
                    setError('Report not found for this user.');
                }
            } else {
                setError(response.message || 'Will be updated soon');
            }
        } catch (error) {
            console.error('Error fetching report details:', error);
            setError('Failed to load report data. Please check your connection.');
        } finally {
            setLoading(false);
        }
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
                <div className="flex items-center mt-20 justify-center py-20">
                    <div className="text-center">
                        <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-4" />
                        <p className="text-black-600 mb-4">{error}</p>
                        <button
                            onClick={fetchReportData}
                            className="px-6 py-3 bg-gray-900 text-white rounded-2xl hover:bg-gray-800 transition-all duration-300"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!user || !report) return null; // Should be caught by error handling, but for safety

    // Simple analysis of recommendations to get counts
    const counts = report.recommendations.reduce((acc, rec) => {
        const type = getRecommendationType(rec).type;
        acc[type] = (acc[type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNavigation />

            <section className="relative pt-20 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="mb-10">
                        <button
                            onClick={() => navigate('/reports')}
                            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-4"
                        >
                            <ArrowLeft className="h-5 w-5 mr-2" />
                            Back to All Reports
                        </button>
                        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-2">
                            {user.startupName} Compliance Report
                        </h1>
                        <p className="text-gray-600 text-lg">
                            Assessment completed on{' '}
                            <span className="font-semibold text-gray-800">
                                {new Date(report.assessmentDate).toLocaleDateString('en-GB')}
                            </span>
                        </p>
                    </div>

                    {/* Score and Overview Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                        {/* Score Card */}
                        <div className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col items-center justify-center">
                            <FileText className="h-10 w-10 text-gray-900 mb-4" />
                            <p className="text-sm font-medium tracking-widest uppercase text-gray-600 mb-2">
                                Final Compliance Score
                            </p>
                            <div className="text-6xl font-extrabold text-gray-900 mb-4">
                                {report.score}%
                            </div>
                            <span className={`px-4 py-1.5 rounded-full text-md font-bold ${getScoreBadge(report.score)} border`}>
                                {report.score >= 80 ? 'Excellent' : report.score >= 60 ? 'Good' : 'Critical'}
                            </span>
                        </div>

                        {/* Recommendation Stats */}
                        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Assessment Summary</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <SummaryStat icon={TrendingUp} title="Strengths" count={counts['Strength'] || 0} color="text-green-600" />
                                <SummaryStat icon={AlertTriangle} title="Risks" count={counts['Risk'] || 0} color="text-orange-600" />
                                <SummaryStat icon={Bookmark} title="Red Flags" count={counts['Red Flag'] || 0} color="text-red-600" />
                                <SummaryStat icon={ClipboardList} title="Other Recs" count={counts['Recommendation'] || 0} color="text-blue-600" />
                            </div>
                        </div>
                    </div>

                    {/* User & Report Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                        {/* User Profile */}
                        <div className="lg:col-span-1 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <Users className="h-6 w-6 mr-3 text-gray-700" />
                                Startup Profile
                            </h2>
                            <DetailItem icon={Users} label="Founder" value={user.founderName} />
                            <DetailItem icon={Building} label="Startup Name" value={user.startupName} />
                            <DetailItem icon={Mail} label="Email" value={user.email} isLink={`mailto:${user.email}`} />
                            <DetailItem icon={Phone} label="Contact" value={user.contactNumber} isLink={`tel:${user.contactNumber}`} />
                            <DetailItem icon={Globe} label="Website" value={user.website || 'N/A'} isLink={user.website} />
                            <DetailItem icon={Bookmark} label="Subscription" value={user.subscription.type.toUpperCase()} badgeColor={user.subscription.type === 'premium' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'} />
                        </div>

                        {/* Recommendations */}
                        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <ClipboardList className="h-6 w-6 mr-3 text-gray-700" />
                                Detailed Recommendations
                            </h2>
                            <div className="space-y-4">
                                {report.recommendations.length > 0 ? (
                                    report.recommendations.map((rec, index) => {
                                        const { type, icon: Icon, color } = getRecommendationType(rec);
                                        const content = rec.replace(/^(Strength|Red Flag|Risk): /, '').trim();
                                        return (
                                            <div key={index} className="flex items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                                                <Icon className={`h-5 w-5 mt-1 mr-3 ${color} flex-shrink-0`} />
                                                <div>
                                                    <span className={`font-semibold text-sm ${color}`}>
                                                        {type}
                                                    </span>
                                                    <p className="text-gray-700 mt-1">{content}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 italic">No specific recommendations provided for this assessment.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Assessment Answers */}
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 mb-12">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                            <CheckCircle className="h-6 w-6 mr-3 text-gray-700" />
                            Raw Assessment Data
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {Object.entries(report.answers).map(([key, value]) => (
                                <div key={key} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <div className="text-sm font-medium text-gray-500 mb-1">Question #{key}</div>
                                    <div className="font-semibold text-gray-900">{value}</div>
                                    {report.followUpAnswers[key] && report.followUpAnswers[key].trim() !== '' && (
                                        <div className="mt-2 text-sm text-gray-600 border-t border-gray-200 pt-2">
                                            <span className="font-medium text-gray-700">Follow-up:</span> {report.followUpAnswers[key]}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

// Reusable component for summary statistics
const SummaryStat: React.FC<{ icon: React.ElementType, title: string, count: number, color: string }> = ({ icon: Icon, title, count, color }) => (
    <div className="p-4 bg-gray-50 rounded-2xl flex items-center space-x-4">
        <Icon className={`h-8 w-8 ${color} p-1.5 rounded-full bg-white shadow-sm`} />
        <div>
            <div className="text-2xl font-bold text-gray-900">{count}</div>
            <div className="text-sm text-gray-500">{title}</div>
        </div>
    </div>
);

// Reusable component for profile details
const DetailItem: React.FC<{ icon: React.ElementType, label: string, value: string, isLink?: string, badgeColor?: string }> = ({ icon: Icon, label, value, isLink, badgeColor }) => (
    <div className="flex items-start mb-4">
        <Icon className="h-5 w-5 text-gray-500 mr-3 mt-1 flex-shrink-0" />
        <div>
            <div className="text-sm font-medium text-gray-500">{label}</div>
            {badgeColor ? (
                <span className={`mt-1 px-3 py-1 rounded-full text-xs font-bold ${badgeColor}`}>
                    {value}
                </span>
            ) : isLink ? (
                <a
                    href={isLink.startsWith('http') || isLink.startsWith('mailto') || isLink.startsWith('tel') ? isLink : `https://${isLink}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors break-words"
                >
                    {value}
                </a>
            ) : (
                <div className="font-semibold text-gray-900 break-words">{value}</div>
            )}
        </div>
    </div>
);

export default ReportDetailsPage;