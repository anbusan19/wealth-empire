import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Hero() {
  const { currentUser } = useAuth();
  return (
    <section className="relative pt-20 sm:pt-32 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-4 sm:mb-6">
            {/* COMPLIANCE HEALTH */}
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2 sm:px-0">
            Startup Compliance
            <br />
            <span className="text-gray-400">made simple</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 max-w-2xl mx-auto mb-6 sm:mb-8 lg:mb-10 px-4 sm:px-0 leading-relaxed">
            AI-powered assessment with actionable insights. Check your startup's compliance health in minutes and get personalized recommendations.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4 sm:px-0 max-w-md sm:max-w-none mx-auto">
            <Link 
              to="/health-check" 
              className="bg-gray-900 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-gray-800 transition-all text-sm sm:text-base font-medium inline-block shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto text-center min-w-0"
            >
              Start Health Check
            </Link>
            {!currentUser && (
              <Link 
                to="/login" 
                className="border-2 border-gray-900 text-gray-900 px-6 sm:px-8 py-3 sm:py-4 rounded-full hover:bg-gray-900 hover:text-white transition-all text-sm font-medium inline-block w-full sm:w-auto text-center min-w-0"
              >
                Sign Up Free
              </Link>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0">
          <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 text-white min-h-[200px] sm:aspect-square flex flex-col justify-between">
            <div>
              <div className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 leading-none">87%</div>
              <div className="text-base sm:text-lg lg:text-xl font-semibold mb-2">Average Score</div>
              <div className="text-xs sm:text-sm text-gray-400 leading-relaxed">
                Startups pass with strong compliance foundations.
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl sm:rounded-3xl p-6 sm:p-8 min-h-[200px] sm:aspect-square flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
              <div className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold mb-3 sm:mb-4 leading-none">5 min</div>
              <div className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">Quick Assessment</div>
              <div className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                Complete your health check in under 5 minutes with our guided flow.
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-20 h-20 sm:w-24 sm:h-24 lg:w-32 lg:h-32 bg-blue-200/50 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-2xl sm:rounded-3xl p-6 sm:p-8 min-h-[200px] sm:aspect-square flex flex-col justify-between sm:col-span-2 lg:col-span-1">
            <div>
              <div className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 mb-3 sm:mb-4 leading-none">3-5</div>
              <div className="text-base sm:text-lg lg:text-xl font-semibold text-gray-900 mb-2">Action Items</div>
              <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                Get focused recommendations to improve compliance quickly.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}