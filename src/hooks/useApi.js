import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../constants/config';
import { getCachedData, setCachedData, clearModelCache, clearAllCache } from '../utils/cacheUtils';

/**
 * Helper function to retry async operations with exponential backoff
 * @param {Function} fn - The async function to retry
 * @param {number} maxRetries - Maximum number of retries (default: 5)
 * @param {number} baseDelay - Base delay in milliseconds (default: 1000)
 * @returns {Promise} - Promise that resolves with the function result or rejects after max retries
 */
const retryWithBackoff = async (fn, maxRetries = 5, baseDelay = 1000) => {
  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on client errors (4xx) - these won't succeed on retry
      if (error.response && error.response.status >= 400 && error.response.status < 500) {
        throw error;
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff: baseDelay * 2^attempt + random jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
};

/**
 * Custom hook for API operations with common CRUD functionality
 * @param {string} model - The model name (tooling, operator, mesin)
 * @returns {object} - API operations and state
 */
export const useApi = (model) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const apiUrl = `${API_CONFIG.BASE_URL}/${model}`;

  // Fetch all data with enhanced caching and timestamp validation
  const fetchData = useCallback(async (forceRefresh = false) => {
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cachedData = await getCachedData(model);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const response = await retryWithBackoff(() => axios.get(`${apiUrl}/`));
      const responseData = response.data;

      // Cache the response
      setCachedData(model, responseData);
      setData(responseData);
    } catch (err) {
      setError(`Error fetching ${model}: ${err.message}`);
      console.error(`Error fetching ${model}:`, err);
    } finally {
      setLoading(false);
    }
  }, [apiUrl, model]);

  // Create new item
  const createItem = async (itemData) => {
    setError(null);
    try {
      const response = await retryWithBackoff(() => axios.post(`${apiUrl}/`, itemData));

      // Clear cache and refresh data
      clearModelCache(model);
      await fetchData(true); // Force refresh

      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = `Error adding ${model}: ${err.message}`;
      setError(errorMessage);

      // Handle validation errors
      if (err.response?.data?.detail) {
        const formErrors = err.response.data.detail.reduce((acc, error) => {
          acc[error.loc[1]] = error.msg;
          return acc;
        }, {});
        return { success: false, errors: formErrors };
      }

      return { success: false, message: errorMessage };
    }
  };

  // Update existing item
  const updateItem = async (id, itemData) => {
    setError(null);
    try {
      const response = await retryWithBackoff(() => axios.put(`${apiUrl}/${id}`, itemData));

      // Clear cache and refresh data
      clearModelCache(model);
      await fetchData(true); // Force refresh

      return { success: true, data: response.data };
    } catch (err) {
      const errorMessage = `Error updating ${model}: ${err.message}`;
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Delete item
  const deleteItem = async (id) => {
    setError(null);
    try {
      await retryWithBackoff(() => axios.delete(`${apiUrl}/${id}`));

      // Clear cache and refresh data
      clearModelCache(model);
      await fetchData(true); // Force refresh

      return { success: true };
    } catch (err) {
      const errorMessage = `Error deleting ${model}: ${err.message}`;
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Download barcode
  const downloadBarcode = async () => {
    setError(null);
    try {
      const response = await retryWithBackoff(() => axios.get(`${API_CONFIG.BASE_URL}/download-barcode/${model}/`, {
        responseType: 'blob',
      }));

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${model}_barcodes.xlsx`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();

      return { success: true };
    } catch (err) {
      const errorMessage = `Error downloading barcode: ${err.message}`;
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Upload CSV
  const uploadCsv = async (file) => {
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await retryWithBackoff(() => axios.post(`${apiUrl}/upload_csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }));

      // Clear cache and refresh data
      clearModelCache(model);
      await fetchData(true); // Force refresh

      return { success: true };
    } catch (err) {
      const errorMessage = `Error uploading CSV: ${err.message}`;
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Export CSV
  const exportCsv = async (exportFileName) => {
    setError(null);
    const exportUrl = `${API_CONFIG.BASE_URL}/export/csv?model=${model}`;

    try {
      const response = await retryWithBackoff(() => axios.get(exportUrl, {
        responseType: 'blob', // Important for file download
      }));

      // Create and trigger file download
      const filename = exportFileName ? `${exportFileName}.csv` : `${model}_export.csv`;
      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const fileLink = document.createElement('a');
      fileLink.href = fileURL;
      fileLink.setAttribute('download', filename);
      document.body.appendChild(fileLink);
      fileLink.click();
      fileLink.remove();
      window.URL.revokeObjectURL(fileURL);

      return { success: true };
    } catch (err) {
      const errorMessage = `Error exporting CSV: ${err.message}`;
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Generate barcode URL for individual record display
  const getBarcodeUrl = (recordId) => {
    if (!recordId) return null;

    // Determine model from recordId prefix or use current model
    let actualModel = model;
    if (recordId.startsWith('TL-')) actualModel = 'tooling';
    else if (recordId.startsWith('MC-')) actualModel = 'mesin';
    else if (recordId.startsWith('OP-')) actualModel = 'operator';

    // Use query parameters as expected by the backend API
    return `${API_CONFIG.BASE_URL}/barcode?model=${actualModel}&id=${encodeURIComponent(recordId)}&t=${Date.now()}`;
  };


  // Initialize data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Cache management utilities for this model
  const clearCache = useCallback(() => clearModelCache(model), [model]);
  const refreshData = useCallback(() => fetchData(true), [fetchData]);

  return {
    data,
    loading,
    error,
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    downloadBarcode,
    uploadCsv,
    exportCsv,
    getBarcodeUrl,
    // Cache management functions
    clearCache,
    refreshData,
    clearAllCache, // Global cache clear function
  };
};