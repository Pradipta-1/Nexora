import api from './api';

export const datasetApi = {
  // Upload a CSV or Excel file
  upload: async (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/datasets/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onUploadProgress(percent);
        }
      },
    });
    return response.data;
  },

  // Load sample dataset
  loadSample: async (sampleName = 'customer_segments') => {
    const response = await api.post(`/datasets/load-sample?sample_name=${sampleName}`);
    return response.data;
  },

  // List all datasets
  list: async () => {
    const response = await api.get('/datasets');
    return response.data;
  },

  // Get dataset metadata
  getById: async (datasetId) => {
    const response = await api.get(`/datasets/${datasetId}`);
    return response.data;
  },

  // Get preview rows
  getPreview: async (datasetId) => {
    const response = await api.get(`/datasets/${datasetId}/preview`);
    return response.data;
  },

  // Get data profile
  getProfile: async (datasetId) => {
    const response = await api.get(`/datasets/${datasetId}/profile`);
    return response.data;
  },

  // Delete dataset
  delete: async (datasetId) => {
    const response = await api.delete(`/datasets/${datasetId}`);
    return response.data;
  },
};
