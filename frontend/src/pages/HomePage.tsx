import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import Services from '../components/Services';
import PricingPlans from '../components/PricingPlans';
import Footer from '../components/Footer';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <Hero />
      <PricingPlans />
      <Services />
      <Footer />
    </div>
  );
}