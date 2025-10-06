import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import Services from '../components/Services';
import PricingPlans from '../components/PricingPlans';
import Contact from '../components/Contact';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <PricingPlans />
      <Services />
      <Contact />
      <footer className="bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-2xl font-bold text-gray-900 lowercase tracking-tight">
              wealthempire.
            </div>
            <div className="flex gap-8 text-sm text-gray-600">
              <a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#services" className="hover:text-gray-900 transition-colors">Services</a>
              <a href="#contact" className="hover:text-gray-900 transition-colors">Contact</a>
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