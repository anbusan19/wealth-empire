import { ArrowUpRight, Phone, CheckCircle, Zap } from 'lucide-react';

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
    title: 'MCA Compliance Bundle',
    description: 'Complete Startup Compliance Package - End-to-end compliance solution covering all critical areas includes accounting & auditing',
    originalPrice: 35999,
    discountedPrice: 24999,
    discount: '38% Lower Than Market Price',
    bgColor: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
    features: ['Annual Return Filing', 'Board Resolutions', 'Compliance Calendar', 'Accounting & Auditing', 'Legal Advisory'],
    priority: 'high'
  }
];

export default function ReportView() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <p className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-4">
            ACTION PLAN
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            wealth empire
            <br />
            <span className="text-gray-400">solutions</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            One-click fixes for your compliance gaps with industry-leading pricing
          </p>
        </div>

        {/* Wealth Empire Services */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {wealthEmpireServices.map((service) => (
            <div
              key={service.id}
              className={`${service.bgColor} rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-gray-200 hover:shadow-lg transition-all duration-300`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                  service.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {service.priority.toUpperCase()} PRIORITY
                </div>
                <Zap className="w-5 h-5 text-gray-600" />
              </div>

              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">{service.title}</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                {service.description}
              </p>

              {/* Features */}
              <div className="mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {service.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                      <span className="text-xs text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pricing */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-bold text-gray-900">
                      ₹{service.discountedPrice.toLocaleString()}
                    </span>
                    <span className="text-lg text-gray-500 line-through">
                      ₹{service.originalPrice.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-green-700 font-medium mt-1">
                    {service.discount}
                  </div>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-semibold">
                  SAVE ₹{(service.originalPrice - service.discountedPrice).toLocaleString()}
                </div>
              </div>

              {/* CTA Button */}
              <button className="group w-full bg-gray-900 text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition-all font-medium flex items-center justify-center gap-2">
                Get Started Now
                <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        {/* Expert Support Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-900 rounded-2xl sm:rounded-3xl p-8 sm:p-10 text-white">
            <div className="mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">Need Expert Guidance?</h3>
              <p className="text-gray-400">
                Schedule a free consultation with our compliance specialists for personalized advice.
              </p>
            </div>
            <button className="w-full bg-white text-gray-900 px-6 py-4 rounded-xl hover:bg-gray-100 transition-all font-medium flex items-center justify-center gap-2">
              <Phone size={20} />
              Schedule Free Consultation
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-2xl sm:rounded-3xl p-8 sm:p-10">
            <div className="mb-8">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Ongoing Compliance</h3>
              <p className="text-gray-700">
                Get continuous monitoring and updates to maintain compliance as your business scales.
              </p>
            </div>
            <button className="w-full bg-gray-900 text-white px-6 py-4 rounded-xl hover:bg-gray-800 transition-all font-medium">
              Explore Ongoing Services
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
