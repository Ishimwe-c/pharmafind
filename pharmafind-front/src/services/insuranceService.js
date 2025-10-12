import axiosClient from '../axios-client';

/**
 * Insurance Service
 * 
 * Handles all API calls related to patient insurance management
 * Used by patients to manage their insurance information
 */

export const insuranceService = {
  // Get patient's insurances
  getPatientInsurances: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    if (params.user_id) queryParams.append('user_id', params.user_id);
    if (params.active_only !== undefined) queryParams.append('active_only', params.active_only);

    const response = await axiosClient.get(`/patient-insurances?${queryParams.toString()}`);
    return response.data;
  },

  // Get a specific patient insurance by ID
  getPatientInsurance: async (id) => {
    const response = await axiosClient.get(`/patient-insurances/${id}`);
    return response.data;
  },

  // Add a new insurance to patient profile
  addPatientInsurance: async (insuranceData) => {
    const response = await axiosClient.post('/patient-insurances', insuranceData);
    return response.data;
  },

  // Update patient insurance information
  updatePatientInsurance: async (id, insuranceData) => {
    const response = await axiosClient.put(`/patient-insurances/${id}`, insuranceData);
    return response.data;
  },

  // Remove insurance from patient profile
  removePatientInsurance: async (id) => {
    const response = await axiosClient.delete(`/patient-insurances/${id}`);
    return response.data;
  },

  // Get available insurances that patient doesn't have
  getAvailableInsurances: async () => {
    const response = await axiosClient.get('/patient-insurances/available');
    return response.data;
  },

  // Check insurance coverage for a specific pharmacy
  checkCoverage: async (pharmacyId) => {
    const response = await axiosClient.post(`/patient-insurances/check-coverage/${pharmacyId}`);
    return response.data;
  },

  // Get all available insurance providers
  getAllInsurances: async () => {
    const response = await axiosClient.get('/insurances');
    return response.data;
  },

  // Get active insurances only
  getActiveInsurances: async () => {
    return insuranceService.getPatientInsurances({ active_only: true });
  },

  // Get inactive insurances only
  getInactiveInsurances: async () => {
    return insuranceService.getPatientInsurances({ active_only: false });
  },

  // Check if patient has specific insurance
  hasInsurance: async (insuranceId) => {
    const insurances = await insuranceService.getPatientInsurances();
    return insurances.data.some(insurance => insurance.id === insuranceId);
  },

  // Get insurances that match with a pharmacy
  getMatchingInsurances: async (pharmacyId) => {
    const coverage = await insuranceService.checkCoverage(pharmacyId);
    return coverage.data.matching_insurances || [];
  }
};




