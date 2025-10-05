import { ArrowUpRight, Phone, CheckCircle, Zap } from 'lucide-react';
import { calculateScores } from '../utils/scoringSystem';

interface WealthEmpireService {
  id: number;
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discount: string;
  bgColor: string;
  features: string[];
  priority: 'high' | 'medium';
}

const wealthEmpireServices: WealthEmpireService[] = [
  {
    id: 1,
    title: 'Business Registration',
    description: 'Complete incorporation package with all legal documentation',
    originalPrice: 17999,
    discountedPrice: 11999,
    discount: '25% Lower Than Market Price',
    bgColor: 'bg-gradient-to-br from-blue-50 to-blue-100',
    features: ['Company Incorporation', 'PAN & TAN Registration', 'Bank Account Opening', 'Digital Signature'],
    priority: 'high'
  },
  {
    id: 2,
    title: 'Trademark Registration',
    description: 'Protect your brand identity with comprehensive trademark services',
    originalPrice: 12999,
    discountedPrice: 5999,
    discount: '73.69% Lower Than Market Price',
    bgColor: 'bg-gradient-to-br from-purple-50 to-purple-100',
    features: ['Trademark Search', 'Application Filing', 'Response to Objections', 'Registration Certificate'],
    priority: 'high'
  },
  {
    id: 3,
    title: 'ISO Certification',
    description: 'Quality management standards certification for business credibility',
    originalPrice: 15999,
    discountedPrice: 5999,
    discount: '75% Lower Than Market Price',
    bgColor: 'bg-gradient-to-br from-green-50 to-green-100',
    features: ['Gap Analysis', 'Documentation', 'Internal Audit', 'Certification Support'],
    priority: 'medium'
  },
  {
    id: 4,
    title: 'GST Registration & Compliance',
    description: 'Complete GST registration and ongoing compliance management',
    originalPrice: 8999,
    discountedPrice: 4999,
    discount: '44% Lower Than Market Price',
    bgColor: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
    features: ['GST Registration', 'Monthly Returns Filing', 'Input Tax Credit', 'Compliance Support'],
    priority: 'high'
  },
  {
    id: 5,
    title: 'Bookkeeping & Accounting',
    description: 'Professional bookkeeping and financial record maintenance',
    originalPrice: 12999,
    discountedPrice: 7999,
    discount: '38% Lower Than Market Price',
    bgColor: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
    features: ['Monthly Bookkeeping', 'Financial Statements', 'Tax Preparation', 'Audit Support'],
    priority: 'medium'
  },
  {
    id: 6,
    title: 'Compliance Officer Service',
    description: 'Dedicated compliance officer for ongoing regulatory management',
    originalPrice: 25999,
    discountedPrice: 15999,
    discount: '38% Lower Than Market Price',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    features: ['Monthly Compliance Review', 'Regulatory Updates', 'Risk Assessment', 'Legal Advisory'],
    priority: 'medium'
  }
];

interface ReportViewProps {
  answers: Record<number, string>;
  followUpAnswers: Record<number, string>;
}

