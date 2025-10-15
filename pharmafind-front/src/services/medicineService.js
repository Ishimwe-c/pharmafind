import axiosClient from '../axios-client';

/**
 * Medicine Service
 * 
 * Handles all API calls related to medicine management
 * Used by pharmacy owners to manage their medicine inventory
 */

export const medicineService = {
  // Get all medicines with optional filters
  getMedicines: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.pharmacy_id) queryParams.append('pharmacy_id', params.pharmacy_id);
    if (params.category) queryParams.append('category', params.category);
    if (params.search) queryParams.append('search', params.search);
    if (params.in_stock) queryParams.append('in_stock', params.in_stock);
    if (params.page) queryParams.append('page', params.page);
    if (params.per_page) queryParams.append('per_page', params.per_page);

    const response = await axiosClient.get(`/medicines?${queryParams.toString()}`);
    return response.data;
  },

  // Get a specific medicine by ID
  getMedicine: async (id) => {
    const response = await axiosClient.get(`/medicines/${id}`);
    return response.data;
  },

  // Create a new medicine
  createMedicine: async (medicineData) => {
    const response = await axiosClient.post('/medicines', medicineData);
    return response.data;
  },

  // Update an existing medicine
  updateMedicine: async (id, medicineData) => {
    const response = await axiosClient.put(`/medicines/${id}`, medicineData);
    return response.data;
  },

  // Delete a medicine
  deleteMedicine: async (id) => {
    const response = await axiosClient.delete(`/medicines/${id}`);
    return response.data;
  },

  // Get medicine categories
  getCategories: async () => {
    const response = await axiosClient.get('/medicines/categories');
    return response.data;
  },

  // Update stock quantity
  updateStock: async (id, stockData) => {
    const response = await axiosClient.post(`/medicines/${id}/stock`, stockData);
    return response.data;
  },

  // Search medicines
  searchMedicines: async (searchTerm, filters = {}) => {
    const params = { search: searchTerm, ...filters };
    return medicineService.getMedicines(params);
  },

  // Get medicines by category
  getMedicinesByCategory: async (category, pharmacyId = null) => {
    const params = { category };
    if (pharmacyId) params.pharmacy_id = pharmacyId;
    return medicineService.getMedicines(params);
  },

  // Get low stock medicines
  getLowStockMedicines: async (threshold = 10, pharmacyId = null) => {
    const params = pharmacyId ? { pharmacy_id: pharmacyId } : {};
    const medicines = await medicineService.getMedicines(params);
    return medicines.data.filter(medicine => 
      medicine.stock_quantity > 0 && medicine.stock_quantity <= threshold
    );
  },

  // Get out of stock medicines
  getOutOfStockMedicines: async (pharmacyId = null) => {
    const params = { in_stock: false };
    if (pharmacyId) params.pharmacy_id = pharmacyId;
    return medicineService.getMedicines(params);
  }
};









