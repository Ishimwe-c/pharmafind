import React from 'react';

/**
 * MedicineCard Component
 * 
 * Displays medicine information in a card format
 * Used in medicine listings and management interfaces
 * 
 * @param {Object} medicine - Medicine data object
 * @param {Function} onEdit - Callback function when edit button is clicked
 * @param {Function} onDelete - Callback function when delete button is clicked
 * @param {Function} onUpdateStock - Callback function when stock update is needed
 * @param {Boolean} showActions - Whether to show action buttons
 * @returns {JSX.Element} Medicine card component
 */
export default function MedicineCard({ 
  medicine, 
  onEdit, 
  onDelete, 
  onUpdateStock, 
  showActions = true 
}) {
  if (!medicine) return null;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
      minimumFractionDigits: 0
    }).format(price);
  };

  const getStockStatus = (quantity) => {
    if (quantity === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (quantity <= 10) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const stockStatus = getStockStatus(medicine.stock_quantity);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {medicine.name}
          </h3>
          {medicine.manufacturer && (
            <p className="text-sm text-gray-600 mb-2">
              by {medicine.manufacturer}
            </p>
          )}
        </div>
        
        {/* Prescription Badge */}
        {medicine.requires_prescription && (
          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            Prescription Required
          </span>
        )}
      </div>

      {/* Medicine Details */}
      <div className="space-y-3 mb-4">
        {/* Price and Stock */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-2xl font-bold text-teal-600">
              {formatPrice(medicine.price)}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stockStatus.color}`}>
              {stockStatus.text}
            </span>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-500">Stock</div>
            <div className="text-lg font-semibold text-gray-900">
              {medicine.stock_quantity}
            </div>
          </div>
        </div>

        {/* Category and Dosage */}
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          {medicine.category && (
            <div className="flex items-center">
              <span className="material-icons text-sm mr-1">category</span>
              {medicine.category}
            </div>
          )}
          {medicine.dosage_form && (
            <div className="flex items-center">
              <span className="material-icons text-sm mr-1">medication</span>
              {medicine.dosage_form}
            </div>
          )}
          {medicine.strength && (
            <div className="flex items-center">
              <span className="material-icons text-sm mr-1">straighten</span>
              {medicine.strength}
            </div>
          )}
        </div>

        {/* Description */}
        {medicine.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {medicine.description}
          </p>
        )}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex space-x-2">
            <button
              onClick={() => onUpdateStock && onUpdateStock(medicine)}
              className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center"
            >
              <span className="material-icons text-sm mr-1">inventory</span>
              Update Stock
            </button>
            <button
              onClick={() => onEdit && onEdit(medicine)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
            >
              <span className="material-icons text-sm mr-1">edit</span>
              Edit
            </button>
          </div>
          
          <button
            onClick={() => onDelete && onDelete(medicine)}
            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
          >
            <span className="material-icons text-sm mr-1">delete</span>
            Delete
          </button>
        </div>
      )}
    </div>
  );
}




