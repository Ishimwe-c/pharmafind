import React from "react";

/**
 * Enhanced About Component
 * 
 * Professional about page with improved styling:
 * - Removed CSS variables dependency
 * - Consistent teal theme
 * - Better responsive design
 * - Enhanced visual hierarchy
 * - Improved content structure
 * 
 * @returns {JSX.Element} Enhanced about page component
 */
const About = () => {
  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
     

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Intro */}
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">About PharmaFind</h2>
            <p className="text-lg text-gray-600 mt-4 max-w-3xl mx-auto leading-relaxed">
              PharmaFind is a comprehensive web application designed to bridge the gap between patients and pharmacies in Rwanda. 
              Our mission is to simplify the process of finding pharmacies that accept your insurance, ensuring you can access 
              your medications without unnecessary hassle. For pharmacy owners, PharmaFind provides a powerful platform to manage 
              their information and reach more patients in their community.
            </p>
          </div>

          {/* Features */}
          <section className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Card 1 */}
              <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-6">
                  <span className="material-icons text-3xl">search</span>
                </div>
                <h4 className="text-xl font-semibold mb-4 text-gray-800">Smart Pharmacy Search</h4>
                <p className="text-gray-600 leading-relaxed">
                  Easily search for pharmacies based on your location and insurance provider. 
                  Get instant results with detailed information about each pharmacy.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-6">
                  <span className="material-icons text-3xl">info</span>
                </div>
                <h4 className="text-xl font-semibold mb-4 text-gray-800">Detailed Information</h4>
                <p className="text-gray-600 leading-relaxed">
                  View comprehensive details about each pharmacy including address, 
                  contact information, working hours, and accepted insurance plans.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white rounded-lg shadow-lg p-8 text-center hover:shadow-xl transition-shadow duration-300">
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600 mb-6">
                  <span className="material-icons text-3xl">settings</span>
                </div>
                <h4 className="text-xl font-semibold mb-4 text-gray-800">Pharmacy Management</h4>
                <p className="text-gray-600 leading-relaxed">
                  Pharmacy owners can easily manage their information, update working hours, 
                  and manage accepted insurance plans through our intuitive dashboard.
                </p>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="mb-16">
            <h3 className="text-3xl font-bold text-center mb-12 text-gray-800">Who Benefits?</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Benefit 1 */}
              <div className="bg-white rounded-lg shadow-lg p-8 flex items-start gap-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600">
                  <span className="material-icons text-2xl">person</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-3 text-gray-800">For Patients</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Find pharmacies that accept your insurance quickly and easily. Save time and money by 
                    locating the most convenient pharmacy for your healthcare needs. Get directions, 
                    contact information, and working hours all in one place.
                  </p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="bg-white rounded-lg shadow-lg p-8 flex items-start gap-6 hover:shadow-xl transition-shadow duration-300">
                <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 text-teal-600">
                  <span className="material-icons text-2xl">local_pharmacy</span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold mb-3 text-gray-800">For Pharmacy Owners</h4>
                  <p className="text-gray-600 leading-relaxed">
                    Keep your pharmacy's information accurate and accessible to patients. Reach more customers 
                    in your area and manage your business information efficiently. Update your details, 
                    working hours, and accepted insurances with ease.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Mission */}
          <section className="bg-white rounded-lg shadow-lg p-8 text-center">
            <h3 className="text-3xl font-bold mb-6 text-gray-800">Our Mission</h3>
            <p className="text-lg text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Our mission is to bridge the gap between patients and pharmacies, making healthcare more accessible 
              and transparent across Rwanda. We strive to provide a reliable and user-friendly platform that 
              empowers patients to make informed decisions about their healthcare while helping pharmacies 
              connect with their communities more effectively. Through technology, we're building a healthier 
              future for everyone.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
};

export default About;
