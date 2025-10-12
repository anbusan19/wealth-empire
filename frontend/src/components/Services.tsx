import { ArrowUpRight, CheckCircle, Zap } from 'lucide-react';

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

const Services = () => {
  return (
    <section id="services" className="px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-16 sm:mb-20">
          <p className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-4 sm:mb-6">
            OUR SERVICES
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
            Professional
            <br />
            <span className="text-gray-400">Compliance Solutions</span>
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10">
            Expert services designed to keep your business compliant, protected, and ready for growth.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-20 px-2 sm:px-0">
          {wealthEmpireServices.map((service) => (
            <div
              key={service.id}
              className="group bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-6 lg:p-8 border border-gray-200 shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 relative overflow-hidden min-w-0"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>

              <div className="flex flex-col sm:flex-row items-start justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className={`inline-flex items-center gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${service.priority === 'high'
                  ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border border-red-200'
                  : 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border border-amber-200'
                  }`}>
                  <div className={`w-2 h-2 rounded-full ${service.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'
                    }`}></div>
                  {service.priority.toUpperCase()} PRIORITY
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:bg-gray-200 transition-colors flex-shrink-0">
                  <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                </div>
              </div>

              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-gray-700 transition-colors leading-tight break-words">
                {service.title}
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed break-words">
                {service.description}
              </p>

              {/* Features */}
              <div className="mb-6 sm:mb-8">
                <div className="grid grid-cols-1 gap-2 sm:gap-3">
                  {service.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 sm:gap-3">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-600" />
                      </div>
                      <span className="text-xs sm:text-sm text-gray-700 leading-relaxed">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-gray-50 rounded-lg sm:rounded-xl">
                <div className="flex flex-col xs:flex-row xs:items-end xs:justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2 sm:gap-3 mb-1 flex-wrap">
                      <span className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 leading-none">
                        ₹{service.discountedPrice.toLocaleString()}
                      </span>
                      <span className="text-sm sm:text-base lg:text-lg text-gray-400 line-through leading-none">
                        ₹{service.originalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="text-xs sm:text-sm text-green-600 font-medium leading-tight">
                      {service.discount}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white px-2 sm:px-3 lg:px-4 py-1 sm:py-1.5 lg:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-sm">
                      SAVE ₹{(service.originalPrice - service.discountedPrice).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <button className="group w-full bg-gradient-to-r from-gray-900 to-gray-800 text-white px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 font-semibold flex items-center justify-center gap-2 shadow-lg text-sm sm:text-base">
                Get Started Now
                <ArrowUpRight size={16} className="sm:w-[18px] sm:h-[18px] group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </button>
            </div>
          ))}
        </div>
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="text-center mb-16 sm:mb-20">
            <p className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-4 sm:mb-6">
              GET IN TOUCH
            </p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
              Ready to Get
              <br />
              <span className="text-gray-400">Started?</span>
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-8 sm:mb-10">
              Let's discuss how we can help your business stay compliant and grow with confidence.
            </p>
          </div>
        </div>
        {/* Why Choose Us Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 text-white relative overflow-hidden shadow-xl">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-700/20 to-transparent"></div>
            <div className="relative z-10">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6 border border-white/20">
                <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Need Expert Guidance?</h3>
              <p className="text-sm sm:text-base text-gray-300 mb-6 sm:mb-8 leading-relaxed">
                Schedule a free consultation with our compliance specialists for personalized advice
                and strategic planning tailored to your business needs.
              </p>
              <a
                href="mailto:support@wealthempires.in?subject=Expert Consultation Request"
                className="inline-flex items-center gap-2 sm:gap-3 bg-white text-gray-900 px-4 sm:px-6 lg:px-8 py-3 sm:py-4 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-all duration-300 font-semibold shadow-lg group text-sm sm:text-base"
              >
                <span className="hidden sm:inline">Schedule Free Consultation</span>
                <span className="sm:hidden">Free Consultation</span>
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </a>
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10 border border-gray-200 shadow-sm">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 sm:mb-6">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">Why Choose Wealth Empires?</h3>
            <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <span className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">10+ years of compliance expertise</span>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <span className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">1000+ businesses served successfully</span>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <span className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">99.9% compliance success rate</span>
              </div>
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                </div>
                <span className="text-sm sm:text-base text-gray-700 font-medium leading-relaxed">24/7 dedicated support</span>
              </div>
            </div>
            <div className="pt-4 sm:pt-6 border-t border-gray-200">
              <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-3 font-medium">Contact us:</p>
              <a
                href="mailto:support@wealthempires.in"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors group text-sm sm:text-base break-all"
              >
                support@wealthempires.in
                <ArrowUpRight className="w-4 h-4 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform flex-shrink-0" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;