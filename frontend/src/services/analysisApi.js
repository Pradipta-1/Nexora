import api from './api';

export const analysisApi = {
  // Get live dashboard metrics
  getDashboardStats: async () => {
    const response = await api.get('/analysis/dashboard/stats');
    return response.data;
  },

  // Run full ML pattern discovery
  runAnalysis: async (datasetId, config) => {
    const response = await api.post(`/analysis/${datasetId}/run`, config);
    return response.data;
  },

  // Get analysis results
  getResults: async (analysisId) => {
    const response = await api.get(`/analysis/${analysisId}/results`);
    return response.data;
  },

  // Get patterns
  getPatterns: async (analysisId) => {
    const response = await api.get(`/analysis/${analysisId}/patterns`);
    return response.data;
  },

  // Get anomalies
  getAnomalies: async (analysisId) => {
    const response = await api.get(`/analysis/${analysisId}/anomalies`);
    return response.data;
  },

  // PDF report download URL
  getPdfReportUrl: (analysisId) => {
    return `${api.defaults.baseURL}/reports/${analysisId}/pdf`;
  },

  // CSV anomaly export URL
  getCsvExportUrl: (analysisId) => {
    return `${api.defaults.baseURL}/reports/${analysisId}/csv`;
  },
};
