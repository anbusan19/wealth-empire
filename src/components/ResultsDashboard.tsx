import React from 'react';
import { Download, CheckCircle, AlertTriangle, TrendingUp, FileText, Loader2 } from 'lucide-react';
import generateProfessionalPDF from '../utils/professionalPdfGenerator';

interface CategoryScore {
  category: string;
  score: number;
  color: string;
  bgColor: string;
  insights: string;
  status: 'excellent' | 'good' | 'needs-attention' | 'critical';
}

interface ComplianceData {
  overallScore: number;
  categoryScores: CategoryScore[];
  strengths: string[];
  redFlags: string[];
  riskForecast: {
    period: string;
    risks: Array<{
      type: string;
      penalty: string;
      probability: 'high' | 'medium' | 'low';
    }>;
  };
}

const complianceData: ComplianceData = {
  overallScore: 77,
  categoryScores: [
    {
      category: 'Legal',
      score: 95,
      color: 'text-green-700',
      bgColor: 'bg-gradient-to-br from-green-100 to-green-200',
      insights: 'Company registration and MCA compliance are excellent.',
      status: 'excellent'
    },
    {
      category: 'Tax',
      score: 82,
      color: 'text-blue-700',
      bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200',
      insights: 'GST filings current, ITR needs attention.',
      status: 'good'
    },
    {
      category: 'IP',
      score: 45,
      color: 'text-orange-700',
      bgColor: 'bg-gradient-to-br from-orange-100 to-orange-200',
      insights: 'Trademark registration pending, no patent protection.',
      status: 'needs-attention'
    },
    {
      category: 'Certification',
      score: 30,
      color: 'text-red-700',
      bgColor: 'bg-gradient-to-br from-red-100 to-red-200',
      insights: 'Missing ISO certification and industry licenses.',
      status: 'critical'
    },
    {
      category: 'Finance',
      score: 88,
      color: 'text-green-700',
      bgColor: 'bg-gradient-to-br from-emerald-100 to-emerald-200',
      insights: 'Good bookkeeping practices, audit compliance maintained.',
      status: 'excellent'
    }
  ],
  strengths: [
    'Company legally incorporated with valid CIN',
    'MCA annual returns filed on time',
    'GST registration active and compliant',
    'Proper financial record maintenance',
    'Regular audit compliance'
  ],
  redFlags: [
    'Trademark application not filed',
    'Missing ISO 9001 certification',
    'No patent protection for unique technology',
    'Industry-specific licenses pending',
    'DIN KYC pending for 1 director'
  ],
  riskForecast: {
    period: '6-Month Risk Forecast',
    risks: [
      {
        type: 'Trademark Infringement Risk',
        penalty: '₹2-5 Lakhs + Legal Costs',
        probability: 'high'
      },
      {
        type: 'ISO Certification Delays',
        penalty: 'Lost Business Opportunities',
        probability: 'medium'
      },
      {
        type: 'Director KYC Penalty',
        penalty: '₹5,000 per director',
        probability: 'low'
      }
    ]
  }
};

interface ResultsDashboardProps {
  companyData?: {
    data: {
      company_info: Array<{
        Attribute: string;
        Value: string;
      }>;
    };
  } | null;
}

export default function ResultsDashboard({ companyData }: ResultsDashboardProps = {}) {
  const [isGeneratingPDF, setIsGeneratingPDF] = React.useState(false);

  const generatePDFReport = async () => {
    try {
      setIsGeneratingPDF(true);

      // Extract company name from company data if available
      const companyName = companyData?.data?.company_info?.find(
        info => info.Attribute === 'Company Name'
      )?.Value || 'Your Company Name';

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

      await generateProfessionalPDF(reportData);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Failed to generate PDF report. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-4">
            YOUR RESULTS
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            compliance
            <br />
            <span className="text-gray-400">health report</span>
          </h2>
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
            </div>
            <button
              onClick={generatePDFReport}
              disabled={isGeneratingPDF}
              className="flex items-center justify-center gap-2 bg-white text-gray-900 px-4 py-3 rounded-full hover:bg-gray-100 transition-all text-sm font-medium mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download size={18} />
                  Download PDF Report
                </>
              )}
            </button>
          </div>

          {/* Category Scores */}
          <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
            {complianceData.categoryScores.map((category) => (
              <div
                key={category.category}
                className={`${category.bgColor} rounded-xl p-4 sm:p-6 text-center`}
              >
                <div className="text-xs font-medium tracking-widest uppercase text-gray-600 mb-2">
                  {category.category}
                </div>
                <div className={`text-3xl sm:text-4xl font-bold ${category.color} mb-2`}>
                  {category.score}
                </div>
                <div className="text-xs text-gray-700">
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
              {complianceData.strengths.map((strength, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-green-800">{strength}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Red Flags */}
          <div className="bg-red-50 rounded-2xl p-6 sm:p-8 border border-red-200">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-xl font-bold text-red-900">Red Flags</h3>
            </div>
            <div className="space-y-3">
              {complianceData.redFlags.map((flag, index) => (
                <div key={index} className="flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-red-800">{flag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 6-Month Risk Forecast */}
        <div className="bg-orange-50 rounded-2xl p-6 sm:p-8 border border-orange-200 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-orange-600" />
            <h3 className="text-xl font-bold text-orange-900">{complianceData.riskForecast.period}</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </div>
      </div>
    </section>
  );
}
