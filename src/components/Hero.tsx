import Aurora from "./Aurora";
import DarkVeil
 from "./DarkVeil";
export default function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-6 lg:px-8 overflow-hidden">
      {/* <div className="absolute inset-0 z-0">
        <Aurora
          colorStops={["#7b70ee", "#e75c86", "#32ff51"]}
          blend={0.5}
          amplitude={0.8}
          speed={0.8}
        />
      </div> */}
      

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <p className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-6">
            COMPLIANCE HEALTH
          </p>
          <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            startup compliance
            <br />
            <span className="text-gray-400">made simple</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10">
            AI-powered assessment with actionable insights. Check your startup's compliance health in minutes and get personalized recommendations.
          </p>
          <button className="bg-gray-900 text-white px-8 py-4 rounded-full hover:bg-gray-800 transition-all text-sm font-medium">
            Start Health Check
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 lg:gap-6">
          <div className="bg-gray-900 rounded-3xl p-8 text-white aspect-square flex flex-col justify-between">
            <div>
              <div className="text-7xl font-bold mb-4">87%</div>
              <div className="text-xl font-semibold mb-2">Average Score</div>
              <div className="text-sm text-gray-400">
                Startups pass with strong compliance foundations.
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 aspect-square flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
              <div className="text-xl font-semibold text-gray-900 mb-2">Quick Assessment</div>
              <div className="text-sm text-gray-600">
                Complete your health check in under 5 minutes with our guided flow.
              </div>
            </div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-blue-200/50 rounded-full blur-2xl"></div>
          </div>

          <div className="bg-gradient-to-br from-pink-100 to-pink-200 rounded-3xl p-8 aspect-square flex flex-col justify-between">
            <div>
              <div className="text-7xl font-bold text-gray-900 mb-4">3-5</div>
              <div className="text-xl font-semibold text-gray-900 mb-2">Action Items</div>
              <div className="text-sm text-gray-700">
                Get focused recommendations to improve compliance quickly.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}