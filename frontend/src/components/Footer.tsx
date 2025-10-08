export default function Footer(){
    return(
        <footer id="resources" className="bg-gray-50 py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-12">

            {/* Platform Column */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#overview" className="hover:text-gray-900 transition-colors">Overview</a></li>
                <li><a href="#why-wealth-empires" className="hover:text-gray-900 transition-colors">Why Wealth Empires?</a></li>
                <li><a href="#ai-platform" className="hover:text-gray-900 transition-colors">AI-Powered Platform</a></li>
                <li><a href="#compliance-tools" className="hover:text-gray-900 transition-colors">Compliance Tools</a></li>
                <li><a href="#new-features" className="hover:text-gray-900 transition-colors">New feature releases</a></li>
              </ul>
            </div>

            {/* Use Cases Column */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-gray-900 mb-4">Use cases</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#startup-compliance" className="hover:text-gray-900 transition-colors">Startup compliance</a></li>
                <li><a href="#legal-health-check" className="hover:text-gray-900 transition-colors">Legal health management</a></li>
                <li><a href="#regulatory-tracking" className="hover:text-gray-900 transition-colors">Regulatory tracking</a></li>
                <li><a href="#compliance-automation" className="hover:text-gray-900 transition-colors">Compliance automation</a></li>
                <li><a href="#risk-assessment" className="hover:text-gray-900 transition-colors">Risk assessment</a></li>
                <li><a href="#document-management" className="hover:text-gray-900 transition-colors">Document management</a></li>
                <li><a href="#audit-preparation" className="hover:text-gray-900 transition-colors">Audit preparation</a></li>
              </ul>
            </div>

            {/* Industries Column */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-gray-900 mb-4">Industries</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#fintech" className="hover:text-gray-900 transition-colors">FinTech</a></li>
                <li><a href="#ecommerce" className="hover:text-gray-900 transition-colors">E-commerce</a></li>
                <li><a href="#healthcare" className="hover:text-gray-900 transition-colors">Healthcare</a></li>
                <li><a href="#saas" className="hover:text-gray-900 transition-colors">SaaS</a></li>
                <li><a href="#manufacturing" className="hover:text-gray-900 transition-colors">Manufacturing</a></li>
                <li><a href="#retail" className="hover:text-gray-900 transition-colors">Retail</a></li>
              </ul>

              <h3 className="font-semibold text-gray-900 mb-4 mt-8">Templates</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#compliance-templates" className="hover:text-gray-900 transition-colors">Compliance templates</a></li>
                <li><a href="#legal-documents" className="hover:text-gray-900 transition-colors">Legal document templates</a></li>
                <li><a href="#audit-checklists" className="hover:text-gray-900 transition-colors">Audit checklists</a></li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-gray-900 mb-4">Resources</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#blog" className="hover:text-gray-900 transition-colors">Blog</a></li>
                <li><a href="#events" className="hover:text-gray-900 transition-colors">Events</a></li>
                <li><a href="#ebooks" className="hover:text-gray-900 transition-colors">eBooks</a></li>
                <li><a href="#videos" className="hover:text-gray-900 transition-colors">Videos</a></li>
                <li><a href="#integrations" className="hover:text-gray-900 transition-colors">App integrations</a></li>
                <li><a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a></li>
              </ul>

              <h3 className="font-semibold text-gray-900 mb-4 mt-8">Developer Hub</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#api-docs" className="hover:text-gray-900 transition-colors">API docs</a></li>
                <li><a href="#help-docs" className="hover:text-gray-900 transition-colors">Help docs</a></li>
                <li><a href="#academy" className="hover:text-gray-900 transition-colors">Academy</a></li>
                <li><a href="#community" className="hover:text-gray-900 transition-colors">Community</a></li>
              </ul>
            </div>

            {/* Company Column */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-gray-900 mb-4">Company</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#about" className="hover:text-gray-900 transition-colors">About us</a></li>
                <li><a href="#customers" className="hover:text-gray-900 transition-colors">Customers</a></li>
                <li><a href="#partners" className="hover:text-gray-900 transition-colors">Partners</a></li>
                <li><a href="#careers" className="hover:text-gray-900 transition-colors">Careers</a></li>
                <li><a href="#life-at-wealth-empires" className="hover:text-gray-900 transition-colors">Life at Wealth Empires</a></li>
                <li><a href="#analyst-reports" className="hover:text-gray-900 transition-colors">Analyst Reports</a></li>
                <li><a href="#news-media" className="hover:text-gray-900 transition-colors">News & Media</a></li>
                <li><a href="#brand-assets" className="hover:text-gray-900 transition-colors">Brand assets</a></li>
                <li><a href="#contact" className="hover:text-gray-900 transition-colors">Contact us</a></li>
              </ul>
            </div>

            {/* Quick Links Column */}
            <div className="lg:col-span-1">
              <h3 className="font-semibold text-gray-900 mb-4">Quick links</h3>
              <ul className="space-y-3 text-sm text-gray-600">
                <li><a href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</a></li>
                <li><a href="#demo" className="hover:text-gray-900 transition-colors">Schedule a demo</a></li>
                <li><a href="#health-check" className="hover:text-gray-900 transition-colors">Free Health Check</a></li>
                <li><a href="#support" className="hover:text-gray-900 transition-colors">Support</a></li>
              </ul>
            </div>

          </div>

          {/* Bottom Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
              <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                <a href="#terms" className="hover:text-gray-900 transition-colors">Terms of Service</a>
                <a href="#privacy" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
                <a href="#compliance" className="hover:text-gray-900 transition-colors">Compliance</a>
                <a href="#security" className="hover:text-gray-900 transition-colors">Security</a>
                <a href="#gdpr" className="hover:text-gray-900 transition-colors">GDPR</a>
                <a href="#responsible-disclosure" className="hover:text-gray-900 transition-colors">Responsible Disclosure</a>
                <a href="#eol" className="hover:text-gray-900 transition-colors">End of Life (EoL)</a>
              </div>
              <p className="text-sm text-gray-500">
                Copyright © 2025 Wealth Empires Inc.
              </p>
            </div>
          </div>
        </div>
      </footer>
    )
}