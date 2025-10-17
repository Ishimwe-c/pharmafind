import React, { useState } from 'react';

/**
 * StockUpdateModal Component
 * 
 * Modal for updating medicine stock quantities
 * Supports add, subtract, and set operations
 * 
 * @param {Object} medicine - Medicine to update stock for
 * @param {Boolean} isOpen - Whether modal is open
 * @param {Function} onClose - Callback function when modal is closed
 * @param {Function} onUpdate - Callback function when stock is updated
 * @param {Boolean} loading - Whether update is in progress
 * @returns {JSX.Element} Stock update modal component
 */
export default function StockUpdateModal({ 
  medicine, 
  isOpen, 
  onClose, 
  onUpdate, 
  loading = false 
}) {
  const [operation, setOperation] = useState('add');
  const [quantity, setQuantity] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!quantity || quantity < 0) {
      setError('Please enter a valid quantity');
      return;
    }

    if (operation === 'subtract' && parseInt(quantity) > medicine.stock_quantity) {
      setError(`Cannot subtract ${quantity} from current stock of ${medicine.stock_quantity}`);
      return;
    }

    onUpdate({
      operation,
      quantity: parseInt(quantity)
    });
  };

  const handleClose = () => {
    setOperation('add');
    setQuantity('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Update Stock
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="material-icons">close</span>
            </button>
          </div>

          {/* Medicine Info */}
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900">{medicine.name}</h4>
            <p className="text-sm text-gray-600">
              Current Stock: <span className="font-semibold">{medicine.stock_quantity}</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Operation Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Operation
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="add"
                    checked={operation === 'add'}
                    onChange={(e) => setOperation(e.target.value)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Add to stock</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="subtract"
                    checked={operation === 'subtract'}
                    onChange={(e) => setOperation(e.target.value)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Subtract from stock</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="set"
                    checked={operation === 'set'}
                    onChange={(e) => setOperation(e.target.value)}
                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm text-gray-700">Set exact quantity</span>
                </label>
              </div>
            </div>

            {/* Quantity Input */}
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                  setError('');
                }}
                min="0"
                step="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Enter quantity"
                required
              />
            </div>

            {/* Preview */}
            {quantity && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Preview:</span> Stock will be{' '}
                  {operation === 'add' && `${medicine.stock_quantity} + ${quantity} = ${medicine.stock_quantity + parseInt(quantity)}`}
                  {operation === 'subtract' && `${medicine.stock_quantity} - ${quantity} = ${medicine.stock_quantity - parseInt(quantity)}`}
                  {operation === 'set' && `set to ${quantity}`}
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-transparent rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                Update Stock
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}










