import { Download, ArrowRight } from 'lucide-react';

interface CategoryScore {
  category: string;
  score: number;
  color: string;
  bgColor: string;
  insights: string;
}

const categoryScores: CategoryScore[] = [
  {
    category: 'Company Registration',
    score: 95,
    color: 'text-green-700',
    bgColor: 'bg-gradient-to-br from-green-100 to-green-200',
    insights: 'All registration documents are current and compliant.'
  },
  {
    category: 'Tax Compliance',
    score: 82,
    color: 'text-blue-700',
    bgColor: 'bg-gradient-to-br from-blue-100 to-blue-200',
    insights: 'GST filings need attention for Q3 period.'
  },
  {
    category: 'Labor Laws',
    score: 70,
    color: 'text-orange-700',
    bgColor: 'bg-gradient-to-br from-orange-100 to-orange-200',
    insights: 'Missing EPF and ESI registrations for employees.'
  },
  {
    category: 'Intellectual Property',
    score: 60,
    color: 'text-pink-700',
    bgColor: 'bg-gradient-to-br from-pink-100 to-pink-200',
    insights: 'Trademark registration is currently pending.'
  }
];

export default function ResultsDashboard() {
  const overallScore = 77;

  return (
    <section className="py-24 px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-4">
            YOUR RESULTS
          </p>
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            compliance
            <br />
            <span className="text-gray-400">health report</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 lg:gap-6 mb-6">
          <div className="bg-gray-900 rounded-3xl p-10 text-white aspect-square flex flex-col justify-between">
            <div>
              <div className="text-xs font-medium tracking-widest uppercase text-gray-400 mb-8">
                OVERALL SCORE
              </div>
              <div className="text-8xl font-bold mb-2">{overallScore}</div>
              <div className="text-xl text-gray-400">out of 100</div>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 bg-white text-gray-900 px-4 py-3 rounded-full hover:bg-gray-100 transition-all text-sm font-medium">
                Download
              </button>
              <button className="flex-1 border-2 border-white text-white px-4 py-3 rounded-full hover:bg-white/10 transition-all text-sm font-medium">
                Fix Gaps
              </button>
            </div>
          </div>

          {categoryScores.slice(0, 2).map((item) => (
            <div
              key={item.category}
              className={`${item.bgColor} rounded-3xl p-10 aspect-square flex flex-col justify-between`}
            >
              <div>
                <div className="text-xs font-medium tracking-widest uppercase text-gray-600 mb-6">
                  {item.category.toUpperCase()}
                </div>
                <div className={`text-7xl font-bold ${item.color} mb-4`}>{item.score}</div>
                <div className="text-sm text-gray-700">
                  {item.insights}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-4 lg:gap-6">
          {categoryScores.slice(2).map((item) => (
            <div
              key={item.category}
              className={`${item.bgColor} rounded-3xl p-10 aspect-video flex flex-col justify-between`}
            >
              <div>
                <div className="text-xs font-medium tracking-widest uppercase text-gray-600 mb-6">
                  {item.category.toUpperCase()}
                </div>
                <div className={`text-7xl font-bold ${item.color} mb-4`}>{item.score}</div>
                <div className="text-sm text-gray-700">
                  {item.insights}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
