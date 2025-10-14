import React, { useState, useEffect, useRef } from 'react';
import { purchaseService } from '../services/purchaseService';
import { insuranceService } from '../services/insuranceService';

/**
 * PurchaseReportPrint Component
 * 
 * Generate and print purchase reports filtered by date and/or insurance
 * Provides detailed breakdown of sales, medicines sold, and financial summaries
 */
const PurchaseReportPrint = () => {
  const [filters, setFilters] = useState({
    date_from: new Date().toISOString().split('T')[0], // Today
    date_to: new Date().toISOString().split('T')[0],
    insurance_id: '',
    report_type: 'detailed'
  });

  const [reportData, setReportData] = useState(null);
  const [insurances, setInsurances] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef();

  // Load insurances on mount
  useEffect(() => {
    loadInsurances();
  }, []);

  const loadInsurances = async () => {
    try {
      const response = await insuranceService.getInsurances();
      if (response && Array.isArray(response)) {
        setInsurances(response);
      } else if (response && response.data && Array.isArray(response.data)) {
        setInsurances(response.data);
      }
    } catch (err) {
      console.error('Error loading insurances:', err);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuickDate = (type) => {
    const today = new Date();
    let dateFrom, dateTo;

    switch (type) {
      case 'today':
        dateFrom = dateTo = today.toISOString().split('T')[0];
        break;
      case 'yesterday':
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        dateFrom = dateTo = yesterday.toISOString().split('T')[0];
        break;
      case 'this_week':
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        dateFrom = startOfWeek.toISOString().split('T')[0];
        dateTo = today.toISOString().split('T')[0];
        break;
      case 'this_month':
        dateFrom = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
        dateTo = today.toISOString().split('T')[0];
        break;
      case 'last_month':
        const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        dateFrom = firstDayLastMonth.toISOString().split('T')[0];
        dateTo = lastDayLastMonth.toISOString().split('T')[0];
        break;
      default:
        return;
    }

    setFilters(prev => ({
      ...prev,
      date_from: dateFrom,
      date_to: dateTo
    }));
  };

  const generateReport = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await purchaseService.getPrintableReport(filters);
      
      if (response && response.success) {
        setReportData(response.data);
        setShowPreview(true);
      } else {
        setError('Failed to generate report');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError(err.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6 print:space-y-0 print:block">
      {/* Filters Section - Hidden in print */}
      <div className="bg-white rounded-lg shadow-sm p-6 print:hidden">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Purchase Report Generator</h2>
        
        {/* Quick Date Filters */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Quick Date Selection</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleQuickDate('today')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => handleQuickDate('yesterday')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Yesterday
            </button>
            <button
              onClick={() => handleQuickDate('this_week')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              This Week
            </button>
            <button
              onClick={() => handleQuickDate('this_month')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              This Month
            </button>
            <button
              onClick={() => handleQuickDate('last_month')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              Last Month
            </button>
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">From Date *</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">To Date *</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              min={filters.date_from}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Insurance Filter */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Insurance (Optional)
          </label>
          <select
            value={filters.insurance_id}
            onChange={(e) => handleFilterChange('insurance_id', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
          >
            <option value="">All Insurances</option>
            {insurances.map((insurance) => (
              <option key={insurance.id} value={insurance.id}>
                {insurance.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Leave empty to see all purchases, or select an insurance to filter
          </p>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={generateReport}
            disabled={loading || !filters.date_from || !filters.date_to}
            className="px-6 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Generating...
              </>
            ) : (
              <>
                <span className="material-icons text-sm mr-2">description</span>
                Generate Report
              </>
            )}
          </button>
          
          {reportData && (
            <button
              onClick={handlePrint}
              className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors flex items-center"
            >
              <span className="material-icons text-sm mr-2">print</span>
              Print Report
            </button>
          )}
        </div>
      </div>

      {/* Report Preview - Print-friendly */}
      {reportData && showPreview && (
        <div ref={printRef} className="bg-white rounded-lg shadow-sm p-8 print:shadow-none print:p-0">
          <PrintableReport reportData={reportData} />
        </div>
      )}
    </div>
  );
};

/**
 * PrintableReport Component
 * 
 * The actual printable report layout
 */
const PrintableReport = ({ reportData }) => {
  const { pharmacy, report_info, insurance_filter, summary, medicines_sold, category_breakdown, insurance_breakdown, purchases } = reportData;

  const formatCurrency = (amount) => {
    return `$${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="print:text-black">
      {/* Header */}
      <div className="border-b-2 border-gray-300 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{pharmacy.name}</h1>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Address:</strong> {pharmacy.location}</p>
          <p><strong>Phone:</strong> {pharmacy.phone_number}</p>
          <p><strong>Email:</strong> {pharmacy.email}</p>
        </div>
      </div>

      {/* Report Title and Info */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Report</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Report Period:</strong> {report_info.date_from} to {report_info.date_to}</p>
            {insurance_filter && (
              <p><strong>Insurance Filter:</strong> {insurance_filter.name}</p>
            )}
          </div>
          <div className="text-right">
            <p><strong>Generated:</strong> {formatDate(report_info.generated_at)}</p>
            <p><strong>Generated By:</strong> {report_info.generated_by}</p>
          </div>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg print:border print:border-gray-300">
            <p className="text-sm text-gray-600">Total Purchases</p>
            <p className="text-2xl font-bold text-gray-900">{summary.total_purchases}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg print:border print:border-gray-300">
            <p className="text-sm text-gray-600">Total Revenue</p>
            <p className="text-2xl font-bold text-teal-600">{formatCurrency(summary.total_revenue)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg print:border print:border-gray-300">
            <p className="text-sm text-gray-600">Avg. Purchase Value</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(summary.average_purchase_value)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg print:border print:border-gray-300">
            <p className="text-sm text-gray-600">Insurance Coverage</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(summary.total_insurance_coverage)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg print:border print:border-gray-300">
            <p className="text-sm text-gray-600">Patient Payments</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(summary.total_patient_payments)}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg print:border print:border-gray-300">
            <p className="text-sm text-gray-600">Coverage %</p>
            <p className="text-2xl font-bold text-gray-900">{summary.insurance_coverage_percentage}%</p>
          </div>
        </div>
      </div>

      {/* Top Medicines Sold */}
      {medicines_sold && medicines_sold.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3 page-break-after-avoid">Top Medicines Sold</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead className="print-table-header">
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">#</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Medicine Name</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Category</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Quantity Sold</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {medicines_sold.slice(0, 10).map((medicine, index) => (
                <tr key={medicine.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                  <td className="border border-gray-300 px-4 py-2 font-medium">{medicine.name}</td>
                  <td className="border border-gray-300 px-4 py-2">{medicine.category || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{medicine.quantity}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right font-semibold">{formatCurrency(medicine.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Insurance Breakdown */}
      {insurance_breakdown && insurance_breakdown.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3 page-break-after-avoid">Insurance Breakdown</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead className="print-table-header">
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Insurance</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Purchases</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Total Amount</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Coverage</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Patient Payment</th>
              </tr>
            </thead>
            <tbody>
              {insurance_breakdown.map((ins, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 font-medium">{ins.insurance_name}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{ins.purchase_count}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(ins.total_amount)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-purple-600 font-semibold">{formatCurrency(ins.insurance_coverage)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right text-blue-600 font-semibold">{formatCurrency(ins.patient_payment)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detailed Purchase List */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-3 page-break-after-avoid">Detailed Purchase Records</h3>
        {purchases && purchases.length > 0 ? (
          <div className="space-y-4">
            {purchases.map((purchase) => (
              <div key={purchase.id} className="border border-gray-300 rounded-lg p-4 print-purchase-item">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-semibold text-gray-900">Purchase #{purchase.purchase_number}</p>
                    <p className="text-sm text-gray-600">{formatDate(purchase.purchase_date)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-teal-600">{formatCurrency(purchase.total_amount)}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      purchase.payment_status === 'paid' ? 'bg-green-100 text-green-800' :
                      purchase.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {purchase.payment_status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                  <div>
                    <p><strong>Patient:</strong> {purchase.patient_name}</p>
                    <p><strong>Insurance:</strong> {purchase.insurance}</p>
                  </div>
                  <div>
                    <p><strong>Payment Method:</strong> {purchase.payment_method}</p>
                    <p><strong>Insurance Coverage:</strong> {formatCurrency(purchase.insurance_coverage)}</p>
                    <p><strong>Patient Payment:</strong> {formatCurrency(purchase.patient_payment)}</p>
                  </div>
                </div>

                {/* Items */}
                {purchase.items && purchase.items.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Items:</p>
                    <table className="w-full text-sm border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-200 px-2 py-1 text-left">Medicine</th>
                          <th className="border border-gray-200 px-2 py-1 text-left">Category</th>
                          <th className="border border-gray-200 px-2 py-1 text-right">Qty</th>
                          <th className="border border-gray-200 px-2 py-1 text-right">Unit Price</th>
                          <th className="border border-gray-200 px-2 py-1 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {purchase.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="border border-gray-200 px-2 py-1">{item.medicine_name}</td>
                            <td className="border border-gray-200 px-2 py-1">{item.category || 'N/A'}</td>
                            <td className="border border-gray-200 px-2 py-1 text-right">{item.quantity}</td>
                            <td className="border border-gray-200 px-2 py-1 text-right">{formatCurrency(item.unit_price)}</td>
                            <td className="border border-gray-200 px-2 py-1 text-right font-semibold">{formatCurrency(item.total_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-center py-8">No purchases found for the selected period.</p>
        )}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-gray-300 pt-4 mt-6 text-center text-sm text-gray-600">
        <p>© {new Date().getFullYear()} {pharmacy.name}. All rights reserved.</p>
        <p>This is an automatically generated report. For any discrepancies, please contact the pharmacy.</p>
      </div>
    </div>
  );
};

export default PurchaseReportPrint;




