import { ArrowUpRight, Phone } from 'lucide-react';

interface Recommendation {
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  bgColor: string;
}

const recommendations: Recommendation[] = [
  {
    priority: 'high',
    title: 'Register for GST',
    description: 'Your annual turnover exceeds the threshold. GST registration is mandatory to avoid penalties and maintain compliance.',
    action: 'Complete Registration',
    bgColor: 'bg-gradient-to-br from-red-100 to-red-200'
  },
  {
    priority: 'high',
    title: 'File Trademark Application',
    description: 'Protect your brand identity by registering your trademark with the Intellectual Property Office.',
    action: 'Apply for Trademark',
    bgColor: 'bg-gradient-to-br from-pink-100 to-pink-200'
  },
  {
    priority: 'medium',
    title: 'EPF and ESI Registration',
    description: 'Register for employee benefits schemes as per labor law requirements for your team size.',
    action: 'Register Now',
    bgColor: 'bg-gradient-to-br from-orange-100 to-orange-200'
  }
];

export default function ReportView() {
  return (
    <section className="py-24 px-6 lg:px-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-4">
            RECOMMENDATIONS
          </p>
          <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            ai-powered
            <br />
            <span className="text-gray-400">action plan</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Tailored recommendations to improve your compliance health and reduce legal risks
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className={`${rec.bgColor} rounded-3xl p-8 flex flex-col justify-between min-h-[320px] hover:scale-105 transition-transform`}
            >
              <div>
                <div className="inline-block px-3 py-1 bg-white/80 rounded-full text-xs font-semibold text-gray-700 mb-6">
                  {rec.priority.toUpperCase()} PRIORITY
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{rec.title}</h3>
                <p className="text-sm text-gray-700 mb-6">
                  {rec.description}
                </p>
              </div>
              <button className="group w-full bg-gray-900 text-white px-6 py-3 rounded-full hover:bg-gray-800 transition-all font-medium flex items-center justify-center gap-2">
                {rec.action}
                <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-4 lg:gap-6">
          <div className="bg-gray-900 rounded-3xl p-10 text-white">
            <div className="mb-8">
              <h3 className="text-3xl font-bold mb-3">Need Expert Help?</h3>
              <p className="text-gray-400">
                Schedule a consultation with our compliance specialists for personalized guidance.
              </p>
            </div>
            <button className="w-full bg-white text-gray-900 px-6 py-4 rounded-full hover:bg-gray-100 transition-all font-medium flex items-center justify-center gap-2">
              <Phone size={20} />
              Schedule Consultation
            </button>
          </div>

          <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl p-10">
            <div className="mb-8">
              <h3 className="text-3xl font-bold text-gray-900 mb-3">Ongoing Support</h3>
              <p className="text-gray-700">
                Get continuous monitoring and updates to maintain compliance as you scale.
              </p>
            </div>
            <button className="w-full bg-gray-900 text-white px-6 py-4 rounded-full hover:bg-gray-800 transition-all font-medium">
              Explore Services
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
