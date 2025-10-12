import React from 'react';
import { Download, CheckCircle, AlertTriangle, TrendingUp, Loader2, Share2 } from 'lucide-react';
import generatePDF from '../utils/pdfGenerator';
import { calculateScores } from '../utils/scoringSystem';
import { useUserProfile } from '../hooks/useUserProfile';

interface ResultsDashboardProps {
  companyData?: {
    data: {
      company_info: Array<{
        Attribute: string;
        Value: string;
      }>;
    };
  } | null;
  answers: Record<number, string>;
  followUpAnswers: Record<number, string>;
}

export default function ResultsDashboard({ companyData, answers, followUpAnswers }: ResultsDashboardProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);
  const { profile } = useUserProfile();

  // Calculate dynamic scores based on user answers
  const complianceData = React.useMemo(() => {
    return calculateScores(answers, followUpAnswers);
  }, [answers, followUpAnswers]);

  const generatePDFReport = async () => {
    try {
      setIsGeneratingPDF(true);

      // Use user's startup name from profile, fallback to MCA data, then default
      const companyName = profile?.startupName || 
        companyData?.data?.company_info?.find(
          info => info.Attribute === 'Company Name'
        )?.Value || 
        'Your Company Name';

      const reportData = {
        companyName,
        reportDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        overallScore: complianceData.overallScore,
        categoryScores: complianceData.categoryScores,
        strengths: complianceData.strengths,
        redFlags: complianceData.redFlags,
        riskForecast: complianceData.riskForecast
      };

      await generatePDF(reportData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const shareReport = async () => {
    const shareData = {
      title: 'My Compliance Health Report',
      text: `I just completed a compliance health check and scored ${complianceData.overallScore}/100! Check out Wealth Empire's compliance assessment tool.`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(
          `${shareData.text}\n\n${shareData.url}`
        );
        alert('Report details copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(
          `I just completed a compliance health check and scored ${complianceData.overallScore}/100! Check out Wealth Empire's compliance assessment: ${window.location.href}`
        );
        alert('Report details copied to clipboard!');
      } catch (clipboardError) {
        console.error('Clipboard error:', clipboardError);
        alert('Unable to share. Please copy the URL manually.');
      }
    }
  };

  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <div className="animate-fade-in">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              Compliance
              <br />
              <span className="text-gray-400">Health Report</span>
            </h2>
            <p className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-4">
              YOUR RESULTS
            </p>
            {/* Results saved indicator */}
            <div className="flex items-center justify-center gap-2 text-sm text-green-600 mb-4">
              <CheckCircle size={16} />
              Results saved to your dashboard
            </div>
          </div>

        </div>

        {/* Overall Score and PDF Download */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between lg:col-span-1">
            <div>
              <div className="text-xs font-medium tracking-widest uppercase text-gray-400 mb-6">
                OVERALL COMPLIANCE SCORE
              </div>
              <div className="text-6xl sm:text-7xl font-bold mb-2">{complianceData.overallScore}</div>
              <div className="text-lg text-gray-400">out of 100</div>

              {/* Score Status Badge */}
              <div className="mt-4">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${complianceData.overallScore >= 80
                  ? 'bg-green-100 text-green-800'
                  : complianceData.overallScore >= 60
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {complianceData.overallScore >= 80
                    ? 'EXCELLENT'
                    : complianceData.overallScore >= 60
                      ? 'GOOD'
                      : 'NEEDS IMPROVEMENT'}
                </span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <button
                onClick={generatePDFReport}
                disabled={isGeneratingPDF}
                className="flex items-center justify-center gap-2 bg-white text-gray-900 px-4 py-3 rounded-full hover:bg-gray-100 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex-1"
              >
                {isGeneratingPDF ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download size={18} />
                    Download
                  </>
                )}
              </button>

              <button
                onClick={shareReport}
                className="flex items-center justify-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-3 rounded-full hover:bg-white/30 transition-all text-sm font-medium flex-1"
              >
                <Share2 size={18} />
                Share
              </button>
            </div>
          </div>

          {/* Category Scores */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {complianceData.categoryScores.map((category) => (
              <div
                key={category.category}
                className={`${category.bgColor} rounded-xl p-4 sm:p-6 text-center flex flex-col justify-center items-center min-h-[120px] sm:min-h-[140px]`}
              >
                <div className="text-xs font-medium tracking-widest uppercase text-gray-600 mb-3 leading-tight">
                  {category.category}
                </div>
                <div className={`text-3xl sm:text-4xl font-bold ${category.color} mb-3 leading-none`}>
                  {category.score}
                </div>
                <div className="text-xs text-gray-700 leading-tight text-center">
                  {category.insights}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strengths and Red Flags */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Strengths */}
          <div className="bg-green-50 rounded-2xl p-6 sm:p-8 border border-green-200">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-xl font-bold text-green-900">Strengths</h3>
            </div>
            <div className="space-y-3">
              {complianceData.strengths.length > 0 ? (
                complianceData.strengths.map((strength, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-green-800">{strength}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-green-700 italic">
                  Complete more compliance items to build your strengths
                </div>
              )}
            </div>
          </div>

          {/* Red Flags */}
          <div className="bg-red-50 rounded-2xl p-6 sm:p-8 border border-red-200">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-bold text-red-900">Red Flags</h3>
            </div>
            <div className="space-y-3">
              {complianceData.redFlags.length > 0 ? (
                complianceData.redFlags.map((flag, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-red-800">{flag}</span>
                  </div>
                ))
              ) : (
                <div className="text-sm text-red-700 italic">
                  Great! No critical compliance issues identified
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 6-Month Risk Forecast */}
        <div className="bg-orange-50 rounded-2xl p-6 sm:p-8 border border-orange-200 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-bold text-orange-900">{complianceData.riskForecast.period}</h3>
          </div>
          {complianceData.riskForecast.risks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {complianceData.riskForecast.risks.map((risk, index) => (
                <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className={`inline-block px-2 py-1 rounded-full text-xs font-semibold mb-3 ${risk.probability === 'high' ? 'bg-red-100 text-red-800' :
                    risk.probability === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                    {risk.probability.toUpperCase()} RISK
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2 text-sm">{risk.type}</h4>
                  <p className="text-xs text-gray-600">{risk.penalty}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-6 border border-orange-200 text-center">
              <div className="text-sm text-orange-700">
                Excellent! No significant compliance risks identified for the next 6 months.
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}