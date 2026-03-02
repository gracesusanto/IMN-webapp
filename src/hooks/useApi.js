import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { API_CONFIG } from '../constants/config';

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

  // Fetch all data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiUrl}/`);
      setData(response.data);
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
      const response = await axios.post(`${apiUrl}/`, itemData);
      await fetchData(); // Refresh data
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
      const response = await axios.put(`${apiUrl}/${id}`, itemData);
      await fetchData(); // Refresh data
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
      await axios.delete(`${apiUrl}/${id}`);
      await fetchData(); // Refresh data
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
      const response = await axios.get(`${API_CONFIG.BASE_URL}/download-barcode/${model}/`, {
        responseType: 'blob',
      });

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
      await axios.post(`${apiUrl}/upload_csv`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await fetchData(); // Refresh data
      return { success: true };
    } catch (err) {
      const errorMessage = `Error uploading CSV: ${err.message}`;
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Initialize data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  };
};