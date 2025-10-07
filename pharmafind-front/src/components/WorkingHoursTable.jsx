import React from "react";

const WorkingHoursTable = ({ hours }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-900 mb-6">Working Hours</h3>

      <div className="space-y-4">
        <div className="grid grid-cols-3 items-center py-3 border-b border-gray-200">
          <span className="font-medium text-gray-700">Day</span>
          <span className="font-medium text-gray-700">Open</span>
          <span className="font-medium text-gray-700">Close</span>
        </div>

        {hours && hours.length > 0 ? (
          hours.map((day, i) => (
            <div
              key={i}
              className={`grid grid-cols-3 items-center py-3 ${
                i % 2 === 1 ? "bg-gray-50 rounded-lg" : ""
              }`}
            >
              <span className="text-gray-600">{day.day_of_week}</span>
              <span className="text-gray-600">{day.is_closed ? "Closed" : day.open_time || "N/A"}</span>
              <span className="text-gray-600">{day.is_closed ? "Closed" : day.close_time || "N/A"}</span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No working hours set yet.</p>
            <p className="text-sm mt-1">Please set your pharmacy working hours.</p>
          </div>
        )}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
        <div>
          <h4 className="font-medium text-gray-800">Pharmacy Status</h4>
          <p className="text-sm text-gray-500">Temporarily closed</p>
        </div>
        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" />
          <div className="w-11 h-6 bg-gray-200 rounded-full peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
        </label>
      </div>
    </div>
  );
};

export default WorkingHoursTable;
