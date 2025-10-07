// src/views/landing/LandingPage.jsx
import { Link } from "react-router-dom";

/**
 * Enhanced Landing Page Component
 * 
 * Professional landing page with improved content, testimonials, and better UX
 * Features:
 * - Gradient background instead of external image dependency
 * - Multiple call-to-action buttons
 * - Trust indicators and statistics
 * - Features showcase with icons
 * - Customer testimonials
 * - Better visual hierarchy and responsive design
 * 
 * @returns {JSX.Element} Enhanced landing page component
 */
export default function Landing() {
  return (
    <>
      {/* HERO SECTION - Enhanced with gradient background and better CTAs */}
      <section className="relative bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 h-[600px] flex items-center justify-center">
        {/* Background Pattern for visual interest */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4 max-w-4xl mx-auto">
          {/* Main Headline */}
          <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6">
            Find A Pharmacy That Works With Your Insurance
          </h1>
          
          {/* Subtitle */}
          <p className="text-lg md:text-xl max-w-2xl mb-8 opacity-90">
            Helping patients quickly locate pharmacies that work with their
            health insurance, ensuring access to affordable care across Rwanda.
          </p>
          
          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/auth/register"
              className="bg-white text-teal-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300 shadow-lg"
            >
              Get Started Free
            </Link>
            <Link
              to="/auth/login"
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-teal-600 transition duration-300"
            >
              Sign In
            </Link>
          </div>
          
          {/* Trust Indicators */}
          {/* <div className="mt-8 flex items-center gap-8 text-sm opacity-75">
            <div className="flex items-center gap-2">
              <span className="material-icons text-green-400">verified</span>
              <span>Trusted by 1000+ Patients</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="material-icons text-green-400">local_pharmacy</span>
              <span>500+ Partner Pharmacies</span>
            </div>
          </div> */}
        </div>
      </section>

      {/* HOW IT WORKS - Enhanced with better styling and step indicators */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              How PharmaFind Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Simple steps to find the perfect pharmacy for your needs
            </p>
          </div>

          {/* Process Steps */}
          <div className="grid md:grid-cols-3 gap-12">
            {/* Step 1: Search */}
            <div className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="bg-teal-100 p-4 rounded-full">
                  <span className="material-icons text-teal-600 text-4xl">
                    search
                  </span>
                </div>
              </div>
              {/* Step Number */}
              {/* <div className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">1</div> */}
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Search for Pharmacies
              </h3>
              <p className="text-gray-600">
                Enter your location and insurance details to begin search for
                pharmacies that match your needs
              </p>
            </div>

            {/* Step 2: Verify */}
            <div className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="bg-teal-100 p-4 rounded-full">
                  <span className="material-icons text-teal-600 text-4xl">
                    verified_user
                  </span>
                </div>
              </div>
              {/* Step Number */}
              {/* <div className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">2</div> */}
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Verify Insurance Coverage
              </h3>
              <p className="text-gray-600">
                PharmaFind checks which pharmacies accept your insurance plan
                and shows you the best matches
              </p>
            </div>

            {/* Step 3: Locate */}
            <div className="bg-white p-8 rounded-lg shadow-lg text-center hover:shadow-xl transition-shadow duration-300">
              <div className="flex justify-center mb-6">
                <div className="bg-teal-100 p-4 rounded-full">
                  <span className="material-icons text-teal-600 text-4xl">
                    location_on
                  </span>
                </div>
              </div>
              {/* Step Number */}
              {/* <div className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-4 text-sm font-bold">3</div> */}
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                Locate Nearby Options
              </h3>
              <p className="text-gray-600">
                View a map of pharmacies near you that match your criteria
                and get directions
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center mt-16">
            <Link
              to="/auth/register"
              className="bg-teal-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-teal-700 transition duration-300 shadow-lg"
            >
              Get Started Today
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION - New section showcasing key features */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Why Choose PharmaFind?
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              The most comprehensive pharmacy finder in Rwanda
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Fast Search */}
            <div className="text-center">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-teal-600 text-2xl">speed</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Fast Search</h3>
              <p className="text-gray-600 text-sm">Find pharmacies in seconds</p>
            </div>

            {/* Verified Data */}
            <div className="text-center">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-teal-600 text-2xl">verified</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Verified Data</h3>
              <p className="text-gray-600 text-sm">Accurate pharmacy information</p>
            </div>

            {/* Mobile Friendly */}
            <div className="text-center">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-teal-600 text-2xl">phone_android</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Mobile Friendly</h3>
              <p className="text-gray-600 text-sm">Works on all devices</p>
            </div>

            {/* 24/7 Support */}
            <div className="text-center">
              <div className="bg-teal-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-icons text-teal-600 text-2xl">support_agent</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Always here to help</p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION - New section with customer feedback */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Real feedback from patients and pharmacy owners
            </p>
          </div>

          {/* Testimonials Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-icons text-sm">star</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "PharmaFind helped me find a pharmacy that accepts my insurance in just minutes. 
                The interface is so easy to use!"
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                  <span className="material-icons text-teal-600">person</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Marie Uwimana</p>
                  <p className="text-sm text-gray-500">Patient, Kigali</p>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-icons text-sm">star</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "As a pharmacy owner, PharmaFind has helped us reach more patients. 
                The management tools are excellent."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                  <span className="material-icons text-teal-600">local_pharmacy</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Dr. Jean Baptiste</p>
                  <p className="text-sm text-gray-500">Pharmacy Owner, Huye</p>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <div className="flex items-center mb-4">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="material-icons text-sm">star</span>
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "The map feature is amazing! I can see exactly where the pharmacies are 
                and get directions easily."
              </p>
              <div className="flex items-center">
                <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                  <span className="material-icons text-teal-600">person</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Grace Mukamana</p>
                  <p className="text-sm text-gray-500">Patient, Huye</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA SECTION - New section to drive conversions */}
      <section className="py-20 bg-teal-600">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Find Your Perfect Pharmacy?
          </h2>
          <p className="text-xl text-teal-100 mb-8 max-w-2xl mx-auto">
            Join thousands of patients who have found their ideal pharmacy through PharmaFind
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth/register"
              className="bg-white text-teal-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 transition duration-300 shadow-lg"
            >
              Start Your Search
            </Link>
            <Link
              to="/about"
              className="border-2 border-white text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-teal-600 transition duration-300"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}


