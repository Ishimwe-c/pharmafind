import React from 'react';

/**
 * InsuranceCard Component
 * 
 * Displays patient insurance information in a card format
 * Used in insurance listings and management interfaces
 * 
 * @param {Object} insurance - Insurance data object with pivot information
 * @param {Function} onEdit - Callback function when edit button is clicked
 * @param {Function} onDelete - Callback function when delete button is clicked
 * @param {Boolean} showActions - Whether to show action buttons
 * @returns {JSX.Element} Insurance card component
 */
export default function InsuranceCard({ 
  insurance, 
  onEdit, 
  onDelete, 
  showActions = true 
}) {
  if (!insurance) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const isExpired = (endDate) => {
    if (!endDate) return false;
    return new Date(endDate) < new Date();
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {insurance.name}
          </h3>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(insurance.pivot?.is_active)}`}>
              {getStatusText(insurance.pivot?.is_active)}
            </span>
            {isExpired(insurance.pivot?.coverage_end_date) && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Expired
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Insurance Details */}
      <div className="space-y-3 mb-4">
        {/* Policy Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insurance.pivot?.policy_number && (
            <div>
              <div className="text-sm text-gray-500">Policy Number</div>
              <div className="text-sm font-medium text-gray-900">
                {insurance.pivot.policy_number}
              </div>
            </div>
          )}
          
          {insurance.pivot?.member_id && (
            <div>
              <div className="text-sm text-gray-500">Member ID</div>
              <div className="text-sm font-medium text-gray-900">
                {insurance.pivot.member_id}
              </div>
            </div>
          )}
        </div>

        {/* Coverage Dates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-gray-500">Coverage Start</div>
            <div className="text-sm font-medium text-gray-900">
              {formatDate(insurance.pivot?.coverage_start_date)}
            </div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">Coverage End</div>
            <div className="text-sm font-medium text-gray-900">
              {formatDate(insurance.pivot?.coverage_end_date)}
            </div>
          </div>
        </div>

        {/* Notes */}
        {insurance.pivot?.notes && (
          <div>
            <div className="text-sm text-gray-500">Notes</div>
            <div className="text-sm text-gray-900">
              {insurance.pivot.notes}
            </div>
          </div>
        )}

        {/* Registration Date */}
        <div className="text-xs text-gray-500">
          Added on {formatDate(insurance.pivot?.created_at)}
        </div>
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => onEdit && onEdit(insurance)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <span className="material-icons text-sm mr-1">edit</span>
              Edit
            </button>
          </div>
          
          <button
            onClick={() => onDelete && onDelete(insurance)}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
          >
            <span className="material-icons text-sm mr-1">delete</span>
            Remove
          </button>
        </div>
      )}
    </div>
  );
}




