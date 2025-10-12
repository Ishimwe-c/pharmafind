import axiosClient from '../axios-client';

/**
 * Purchase Service
 * 
 * Handles all API calls related to purchase management
 * Used by pharmacy owners to track patient purchases
 */

export const purchaseService = {
  // Get all purchases with optional filters
  getPurchases: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.pharmacy_id) queryParams.append('pharmacy_id', params.pharmacy_id);
    if (params.patient_id) queryParams.append('patient_id', params.patient_id);
    if (params.insurance_id) queryParams.append('insurance_id', params.insurance_id);
    if (params.payment_status) queryParams.append('payment_status', params.payment_status);
    if (params.date_from) queryParams.append('date_from', params.date_from);
    if (params.date_to) queryParams.append('date_to', params.date_to);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);

    const response = await axiosClient.get(`/purchases?${queryParams.toString()}`);
    return response.data;
  },

  // Get a specific purchase by ID
  getPurchase: async (id) => {
    const response = await axiosClient.get(`/purchases/${id}`);
    return response.data;
  },

  // Create a new purchase
  createPurchase: async (purchaseData) => {
    const response = await axiosClient.post('/purchases', purchaseData);
    return response.data;
  },

  // Update an existing purchase
  updatePurchase: async (id, purchaseData) => {
    const response = await axiosClient.put(`/purchases/${id}`, purchaseData);
    return response.data;
  },

  // Delete a purchase
  deletePurchase: async (id) => {
    const response = await axiosClient.delete(`/purchases/${id}`);
    return response.data;
  },

  // Get purchase reports for pharmacy
  getPharmacyReports: async (pharmacyId, filters = {}) => {
    const params = { pharmacy_id: pharmacyId, ...filters };
    return purchaseService.getPurchases(params);
  },

  // Get purchase reports by insurance
  getInsuranceReports: async (insuranceId, filters = {}) => {
    const params = { insurance_id: insuranceId, ...filters };
    return purchaseService.getPurchases(params);
  },

  // Get purchase statistics
  getPurchaseStats: async (pharmacyId, period = 'month') => {
    const response = await axiosClient.get(`/purchases/reports/pharmacy?pharmacy_id=${pharmacyId}&period=${period}`);
    return response.data;
  },

  // Search purchases
  searchPurchases: async (searchTerm, filters = {}) => {
    const params = { search: searchTerm, ...filters };
    return purchaseService.getPurchases(params);
  },

  // Get purchases by date range
  getPurchasesByDateRange: async (startDate, endDate, filters = {}) => {
    const params = { 
      date_from: startDate, 
      date_to: endDate, 
      ...filters 
    };
    return purchaseService.getPurchases(params);
  },

  // Get top selling medicines
  getTopSellingMedicines: async (pharmacyId, limit = 10) => {
    const response = await axiosClient.get(`/purchases/reports/top-medicines?pharmacy_id=${pharmacyId}&limit=${limit}`);
    return response.data;
  },

  // Get purchase summary
  getPurchaseSummary: async (pharmacyId, period = 'month') => {
    const response = await axiosClient.get(`/purchases/reports/summary?pharmacy_id=${pharmacyId}&period=${period}`);
    return response.data;
  }
};




