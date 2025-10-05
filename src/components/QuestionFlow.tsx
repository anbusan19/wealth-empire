import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, AlertTriangle, Building, FileText, Shield, Award, TrendingUp, Play } from 'lucide-react';

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

  const handleFollowUpAnswer = (answer: string) => {
    setFollowUpAnswers({ ...followUpAnswers, [question.id]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < healthCheckupQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowFollowUp(false);
    } else {
      setIsCompleted(true);
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
      <section className="py-20 px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-gray-900 to-gray-700 rounded-2xl mb-8 shadow-lg">
              <Shield className="w-10 h-10 text-white" />
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Business Health Checkup
            </h1>
            
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
              Get a comprehensive compliance assessment for your business. Identify risks, 
              calculate penalties, and get actionable solutions in minutes.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-3xl mx-auto">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <Building className="w-8 h-8 text-gray-700 mb-4 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-2">Legal Structure</h3>
                <p className="text-sm text-gray-600">Company registration, MCA compliance, director KYC</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <FileText className="w-8 h-8 text-gray-700 mb-4 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-2">Tax & GST</h3>
                <p className="text-sm text-gray-600">GST returns, income tax, penalty calculations</p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300">
                <Award className="w-8 h-8 text-gray-700 mb-4 mx-auto" />
                <h3 className="font-semibold text-gray-900 mb-2">IP & Licenses</h3>
                <p className="text-sm text-gray-600">Trademarks, patents, industry certifications</p>
              </div>
            </div>
            
            <button
              onClick={startHealthCheckup}
              className="group inline-flex items-center gap-3 bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Start Health Checkup
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              Takes 5-7 minutes • Free assessment • Instant results
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (isCompleted) {
    return (
      <section className="py-20 px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-2xl mb-8">
              <Check className="w-10 h-10 text-green-600" />
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
              Health Checkup Complete!
            </h2>
            
            <p className="text-xl text-gray-600 mb-8">
              Your compliance report is being generated. You'll see your results below.
            </p>
            
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Quick Solutions Available</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 text-left">
                  <h4 className="font-semibold text-gray-900 mb-2">Business Registration</h4>
                  <p className="text-sm text-gray-600 mb-4">Complete incorporation package</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">₹11,999</span>
                      <span className="text-sm text-gray-500 line-through ml-2">₹17,999</span>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                      25% OFF
                    </span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 text-left">
                  <h4 className="font-semibold text-gray-900 mb-2">Trademark Registration</h4>
                  <p className="text-sm text-gray-600 mb-4">Protect your brand identity</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">₹5,999</span>
                      <span className="text-sm text-gray-500 line-through ml-2">₹12,999</span>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                      73% OFF
                    </span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 text-left">
                  <h4 className="font-semibold text-gray-900 mb-2">ISO Certification</h4>
                  <p className="text-sm text-gray-600 mb-4">Quality management standards</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">₹5,999</span>
                      <span className="text-sm text-gray-500 line-through ml-2">₹15,999</span>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                      75% OFF
                    </span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-left">
                  <h4 className="font-semibold text-gray-900 mb-2">Complete Compliance Package</h4>
                  <p className="text-sm text-gray-600 mb-4">End-to-end compliance solution</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold text-gray-900">₹24,999</span>
                      <span className="text-sm text-gray-500 line-through ml-2">₹35,999</span>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
                      38% OFF
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-6 lg:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 animate-slide-down">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {healthCheckupQuestions.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-gray-900 to-gray-700 h-3 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100 animate-fade-in">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              {CategoryIcon && <CategoryIcon className="w-6 h-6 text-gray-700" />}
              <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
                {question.category}
              </span>
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight mb-4">
              {question.question}
            </h2>
          </div>

          <div className="space-y-4 mb-8">
            {question.type === 'yesno' && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {['Yes', 'No', 'Not Sure'].map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 font-medium transform hover:scale-105 ${
                      answers[question.id] === option
                        ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {answers[question.id] === option && <Check size={18} className="animate-bounce" />}
                      {option}
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
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left font-medium transform hover:scale-[1.02] ${
                      answers[question.id] === option
                        ? 'border-gray-900 bg-gray-900 text-white shadow-lg'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700 hover:shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {option}
                      {answers[question.id] === option && <Check size={18} className="animate-bounce" />}
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
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-all duration-300 focus:shadow-lg"
                placeholder="Type your answer..."
              />
            )}

            {/* Follow-up Question */}
            {showFollowUp && question.followUp && (
              <div className="mt-6 p-6 bg-blue-50 border border-blue-200 rounded-xl animate-slide-down">
                <h3 className="font-semibold text-gray-900 mb-3">{question.followUp.question}</h3>
                <input
                  type={question.followUp.type === 'number' ? 'number' : 'text'}
                  value={followUpAnswers[question.id] || ''}
                  onChange={(e) => handleFollowUpAnswer(e.target.value)}
                  className="w-full p-3 border-2 border-blue-200 rounded-lg focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder={question.followUp.placeholder}
                />
              </div>
            )}

            {/* Warning Message */}
            {answers[question.id] === 'No' && question.warning && (
              <div className="mt-6 p-6 bg-red-50 border border-red-200 rounded-xl animate-slide-down">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-2">Important Warning</h4>
                    <p className="text-sm text-red-800 leading-relaxed">{question.warning}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-200 text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium hover:shadow-md"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium hover:shadow-lg transform hover:-translate-y-1"
            >
              {currentQuestion === healthCheckupQuestions.length - 1 ? 'Complete Assessment' : 'Next'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-6 animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Auto-fetch Available</h4>
              <p className="text-sm text-gray-600">
                We can automatically fetch some of this information from MCA21 and GSTN databases to speed up your assessment.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
