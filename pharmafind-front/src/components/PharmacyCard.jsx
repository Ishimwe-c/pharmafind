import React from "react";

const PharmacyCard = ({ name, location, insurances, isOpen }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900">{name}</h3>
          <p className="text-gray-500 mt-1">{location}</p>
        </div>
        <span className={`px-4 py-1 text-sm font-medium rounded-full ${
          isOpen ? "text-green-800 bg-green-100" : "text-red-800 bg-red-100"
        }`}>
          {isOpen ? "Open" : "Closed"}
        </span>
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-500">Accepted Insurances:</h4>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {insurances && insurances.length > 0 ? (
            insurances.map((ins, i) => (
              <span
                key={i}
                className="px-3 py-1 text-sm font-medium text-blue-800 bg-blue-100 rounded-full"
              >
                {ins}
              </span>
            ))
          ) : (
            <span className="text-gray-500 text-sm">No insurances accepted yet</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyCard;
