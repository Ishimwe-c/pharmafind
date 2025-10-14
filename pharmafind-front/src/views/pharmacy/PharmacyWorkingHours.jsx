// src/pages/pharmacy/WorkingHours.jsx
// This component allows pharmacy owners to manage their working hours
// It loads current hours, allows editing, and saves changes to the backend

import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext"; // For authentication token
import axiosClient from "../../axios-client"; // For API calls with automatic token handling

// Custom Time Picker Component - Forces 24-hour format
const CustomTimePicker = ({ value, onChange, placeholder = "Select time" }) => {
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");

  // Generate time options
  const hourOptions = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  );
  const minuteOptions = Array.from({ length: 60 }, (_, i) => 
    i.toString().padStart(2, '0')
  );

  // Initialize with current value
  useEffect(() => {
    if (value && value.includes(':')) {
      const parts = value.split(':');
      const h = parts[0].padStart(2, '0');
      const m = parts[1]?.padStart(2, '0') || '00';
      setHours(h);
      setMinutes(m);
    }
  }, [value]);

  // Handle time change
  const handleTimeChange = (newHours, newMinutes) => {
    const timeString = `${newHours}:${newMinutes}`;
    onChange(timeString);
  };

  return (
    <div className="flex items-center space-x-1">
      {/* Hours dropdown */}
      <select
        value={hours}
        onChange={(e) => {
          setHours(e.target.value);
          handleTimeChange(e.target.value, minutes);
        }}
        className="w-14 text-center bg-white border border-gray-300 rounded-md py-1.5 px-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm font-medium"
      >
        {hourOptions.map(hour => (
          <option key={hour} value={hour}>{hour}</option>
        ))}
      </select>
      
      <span className="text-gray-500 text-lg font-medium">:</span>
      
      {/* Minutes dropdown */}
      <select
        value={minutes}
        onChange={(e) => {
          setMinutes(e.target.value);
          handleTimeChange(hours, e.target.value);
        }}
        className="w-14 text-center bg-white border border-gray-300 rounded-md py-1.5 px-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition text-sm font-medium"
      >
        {minuteOptions.map(minute => (
          <option key={minute} value={minute}>{minute}</option>
        ))}
      </select>
    </div>
  );
};