export default function ReportView({ answers, followUpAnswers }: ReportViewProps) {
  // Calculate scores to determine which services to prioritize
  const complianceData = calculateScores(answers, followUpAnswers);

  // Filter and prioritize services based on user's red flags and low scores
  const getRecommendedServices = () => {
    const recommended = [];

    // Check if company is not incorporated
    if (answers[1] === 'No') {
      recommended.push(wealthEmpireServices.find(s => s.id === 1));
    }

    // Check if trademark is missing
    if (answers[7] === 'No') {
      recommended.push(wealthEmpireServices.find(s => s.id === 2));
    }

    // Check if ISO certification is missing
    if (answers[10] === 'No') {
      recommended.push(wealthEmpireServices.find(s => s.id === 3));
    }

    // Check if GST registration is missing
    if (answers[4] === 'No') {
      recommended.push(wealthEmpireServices.find(s => s.id === 4));
    }

    // Check if bookkeeping needs improvement
    if (answers[12] === 'No') {
      recommended.push(wealthEmpireServices.find(s => s.id === 5));
    }

    // Check if compliance officer is needed
    if (answers[15] === 'No') {
      recommended.push(wealthEmpireServices.find(s => s.id === 6));
    }

    return recommended.filter(Boolean).slice(0, 6); // Show max 6 services
  };

  const recommendedServices = getRecommendedServices();
  return (
    <section className="py-20 sm:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 sm:mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-slate-900 to-slate-700 rounded-2xl mb-8 shadow-lg">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <p className="text-xs font-semibold tracking-[0.2em] uppercase text-slate-500 mb-6 letterspacing-wide">
            SOLUTIONS & PRICING
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Wealth Empire
            <br />
            <span className="bg-gradient-to-r from-slate-600 to-slate-400 bg-clip-text text-transparent">Solutions</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
            Professional compliance solutions designed for modern businesses.
            Choose the perfect plan to protect and scale your venture.
          </p>
        </div>

        {/* Dynamic Service Recommendations */}
        {recommendedServices.length > 0 && (
          <div className="mb-20">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-8 mb-12 shadow-sm">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    Personalized Recommendations
                  </h3>
                  <p className="text-slate-600">
                    Based on your assessment, we've identified {recommendedServices.length} key service(s) to address your compliance gaps
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {recommendedServices.map((service) => (
                <div key={service.id} className="group bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 relative overflow-hidden">
                  {/* Priority Badge */}
                  {service.priority === 'high' && (
                    <div className="absolute top-6 right-6">
                      <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                        HIGH PRIORITY
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-2xl font-bold text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
                      {service.title}
                    </h3>
                    <p className="text-slate-600 leading-relaxed">
                      {service.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="mb-8">
                    <div className="grid grid-cols-1 gap-3">
                      {service.features.slice(0, 4).map((feature, index) => (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <CheckCircle className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-slate-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pricing */}
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <div className="flex items-baseline gap-3">
                        <span className="text-3xl font-bold text-slate-900">
                          ₹{service.discountedPrice.toLocaleString()}
                        </span>
                        <span className="text-lg text-slate-400 line-through">
                          ₹{service.originalPrice.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-green-600 font-medium mt-1">
                        {service.discount}
                      </div>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white py-4 px-6 rounded-xl font-semibold hover:from-slate-800 hover:to-slate-700 transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg">
                    Get Started
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Wealth Empire Subscription Plans */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-10 sm:p-16 mb-20 relative overflow-hidden shadow-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.15) 0%, transparent 60%), 
                               radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 60%),
                               radial-gradient(circle at 40% 80%, rgba(255,255,255,0.12) 0%, transparent 60%)`
            }}></div>
          </div>

          <div className="relative z-10">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-white/10 backdrop-blur-sm rounded-2xl mb-8 border border-white/20">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6 leading-tight">
                Subscription Plans
              </h2>
              <p className="text-slate-300 text-xl max-w-2xl mx-auto leading-relaxed">
                Comprehensive compliance solutions tailored for every stage of your business journey
              </p>
            </div>

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* Essentials Plan */}
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-10 relative group hover:bg-slate-800/70 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-transparent rounded-2xl"></div>
                <div className="relative z-10">
                  <div className="mb-8">
                    <div className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-3">
                      WEALTH EMPIRE
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">Essentials</h3>
                    <p className="text-slate-300 leading-relaxed">
                      Includes all features except the premium additions of #WE Elite. Perfect for startups and small businesses.
                    </p>
                  </div>

                  <div className="mb-10">
                    <div className="text-5xl font-bold text-white mb-2">Free</div>
                    <div className="text-slate-400">Forever</div>
                  </div>

                  <button className="w-full bg-white text-slate-900 py-4 px-6 rounded-xl font-semibold hover:bg-slate-100 transition-all duration-300 shadow-lg">
                    Get Started
                  </button>
                </div>
              </div>

              {/* #WE Elite Plan */}
              <div className="bg-gradient-to-br from-slate-800/60 to-slate-900/80 backdrop-blur-sm border border-slate-600/50 rounded-2xl p-10 relative group hover:border-slate-500/50 transition-all duration-300">
                <div className="absolute top-6 right-6">
                  <span className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                    MOST POPULAR
                  </span>
                </div>

                <div className="relative z-10">
                  <div className="mb-8">
                    <div className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-400 mb-3">
                      WEALTH EMPIRE
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-4">#WE Elite</h3>
                    <p className="text-slate-300 leading-relaxed mb-6">
                      The ultimate premium experience — built for the relentless founders chasing unicorn status,
                      who refuse to settle for anything less than the absolute best.
                    </p>

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>The essentials plus...</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>AI Compliance Risk Dashboard (Live Monitoring)</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>Multi-Company Dashboard for serial entrepreneurs</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>Integrated Business Portfolio Report</span>
                      </div>
                      <div className="flex items-center gap-3 text-slate-300">
                        <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        <span>VIP Support: 1:1 Strategy Consultation with Compliance Experts</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-10">
                    <div className="flex items-baseline gap-2">
                      <span className="text-5xl font-bold text-white">₹10,000</span>
                      <span className="text-xl text-slate-400">/year</span>
                    </div>
                    <div className="text-slate-400 mt-1">Billed annually</div>
                  </div>

                  <a
                    href="mailto:support@wealthempires.in?subject=WE Elite Plan Inquiry"
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 group shadow-lg"
                  >
                    Contact Sales
                    <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>

            {/* White Label Plan - Full Width */}
            <div className="bg-gradient-to-r from-purple-900/80 via-indigo-900/80 to-purple-900/80 backdrop-blur-sm rounded-2xl p-10 relative overflow-hidden border border-purple-500/20">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-indigo-600/10 to-purple-600/10"></div>
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div className="flex-1">
                    <div className="text-xs font-semibold tracking-[0.15em] uppercase text-purple-300 mb-3">
                      FOR BUSINESS
                    </div>
                    <h3 className="text-4xl font-bold text-white mb-4">#WE White Label</h3>
                    <p className="text-purple-100 mb-6 leading-relaxed max-w-2xl">
                      Complete white-label compliance platform for agencies, consultants, and enterprises.
                      Scale your business with our proven infrastructure.
                    </p>
                    <div className="mb-6">
                      <div className="text-sm text-purple-200 mb-2">Plans Starting</div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold text-white">₹1,000</span>
                        <span className="text-xl text-purple-300">/month</span>
                      </div>
                      <div className="text-purple-200 mt-1">Custom pricing available</div>
                    </div>
                  </div>

                  <div className="lg:flex-shrink-0">
                    <a
                      href="mailto:support@wealthempires.in?subject=WE White Label Plan Inquiry"
                      className="inline-flex items-center gap-3 bg-white/15 backdrop-blur-sm border border-white/30 text-white py-4 px-8 rounded-xl font-semibold hover:bg-white/25 transition-all duration-300 group shadow-lg"
                    >
                      Contact Sales
                      <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Individual Services Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl mb-8 shadow-sm">
            <CheckCircle className="w-6 h-6 text-slate-600" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-6">
            Individual Services
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Need specific compliance solutions? Choose from our comprehensive individual services
            with transparent pricing and expert delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {wealthEmpireServices.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-2xl p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:border-slate-300 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 via-slate-300 to-slate-200"></div>

              <div className="flex items-start justify-between mb-6">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${service.priority === 'high'
                    ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200'
                    : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                  <div className={`w-2 h-2 rounded-full ${service.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'
                    }`}></div>
                  {service.priority.toUpperCase()} PRIORITY
                </div>
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center group-hover:bg-slate-200 transition-colors">
                  <Zap className="w-5 h-5 text-slate-600" />
                </div>
              </div>

              <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-slate-700 transition-colors">
                {service.title}
              </h3>
              <p className="text-slate-600 mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Features */}
              <div className="mb-8">
                <div className="grid grid-cols-1 gap-3">
                  {service.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-center justify-between mb-8 p-4 bg-slate-50 rounded-xl">
                <div>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-bold text-slate-900">
                      ₹{service.discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-lg text-slate-400 line-through">
                      ₹{service.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-sm text-green-600 font-medium mt-1">
                    {service.discount}
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-sm">
                  SAVE ₹{(service.originalPrice - service.discountedPrice).toLocaleString()}
                </div>
              </div>

              {/* CTA Button */}
              <button className="group w-full bg-gradient-to-r from-slate-900 to-slate-800 text-white px-6 py-4 rounded-xl hover:from-slate-800 hover:to-slate-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg">
                Get Started Now
                <ArrowUpRight size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Expert Support Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-10 text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-700/20 to-transparent"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center mb-6 border border-white/20">
                <Phone className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-4">Need Expert Guidance?</h3>
              <p className="text-slate-300 mb-8 leading-relaxed">
                Schedule a free consultation with our compliance specialists for personalized advice
                and strategic planning tailored to your business needs.
              </p>
              <a
                href="mailto:support@wealthempires.in?subject=Expert Consultation Request"
                className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-xl hover:bg-slate-100 transition-all duration-300 font-semibold shadow-lg group"
              >
                <Phone size={20} />
                Schedule Free Consultation
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-10 border border-slate-200 shadow-sm">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center mb-6">
              <CheckCircle className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-3xl font-bold text-slate-900 mb-6">Why Choose Wealth Empire?</h3>
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-slate-700 font-medium">10+ years of compliance expertise</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-slate-700 font-medium">1000+ businesses served successfully</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-slate-700 font-medium">99.9% compliance success rate</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <span className="text-slate-700 font-medium">24/7 dedicated support</span>
              </div>
            </div>
            <div className="pt-6 border-t border-slate-200">
              <p className="text-sm text-slate-600 mb-3 font-medium">Contact us:</p>
              <a
                href="mailto:support@wealthempires.in"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors group"
              >
                support@wealthempires.in
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
