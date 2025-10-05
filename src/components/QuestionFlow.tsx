import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, AlertTriangle, Building, FileText, Shield, Award, TrendingUp, Play, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { calculateScores } from '../utils/scoringSystem';
import ResultsDashboard from './ResultsDashboard';
import ReportView from './ReportView';

interface Question {
  id: number;
  category: string;
  question: string;
  type: 'yesno' | 'dropdown' | 'text' | 'number';
  options?: string[];
  warning?: string;
  followUp?: {
    condition: string;
    question: string;
    type: 'text' | 'number';
    placeholder?: string;
  };
}

interface CompanyInfo {
  Attribute: string;
  Value: string;
}

interface DirectorInfo {
  'DIN/PAN': string;
  Name: string;
  'Begin date': string;
  'End date': string;
  'Surrendered DIN': string;
}

interface CompanyData {
  success: boolean;
  cin: string;
  data: {
    company_info: CompanyInfo[];
    director_info: DirectorInfo[];
  };
  timestamp: string;
}

const healthCheckupQuestions: Question[] = [
  // A. Company & Legal Structure
  {
    id: 1,
    category: 'Company & Legal Structure',
    question: 'Is your company legally incorporated?',
    type: 'yesno',
    warning: 'Not registering your business could cost you everything — from your savings to your home — if debts or disputes arise. Even worse, without registration you miss out on raising investments, enforcing contracts, and protecting your brand. Every day you delay puts your startup at risk — incorporate now before opportunities slip away.',
    followUp: {
      condition: 'Yes',
      question: 'Please provide your CIN or business name',
      type: 'text',
      placeholder: 'Enter CIN or business name'
    }
  },
  {
    id: 2,
    category: 'Company & Legal Structure',
    question: 'Have you filed your MCA annual returns (MGT-7 & AOC-4) for the last financial year?',
    type: 'yesno'
  },
  {
    id: 3,
    category: 'Company & Legal Structure',
    question: 'Have you done DIN KYC for all directors for the last financial year?',
    type: 'yesno',
    followUp: {
      condition: 'No',
      question: 'How many directors are in your company?',
      type: 'number',
      placeholder: 'Number of directors'
    }
  },

  // B. Taxation & GST
  {
    id: 4,
    category: 'Taxation & GST',
    question: 'Is your business registered under GST?',
    type: 'yesno'
  },
  {
    id: 5,
    category: 'Taxation & GST',
    question: 'Have you filed all GST returns (GSTR-1, GSTR-3B) on time in the last 6 months?',
    type: 'yesno',
    followUp: {
      condition: 'No',
      question: 'How many months have you missed?',
      type: 'number',
      placeholder: 'Number of months missed'
    }
  },
  {
    id: 6,
    category: 'Taxation & GST',
    question: 'Have you filed your Income Tax Return (ITR) for the last financial year?',
    type: 'yesno',
    followUp: {
      condition: 'No',
      question: 'How many years have you not filed ITR?',
      type: 'number',
      placeholder: 'Number of years'
    }
  },

  // C. Intellectual Property (IP)
  {
    id: 7,
    category: 'Intellectual Property (IP)',
    question: 'Have you filed a trademark for your business name and/or logo?',
    type: 'yesno'
  },
  {
    id: 8,
    category: 'Intellectual Property (IP)',
    question: 'If your business has unique products/technology, have you filed for patents?',
    type: 'dropdown',
    options: ['Yes, filed patents', 'No, but have unique products/technology', 'No unique products/technology', 'Not applicable']
  },
  {
    id: 9,
    category: 'Intellectual Property (IP)',
    question: 'Do you have any active copyright registrations (software, designs, content)?',
    type: 'yesno'
  },

  // D. Certifications & Industry Licenses
  {
    id: 10,
    category: 'Certifications & Industry Licenses',
    question: 'Do you have ISO certification (e.g., ISO 9001, ISO 27001) or industry-specific certifications?',
    type: 'yesno'
  },
  {
    id: 11,
    category: 'Certifications & Industry Licenses',
    question: 'If operating in regulated sectors (F&B, Pharma, etc.), do you have mandatory licenses (FSSAI, Drug License, etc.)?',
    type: 'dropdown',
    options: ['Yes, all required licenses', 'Some licenses missing', 'Not in regulated sector', 'Not sure what licenses needed']
  },

  // E. Financial Health & Risk
  {
    id: 12,
    category: 'Financial Health & Risk',
    question: 'Do you maintain proper bookkeeping & audited financial statements?',
    type: 'yesno'
  },
  {
    id: 13,
    category: 'Financial Health & Risk',
    question: 'Do you have outstanding loans or liabilities that are overdue?',
    type: 'yesno'
  },
  {
    id: 14,
    category: 'Financial Health & Risk',
    question: 'Have you conducted tax planning to optimize deductions and reduce financial risks?',
    type: 'yesno'
  },
  {
    id: 15,
    category: 'Financial Health & Risk',
    question: 'Do you have an external compliance officer for the regular compliance audit process?',
    type: 'yesno'
  }
];

