import React, { useState } from 'react';
import PharmacyMedicineList from './PharmacyMedicineList';

const PharmacyDetailsModal = ({ pharmacy, isOpen, onClose, onGetDirections }) => {
  const [activeTab, setActiveTab] = useState('details');
  
  if (!isOpen || !pharmacy) return null;

  // Helper function to extract insurance names safely
  const getInsuranceNames = (insurances) => {
    if (!insurances || !Array.isArray(insurances)) return [];
    
    return insurances.map(ins => {
      if (typeof ins === 'object' && ins !== null && ins.name) {
        return ins.name;
      }
      if (typeof ins === 'string') {
        return ins;
      }
      return String(ins);
    });
  };

  const insuranceNames = getInsuranceNames(pharmacy.insurances);
  const isOpenStatus = pharmacy.is_open !== undefined ? pharmacy.is_open : pharmacy.isOpen;

  // Handle get directions - use embedded map instead of external Google Maps
  const handleGetDirections = () => {
    if (onGetDirections) {
      onGetDirections(pharmacy);
    } else {
      // Fallback to external Google Maps if no callback provided
      const hasCoords = pharmacy.latitude && pharmacy.longitude;
      const dest = hasCoords
        ? `${parseFloat(pharmacy.latitude)},${parseFloat(pharmacy.longitude)}`
        : encodeURIComponent(
            pharmacy.location || pharmacy.address || pharmacy.pharmacy_name || 'Pharmacy'
          );

      const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          {/* Modal Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              {pharmacy.pharmacy_name || pharmacy.name || 'Pharmacy Details'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="material-icons text-2xl">close</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                activeTab === 'details'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center">
                <span className="material-icons text-sm mr-2">info</span>
                Details
              </span>
            </button>
            <button
              onClick={() => setActiveTab('medicines')}
              className={`px-4 py-2 font-medium text-sm transition-colors relative ${
                activeTab === 'medicines'
                  ? 'text-teal-600 border-b-2 border-teal-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="flex items-center">
                <span className="material-icons text-sm mr-2">medication</span>
                Available Medicines
              </span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'details' && (
            <div className="space-y-6">
            {/* Status */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <span className="material-icons text-gray-600 mr-2">watch_later</span>
                <span className="text-gray-700 font-medium">Status</span>
              </div>
              <span
                className={`font-semibold px-3 py-1 rounded-full text-sm ${
                  isOpenStatus 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {isOpenStatus ? 'Open' : 'Closed'}
              </span>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <span className="material-icons text-sm mr-1">location_on</span>
                  Address
                </label>
                <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                  {pharmacy.location || pharmacy.address || 'Address not available'}
                </p>
              </div>

              {pharmacy.phone_number && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="material-icons text-sm mr-1">phone</span>
                    Phone Number
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {pharmacy.phone_number}
                  </p>
                </div>
              )}

              {pharmacy.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <span className="material-icons text-sm mr-1">email</span>
                    Email
                  </label>
                  <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">
                    {pharmacy.email}
                  </p>
                </div>
              )}

            </div>

            {/* Accepted Insurances */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <span className="material-icons text-sm mr-1">verified</span>
                Accepted Insurances
              </label>
              <div className="bg-gray-50 p-4 rounded-lg">
                {insuranceNames.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {insuranceNames.map((ins, index) => (
                      <span
                        key={index}
                        className="bg-purple-100 text-purple-700 text-sm font-medium px-3 py-2 rounded-full"
                      >
                        {ins}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No insurance information available</p>
                )}
              </div>
            </div>

              {/* Working Hours */}
              {pharmacy.working_hours && pharmacy.working_hours.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    <span className="material-icons text-sm mr-1">schedule</span>
                    Working Hours
                  </label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="space-y-2">
                      {pharmacy.working_hours.map((hour, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="font-medium text-gray-700">
                            {hour.day_of_week}
                          </span>
                          <span className="text-gray-600">
                            {hour.closed 
                              ? 'Closed' 
                              : `${hour.open_time || 'N/A'} - ${hour.close_time || 'N/A'}`
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'medicines' && (
            <PharmacyMedicineList 
              pharmacyId={pharmacy.id} 
              isOpen={isOpenStatus}
            />
          )}
        </div>

        {/* Modal Actions Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleGetDirections}
              className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <span className="material-icons text-sm mr-2">directions</span>
              Show Directions on Map
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PharmacyDetailsModal;







