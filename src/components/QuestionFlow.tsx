import { useState } from 'react';
import { ChevronRight, ChevronLeft, Check } from 'lucide-react';

interface Question {
  id: number;
  category: string;
  question: string;
  type: 'yesno' | 'dropdown' | 'text';
  options?: string[];
}

const sampleQuestions: Question[] = [
  {
    id: 1,
    category: 'Company Registration',
    question: 'Is your company registered with the Ministry of Corporate Affairs (MCA)?',
    type: 'yesno'
  },
  {
    id: 2,
    category: 'Tax Compliance',
    question: 'Do you have a GST registration?',
    type: 'yesno'
  },
  {
    id: 3,
    category: 'Tax Compliance',
    question: 'What is your annual turnover?',
    type: 'dropdown',
    options: ['Less than 20 Lakhs', '20 Lakhs - 1 Crore', '1 Crore - 5 Crore', 'Above 5 Crore']
  }
];

export default function QuestionFlow() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const question = sampleQuestions[currentQuestion];
  const progress = ((currentQuestion + 1) / sampleQuestions.length) * 100;

  const handleAnswer = (answer: string) => {
    setAnswers({ ...answers, [question.id]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < sampleQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  return (
    <section className="py-20 px-6 lg:px-8 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {currentQuestion + 1} of {sampleQuestions.length}
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gray-900 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 lg:p-12 shadow-sm border border-gray-100">
          <div className="mb-8">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full mb-4">
              {question.category}
            </span>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
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
                    className={`p-4 rounded-xl border-2 transition-all font-medium ${
                      answers[question.id] === option
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {answers[question.id] === option && <Check size={18} />}
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
                    className={`w-full p-4 rounded-xl border-2 transition-all text-left font-medium ${
                      answers[question.id] === option
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      {option}
                      {answers[question.id] === option && <Check size={18} />}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {question.type === 'text' && (
              <input
                type="text"
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswer(e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-gray-900 focus:outline-none transition-colors"
                placeholder="Type your answer..."
              />
            )}
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-6 py-3 rounded-lg border-2 border-gray-200 text-gray-700 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <button
              onClick={handleNext}
              disabled={!answers[question.id]}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              {currentQuestion === sampleQuestions.length - 1 ? 'Complete' : 'Next'}
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-6">
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