export default function WorkingHours() {
  // Get authentication token from context
  const { token } = useAuth();

  // Default working hours structure (will be replaced with actual data)
  const defaultHours = {
    Monday: { open: "09:00", close: "18:00", closed: false },
    Tuesday: { open: "09:00", close: "18:00", closed: false },
    Wednesday: { open: "09:00", close: "18:00", closed: false },
    Thursday: { open: "09:00", close: "18:00", closed: false },
    Friday: { open: "09:00", close: "18:00", closed: false },
    Saturday: { open: "10:00", close: "16:00", closed: false },
    Sunday: { open: "09:00", close: "17:00", closed: true },
  };

  // State management for working hours and UI
  const [hours, setHours] = useState(defaultHours);
  const [originalHours, setOriginalHours] = useState(defaultHours); // To track changes
  const [status, setStatus] = useState(false); // pharmacy open/closed status
  const [loading, setLoading] = useState(false); // Loading state during save
  const [initialLoading, setInitialLoading] = useState(true); // Loading state while fetching data
  const [message, setMessage] = useState(null); // Success message
  const [error, setError] = useState(null); // Error message

  // Load current pharmacy working hours when component mounts
  useEffect(() => {
    const fetchWorkingHours = async () => {
      try {
        // Fetch current pharmacy data which includes working hours
        const res = await axiosClient.get("/pharmacy/my-pharmacy");
        const pharmacy = res.data;
        
        // Extract working hours from pharmacy data
        if (pharmacy.working_hours && pharmacy.working_hours.length > 0) {
          const workingHours = {};
          
          // Convert backend format to frontend format
          pharmacy.working_hours.forEach(wh => {
            // Strip seconds from time if present (HH:MM:SS -> HH:MM)
            // Also ensures proper padding (9:00 -> 09:00)
            const formatTime = (timeStr) => {
              if (!timeStr) return null;
              try {
                const parts = timeStr.split(':');
                if (parts.length < 2) return null;
                const hours = parts[0].padStart(2, '0');
                const minutes = parts[1].padStart(2, '0');
                return `${hours}:${minutes}`; // Return only HH:MM with padding
              } catch (error) {
                return null;
              }
            };
            
            workingHours[wh.day_of_week] = {
              open: formatTime(wh.open_time) || "09:00",
              close: formatTime(wh.close_time) || "18:00",
              closed: !!wh.is_closed  // Convert to boolean
            };
          });
          
          // Fill in missing days with defaults
          Object.keys(defaultHours).forEach(day => {
            if (!workingHours[day]) {
              workingHours[day] = { ...defaultHours[day] };
            }
          });
          
          setHours(workingHours);
          setOriginalHours(workingHours);
        }
        
        // Set pharmacy status
        setStatus(pharmacy.is_open || false);
        
      } catch (err) {
        console.error("Error fetching working hours:", err);
        setError("Failed to load current working hours");
      } finally {
        setInitialLoading(false);
      }
    };

    // Only fetch data if we have a valid authentication token
    if (token) {
      fetchWorkingHours();
    } else {
      setInitialLoading(false);
    }
  }, [token]);

  // Handle time input changes
  const handleChange = (day, field, value) => {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  // Toggle closed status for a specific day
  const toggleClosed = (day) => {
    setHours((prev) => ({
      ...prev,
      [day]: { 
        ...prev[day], 
        closed: !prev[day].closed,
        // Clear time values when marking as closed
        open: !prev[day].closed ? "" : "09:00",
        close: !prev[day].closed ? "" : "18:00"
      },
    }));
  };

  // Validate time format (HH:MM)
  const validateTime = (time) => {
    if (!time) return false;
    // Accept both single and double digit hours/minutes (9:00 or 09:00)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time.trim());
  };

  // Check if there are unsaved changes
  const hasChanges = () => {
    return JSON.stringify(hours) !== JSON.stringify(originalHours);
  };

  // Save working hours changes to the backend
  const handleSave = async () => {
    // Validate all time inputs before saving
    const validationErrors = [];
    
    Object.entries(hours).forEach(([day, dayHours]) => {
      if (!dayHours.closed) {
        if (!dayHours.open || !dayHours.close) {
          validationErrors.push(`${day}: Both open and close times are required`);
        } else if (!validateTime(dayHours.open)) {
          validationErrors.push(`${day}: Invalid open time format (use HH:MM)`);
        } else if (!validateTime(dayHours.close)) {
          validationErrors.push(`${day}: Invalid close time format (use HH:MM)`);
        } else if (dayHours.open >= dayHours.close) {
          validationErrors.push(`${day}: Close time must be after open time`);
        }
      }
    });
    
    if (validationErrors.length > 0) {
      setError("Please fix the following errors:\n" + validationErrors.join("\n"));
      return;
    }

    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      // Get the current pharmacy ID first
      const pharmacyRes = await axiosClient.get("/pharmacy/my-pharmacy");
      const pharmacyId = pharmacyRes.data.id;
      
             // Convert frontend format to backend format
       const workingHours = Object.entries(hours).map(([day, dayHours]) => ({
         day_of_week: day,
         open_time: dayHours.closed ? null : dayHours.open, // Send HH:MM format directly
         close_time: dayHours.closed ? null : dayHours.close, // Send HH:MM format directly
         closed: dayHours.closed
       }));
      
             // Update the pharmacy with new working hours
       console.log("Sending working hours to backend:", workingHours);
       const res = await axiosClient.put(`/pharmacy/${pharmacyId}`, {
         working_hours: workingHours
       });
       
       setMessage("Working hours updated successfully!");
       console.log("Updated working hours:", res.data);
      
      // Update original hours to reflect saved state
      setOriginalHours({ ...hours });
      
      // Auto-clear success message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    } catch (err) {
      console.error("Error saving working hours:", err);
      setError(err.response?.data?.message || "Failed to save working hours");
    } finally {
      setLoading(false);
    }
  };

  // Show loading skeleton while fetching initial data
  if (initialLoading) {
    return (
      <div className="p-10 flex-1">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3"></div>
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[1, 2].map((section) => (
                <div key={section}>
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <div key={item} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-10 flex-1">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-4xl font-bold text-gray-800">Working Hours</h2>
          <p className="text-gray-600 mt-2">
            Set your pharmacy's operating hours for each day of the week
          </p>
        </div>
        
        {/* Quick stats */}
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">
            {Object.values(hours).filter(day => !day.closed).length}
          </div>
          <div className="text-sm text-gray-500">Days Open</div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Information section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <span className="material-icons text-blue-600 mr-2 mt-0.5">info</span>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Working Hours Management:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Set specific opening and closing times for each day</li>
                <li>Mark days as closed when your pharmacy doesn't operate</li>
                <li>24-hour format (HH:MM) - e.g., 09:00, 18:00</li>
                <li>Custom time picker ensures consistent 24-hour display</li>
                <li>Changes are saved automatically when you click "Save Changes"</li>
              </ul>
            </div>
          </div>
        </div>
        
                 {/* All Days in One Clean Grid */}
         <div className="space-y-3">
                       {/* Header Row */}
            <div className="grid grid-cols-6 gap-4 p-3 bg-gray-100 rounded-lg font-medium text-gray-700 text-sm">
              <div className="text-center">Day</div>
              <div className="text-center">Status</div>
              <div className="text-center">Open Time</div>
              <div className="text-center">-</div>
              <div className="text-center">Close Time</div>
              <div className="text-center">Actions</div>
            </div>
           
           {/* Days Rows */}
           {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
             <div
               key={day}
               className={`grid grid-cols-6 gap-4 p-4 rounded-lg border transition-colors duration-200 ${
                 hours[day].closed 
                   ? "bg-red-50 border-red-200" 
                   : "bg-gray-50 border-gray-200 hover:bg-gray-100"
               }`}
             >
               {/* Day Name */}
               <div className="flex items-center">
                 <span className={`font-medium ${
                   hours[day].closed ? "text-red-600" : "text-gray-700"
                 }`}>
                   {day}
                 </span>
               </div>
               
               {/* Status */}
               <div className="flex items-center justify-center">
                 {hours[day].closed ? (
                   <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">
                     Closed
                   </span>
                 ) : (
                   <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">
                     Open
                   </span>
                 )}
               </div>
               
               {/* Open Time */}
               <div className="flex items-center justify-center">
                 {hours[day].closed ? (
                   <span className="text-gray-400 text-sm">--</span>
                 ) : (
                   <div className="flex flex-col items-center">
                     <label className="text-xs text-gray-500 mb-1">Open</label>
                     <CustomTimePicker
                       value={hours[day].open}
                       onChange={(value) => handleChange(day, "open", value)}
                     />
                   </div>
                 )}
               </div>
               
               {/* Separator */}
               <div className="flex items-center justify-center">
                 <span className="text-gray-400 text-lg">-</span>
               </div>
               
               {/* Close Time */}
               <div className="flex items-center justify-center">
                 {hours[day].closed ? (
                   <span className="text-gray-400 text-sm">--</span>
                 ) : (
                   <div className="flex flex-col items-center">
                     <label className="text-xs text-gray-500 mb-1">Close</label>
                     <CustomTimePicker
                       value={hours[day].close}
                       onChange={(value) => handleChange(day, "close", value)}
                     />
                   </div>
                 )}
               </div>
               
               {/* Actions */}
               <div className="flex items-center justify-center">
                 {hours[day].closed ? (
                   <button
                     onClick={() => toggleClosed(day)}
                     className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline px-3 py-1 rounded border border-blue-200 hover:bg-blue-50 transition-colors"
                   >
                     Set Hours
                   </button>
                 ) : (
                   <button
                     onClick={() => toggleClosed(day)}
                     className="text-red-500 hover:text-red-600 text-sm font-medium hover:underline px-3 py-1 rounded border border-red-200 hover:bg-red-50 transition-colors"
                   >
                     Close
                   </button>
                 )}
               </div>
             </div>
           ))}
         </div>

        {/* Pharmacy status */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="text-lg font-semibold text-gray-700">Pharmacy Status</h4>
              <p className="text-gray-500 text-sm">
                {status ? "Your pharmacy is currently open for business" : "Your pharmacy is temporarily closed"}
              </p>
            </div>
            <label className="flex items-center cursor-pointer">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={status}
                  onChange={() => setStatus(!status)}
                  className="sr-only"
                />
                <div
                  className={`block w-14 h-8 rounded-full transition-colors duration-200 ${
                    status ? "bg-green-500" : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`dot absolute left-1 top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-200 ${
                    status ? "translate-x-6" : ""
                  }`}
                ></div>
              </div>
            </label>
          </div>
          
          {/* Status indicator */}
          <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${
            status 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${
              status ? "bg-green-500" : "bg-red-500"
            }`}></span>
            {status ? "Open" : "Closed"}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex justify-between items-center">
          <button
            onClick={() => {
              setHours({ ...originalHours });
              setError(null);
              setMessage(null);
            }}
            disabled={!hasChanges()}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-icons mr-2">refresh</span>
            Reset Changes
          </button>
          
          <button
            onClick={handleSave}
            disabled={loading || !hasChanges()}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2 inline-block"></div>
                Saving...
              </>
            ) : (
              <>
                <span className="material-icons mr-2">save</span>
                Save Changes
              </>
            )}
          </button>
        </div>

        {/* Success Message Display */}
        {message && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <span className="material-icons text-green-600 mr-2">check_circle</span>
              <p className="text-green-800 font-medium">{message}</p>
            </div>
          </div>
        )}

        {/* Error Message Display */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="material-icons text-red-600 mr-2">error</span>
              <p className="text-red-800 font-medium whitespace-pre-line">{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
