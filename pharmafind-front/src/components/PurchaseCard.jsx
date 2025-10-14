import React from 'react';

/**
 * PurchaseCard Component
 * 
 * Displays individual purchase information in a card format
 * Shows patient details, medicines purchased, payment info, and actions
 * 
 * @param {Object} purchase - Purchase data object
 * @param {Function} onView - Callback when view button is clicked
 * @param {Function} onEdit - Callback when edit button is clicked
 * @param {Function} onDelete - Callback when delete button is clicked
 * @param {Boolean} showActions - Whether to show action buttons
 * @returns {JSX.Element} Purchase card component
 */
export default function PurchaseCard({ 
  purchase, 
  onView, 
  onEdit, 
  onDelete, 
  showActions = true 
}) {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'partially_paid':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'cash':
        return '💵';
      case 'insurance':
        return '🏥';
      case 'mixed':
        return '💳';
      default:
        return '💰';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Purchase #{purchase.purchase_number}
            </h3>
            <p className="text-sm text-gray-600">
              {formatDate(purchase.purchase_date)}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-gray-900">
              {formatCurrency(purchase.total_amount)}
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(purchase.payment_status)}`}>
              {purchase.payment_status.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="material-icons text-blue-600 text-lg">person</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {purchase.user?.name || 'Unknown Patient'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              {purchase.user?.email || 'No email'}
            </p>
            {purchase.user?.phone_number && (
              <p className="text-sm text-gray-500 truncate">
                {purchase.user.phone_number}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Purchase Details */}
      <div className="p-4 border-b border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-700">Payment Method</p>
            <p className="text-sm text-gray-900 flex items-center">
              <span className="mr-1">{getPaymentMethodIcon(purchase.payment_method)}</span>
              {purchase.payment_method.toUpperCase()}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Items Count</p>
            <p className="text-sm text-gray-900">
              {purchase.purchase_items?.length || 0} items
            </p>
          </div>
        </div>

        {/* Insurance Information */}
        {purchase.insurance && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-700">Insurance</p>
            <p className="text-sm text-gray-900">{purchase.insurance.name}</p>
          </div>
        )}

        {/* Payment Breakdown */}
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Amount:</span>
            <span className="font-medium">{formatCurrency(purchase.total_amount)}</span>
          </div>
          {purchase.insurance && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Insurance Coverage:</span>
              <span className={parseFloat(purchase.insurance_coverage || 0) > 0 ? 'text-green-600' : 'text-gray-500'}>
                {parseFloat(purchase.insurance_coverage || 0) > 0 ? '-' : ''}{formatCurrency(purchase.insurance_coverage || 0)}
              </span>
            </div>
          )}
          <div className="flex justify-between text-sm font-medium border-t border-gray-200 pt-1 mt-1">
            <span className="text-gray-700">Patient Payment:</span>
            <span className="text-teal-600">{formatCurrency(purchase.patient_payment)}</span>
          </div>
        </div>
      </div>

      {/* Medicines Preview */}
      {purchase.purchase_items && purchase.purchase_items.length > 0 && (
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-2">Medicines Purchased:</p>
          <div className="space-y-1">
            {purchase.purchase_items.slice(0, 3).map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span className="text-gray-600 truncate">
                  {item.quantity}x {item.medicine?.name}
                </span>
                <span className="text-gray-900 font-medium">
                  {formatCurrency(item.total_price)}
                </span>
              </div>
            ))}
            {purchase.purchase_items.length > 3 && (
              <p className="text-xs text-gray-500">
                +{purchase.purchase_items.length - 3} more items
              </p>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {purchase.notes && (
        <div className="p-4 border-b border-gray-200">
          <p className="text-sm font-medium text-gray-700">Notes</p>
          <p className="text-sm text-gray-600 mt-1">{purchase.notes}</p>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="p-4 bg-gray-50 rounded-b-lg">
          <div className="flex space-x-2">
            <button
              onClick={() => onView(purchase)}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
            >
              <span className="material-icons text-sm mr-1">visibility</span>
              View Details
            </button>
            <button
              onClick={() => onEdit(purchase)}
              className="flex-1 bg-gray-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors duration-200 flex items-center justify-center"
            >
              <span className="material-icons text-sm mr-1">edit</span>
              Edit
            </button>
            <button
              onClick={() => onDelete(purchase)}
              className="flex-1 bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors duration-200 flex items-center justify-center"
            >
              <span className="material-icons text-sm mr-1">delete</span>
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}