const categoryIcons = {
  'Company & Legal Structure': Building,
  'Taxation & GST': FileText,
  'Intellectual Property (IP)': Shield,
  'Certifications & Industry Licenses': Award,
  'Financial Health & Risk': TrendingUp
};

export default function QuestionFlow() {
  const [isStarted, setIsStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [followUpAnswers, setFollowUpAnswers] = useState<Record<number, string>>({});
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [isLoadingCompany, setIsLoadingCompany] = useState(false);
  const [companyError, setCompanyError] = useState<string | null>(null);
  const [isSavingResults, setIsSavingResults] = useState(false);

  const { currentUser } = useAuth();

  const question = healthCheckupQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / healthCheckupQuestions.length) * 100;
  const CategoryIcon = categoryIcons[question?.category as keyof typeof categoryIcons];

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [question.id]: answer });

    // Check if follow-up question should be shown
    if (question.followUp && answer === question.followUp.condition) {
      setShowFollowUp(true);
    } else {
      setShowFollowUp(false);
      setFollowUpAnswers({ ...followUpAnswers, [question.id]: '' });
    }
  };

  const handleFollowUpAnswer = async (answer: string) => {
    setFollowUpAnswers({ ...followUpAnswers, [question.id]: answer });

    // Check if this is the CIN input for question 1
    if (question.id === 1 && question.followUp?.question.includes('CIN')) {
      const cin = answer.trim().toUpperCase();

      // Basic CIN validation (21 characters, starts with letter)
      if (cin.length === 21 && /^[A-Z]/.test(cin)) {
        await fetchCompanyData(cin);
      } else if (cin.length > 0) {
        setCompanyError('Please enter a valid CIN (21 characters)');
        setCompanyData(null);
      } else {
        setCompanyData(null);
        setCompanyError(null);
      }
    }
  };

  const fetchCompanyData = async (cin: string) => {
    setIsLoadingCompany(true);
    setCompanyError(null);

    try {
      const response = await fetch(`https://node-mca.onrender.com/company/${cin}`);
      const data: CompanyData = await response.json();

      if (data.success) {
        setCompanyData(data);
      } else {
        setCompanyError('Company not found. Please check the CIN and try again.');
        setCompanyData(null);
      }
    } catch (error) {
      setCompanyError('Failed to fetch company data. Please try again.');
      setCompanyData(null);
    } finally {
      setIsLoadingCompany(false);
    }
  };

  const handleNext = async () => {
    if (currentQuestion < healthCheckupQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowFollowUp(false);
    } else {
      // Complete the questionnaire and save results
      await completeQuestionnaire();
    }
  };

  const completeQuestionnaire = async () => {
    setIsSavingResults(true);

    try {
      // Calculate scores using the scoring system
      const results = calculateScores(answers, followUpAnswers);

      // Save results to backend
      if (currentUser) {
        const idToken = await currentUser.getIdToken();

        const response = await fetch('http://localhost:3001/api/health-check/save-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
            'x-firebase-uid': currentUser.uid,
            'x-user-email': currentUser.email || ''
          },
          body: JSON.stringify({
            firebaseUid: currentUser.uid,
            overallScore: results.overallScore,
            categoryScores: results.categoryScores,
            answers,
            followUpAnswers,
            strengths: results.strengths,
            redFlags: results.redFlags,
            risks: results.riskForecast.risks
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to save results');
        }

        console.log('Health check results saved successfully');
      }

      setIsCompleted(true);
    } catch (error: any) {
      console.error('Error saving health check results:', error);
      // Still show results even if saving fails
      setIsCompleted(true);
    } finally {
      setIsSavingResults(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowFollowUp(false);
    }
  };

  const canProceed = () => {
    const hasMainAnswer = answers[question.id];
    if (!hasMainAnswer) return false;

    if (showFollowUp) {
      return followUpAnswers[question.id];
    }

    return true;
  };

  const startHealthCheckup = () => {
    setIsStarted(true);
  };

  if (!isStarted) {
    return (
      <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl mb-6 sm:mb-8 shadow-lg">
              <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-4 sm:px-0">
              Business Health Checkup
            </h1>

            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-4 sm:px-0">
              Get a comprehensive compliance assessment for your business. Identify risks,
              calculate penalties, and get actionable solutions in minutes.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-3xl mx-auto">
              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <Building className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700 mb-3 sm:mb-4 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Legal Structure</h3>
                <p className="text-xs sm:text-sm text-gray-600">Company registration, MCA compliance, director KYC</p>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700 mb-3 sm:mb-4 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">Tax & GST</h3>
                <p className="text-xs sm:text-sm text-gray-600">GST returns, income tax, penalty calculations</p>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 sm:col-span-2 md:col-span-1">
                <Award className="w-6 h-6 sm:w-8 sm:h-8 text-gray-700 mb-3 sm:mb-4 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">IP & Licenses</h3>
                <p className="text-xs sm:text-sm text-gray-600">Trademarks, patents, industry certifications</p>
              </div>
            </div>

            <button
              onClick={startHealthCheckup}
              className="group inline-flex items-center gap-2 sm:gap-3 bg-gray-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold text-base sm:text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
              Start Health Checkup
            </button>

            <p className="text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4">
              Takes 5-7 minutes • Free assessment • Instant results
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-white">
        {/* Completion Header */}
        <section className="pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in">
              <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-2xl mb-6 sm:mb-8">
                <Check className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 sm:mb-6 px-4 sm:px-0">
                Health Checkup Complete!
              </h2>

              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 px-4 sm:px-0">
                Your comprehensive compliance report is ready. Review your results and recommendations below.
              </p>
            </div>
          </div>
        </section>

        {/* Results Dashboard */}
        <ResultsDashboard
          companyData={companyData}
          answers={answers}
          followUpAnswers={followUpAnswers}
        />

        {/* Report View with Recommendations */}
        <ReportView
          answers={answers}
          followUpAnswers={followUpAnswers}
        />

        {/* Footer */}
        <footer className="bg-white py-16 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-2xl font-bold text-gray-900 lowercase tracking-tight">
                wealthempire.
              </div>
              <div className="flex gap-8 text-sm text-gray-600">
                <a href="#" className="hover:text-gray-900 transition-colors">Privacy</a>
                <a href="#" className="hover:text-gray-900 transition-colors">Terms</a>
                <a href="#" className="hover:text-gray-900 transition-colors">Contact</a>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                © 2025 Wealth Empire. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 sm:mb-8 animate-slide-down">
          <div className="flex items-center justify-between mb-2 text-xs sm:text-sm">
            <span className="font-medium text-gray-600">
              Question {currentQuestion + 1} of {healthCheckupQuestions.length}
            </span>
            <span className="font-medium text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-gray-900 to-gray-700 h-2 sm:h-3 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 lg:p-12 shadow-sm border border-gray-100 animate-fade-in">
          <div className="mb-6 sm:mb-8">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              {CategoryIcon && <CategoryIcon className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />}
              <span className="inline-block px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                {question.category}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-4">
              {question.question}
            </h2>
          </div>

          <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
            {question.type === 'yesno' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Yes', 'No', 'Not Sure'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 font-medium transform hover:scale-105 ${answers[question.id] === option
                      ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {answers[question.id] === option && <Check size={16} className="animate-bounce sm:w-[18px] sm:h-[18px]" />}
                      <span className="text-sm sm:text-base">{option}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {question.type === 'dropdown' && question.options && (
              <div className="space-y-3">
                {question.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`w-full p-3 sm:p-4 rounded-lg sm:rounded-xl border-2 transition-all duration-300 text-left font-medium transform hover:scale-[1.02] ${answers[question.id] === option
                      ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow-md'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm sm:text-base pr-2">{option}</span>
                      {answers[question.id] === option && <Check size={16} className="animate-bounce sm:w-[18px] sm:h-[18px] flex-shrink-0" />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {(question.type === 'text' || question.type === 'number') && (
              <input
                type={question.type === 'number' ? 'number' : 'text'}
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                className="w-full p-3 sm:p-4 border-2 border-gray-200 rounded-lg sm:rounded-xl focus:border-gray-900 focus:outline-none transition-all duration-300 focus:shadow-lg text-sm sm:text-base"
                placeholder="Type your answer..."
              />
            )}

            {/* Follow-up Question */}
            {showFollowUp && question.followUp && (
              <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl animate-slide-down">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">{question.followUp.question}</h3>
                <div className="relative">
                  <input
                    type={question.followUp.type === 'number' ? 'number' : 'text'}
                    value={followUpAnswers[question.id] || ''}
                    onChange={(e) => handleFollowUpAnswer(e.target.value)}
                    className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors text-sm sm:text-base"
                    placeholder={question.followUp.placeholder}
                  />
                  {isLoadingCompany && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                    </div>
                  )}
                </div>

                {/* Error Display */}
                {companyError && question.id === 1 && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-600" />
                      <span className="text-red-800 text-xs sm:text-sm">{companyError}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Company Data Display - Separate Container */}
            {companyData && question.id === 1 && showFollowUp && (
              <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-green-50 border border-green-200 rounded-lg sm:rounded-xl animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <Check className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-900 text-sm sm:text-base">Company Found</h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm mb-4">
                  {companyData.data.company_info
                    .filter(info => [
                      'Company Name',
                      'CIN',
                      'Company Category',
                      'Class of Company',
                      'Date of Incorporation',
                      'Company Status(for efiling)',
                      'Authorised Capital(Rs)',
                      'Paid up Capital(Rs)'
                    ].includes(info.Attribute))
                    .map((info, index) => (
                      <div key={index} className="bg-white p-2 sm:p-3 rounded border border-green-100">
                        <div className="font-medium text-gray-700 text-xs sm:text-sm">{info.Attribute}</div>
                        <div className="text-gray-900 mt-1 text-xs sm:text-sm break-words">{info.Value}</div>
                      </div>
                    ))}
                </div>

                {companyData.data.director_info.length > 0 && (
                  <div className="border-t border-green-200 pt-4">
                    <h5 className="font-medium text-green-900 mb-3 text-sm">Directors ({companyData.data.director_info.length})</h5>
                    <div className="space-y-2">
                      {companyData.data.director_info.slice(0, 3).map((director, index) => (
                        <div key={index} className="bg-white p-2 sm:p-3 rounded border border-green-100 text-xs sm:text-sm">
                          <div className="font-medium text-gray-900">{director.Name}</div>
                          <div className="text-gray-600 mt-1">DIN: {director['DIN/PAN']} • Since: {director['Begin date']}</div>
                        </div>
                      ))}
                      {companyData.data.director_info.length > 3 && (
                        <div className="text-xs text-gray-600 text-center py-2">
                          +{companyData.data.director_info.length - 3} more directors
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Warning Message */}
            {answers[question.id] === 'No' && question.warning && (
              <div className="mt-4 sm:mt-6 p-4 sm:p-6 bg-red-50 border border-red-200 rounded-lg sm:rounded-xl animate-slide-down">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-2 text-sm sm:text-base">Important Warning</h4>
                    <p className="text-xs sm:text-sm text-red-800 leading-relaxed">{question.warning}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-4 sm:pt-6 border-t border-gray-100 gap-3 sm:gap-0">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg border-2 border-gray-200 text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium hover:shadow-md text-sm sm:text-base order-2 sm:order-1"
            >
              <ChevronLeft size={18} className="sm:w-5 sm:h-5" />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium hover:shadow-lg transform hover:-translate-y-1 text-sm sm:text-base order-1 sm:order-2"
            >
              <span className="truncate">
                {currentQuestion === healthCheckupQuestions.length - 1 ? 'Complete Assessment' : 'Next'}
              </span>
              <ChevronRight size={18} className="sm:w-5 sm:h-5 flex-shrink-0" />
            </button>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 bg-blue-50 border border-blue-100 rounded-lg sm:rounded-xl p-4 sm:p-6 animate-fade-in">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1 text-sm sm:text-base">Auto-fetch Available</h4>
              <p className="text-xs sm:text-sm text-gray-600">
                We can automatically fetch some of this information from MCA21 and GSTN databases to speed up your assessment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
