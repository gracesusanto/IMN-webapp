import axios from 'axios';
import { API_CONFIG } from '../constants/config';

/**
 * Client-Side Cache Management Utilities
 * Enhanced with timestamp-based validation for intelligent cache invalidation
 */

const CACHE_PREFIX = 'imn_cache_';

// Enable debug logging only in development
const DEBUG_CACHE = process.env.NODE_ENV === 'development' && process.env.REACT_APP_CACHE_DEBUG === 'true';

// In-memory cache for current session
const memoryCache = new Map();

// Cache configuration per model type with intelligent timestamp validation
const CACHE_CONFIG = {
  tooling: {
    ttl: 10 * 60 * 1000, // 10 minutes - tooling data changes less frequently
    persistToLocalStorage: true,
    useTimestampValidation: true
  },
  mesin: {
    ttl: 10 * 60 * 1000, // 10 minutes - mesin data changes less frequently
    persistToLocalStorage: true,
    useTimestampValidation: true
  },
  operator: {
    ttl: 15 * 60 * 1000, // 15 minutes - operator data changes least frequently
    persistToLocalStorage: true,
    useTimestampValidation: true
  },
  default: {
    ttl: 2 * 60 * 1000, // 2 minutes - shorter TTL for other data
    persistToLocalStorage: false,
    useTimestampValidation: false
  }
};

/**
 * Get cache configuration for a specific model
 * @param {string} model - Model name
 * @returns {object} Cache configuration
 */
export const getCacheConfig = (model) => {
  return CACHE_CONFIG[model.toLowerCase()] || CACHE_CONFIG.default;
};

/**
 * Generate cache key for a model
 * @param {string} model - Model name
 * @param {object} params - Additional parameters for cache key
 * @returns {string} Cache key
 */
export const getCacheKey = (model, params = {}) => {
  const paramString = Object.keys(params).length > 0 ?
    '_' + JSON.stringify(params).replace(/[{}":]/g, '') : '';
  return `${CACHE_PREFIX}${model}${paramString}`;
};

/**
 * Get latest timestamps from server for cache validation
 * @param {string} model - Model name
 * @returns {object|null} Server timestamps or null if request fails
 */
export const getServerTimestamps = async (model) => {
  try {
    const response = await axios.get(`${API_CONFIG.BASE_URL}/timestamps/${model}`);
    return {
      latest_created: new Date(response.data.latest_created).getTime(),
      latest_updated: new Date(response.data.latest_updated).getTime(),
    };
  } catch (error) {
    if (DEBUG_CACHE) console.warn(`⚠️ Failed to fetch timestamps for ${model}:`, error.message);
    return null;
  }
};

/**
 * Get cached data with TTL and timestamp validation
 * @param {string} model - Model name
 * @param {object} params - Additional parameters
 * @returns {any|null} Cached data or null if cache miss/invalid
 */
export const getCachedData = async (model, params = {}) => {
  const cacheKey = getCacheKey(model, params);
  const config = getCacheConfig(model);

  // Check memory cache first
  let cached = null;
  if (memoryCache.has(cacheKey)) {
    cached = memoryCache.get(cacheKey);
  } else if (config.persistToLocalStorage) {
    // Check localStorage cache
    try {
      const cachedString = localStorage.getItem(cacheKey);
      if (cachedString) {
        cached = JSON.parse(cachedString);
        // Also store in memory for faster subsequent access
        memoryCache.set(cacheKey, cached);
      }
    } catch (error) {
      if (DEBUG_CACHE) console.warn('Error reading from localStorage cache:', error);
    }
  }

  if (!cached) {
    return null;
  }

  // Check TTL expiry first
  if (Date.now() - cached.timestamp > config.ttl) {
    memoryCache.delete(cacheKey);
    if (config.persistToLocalStorage) {
      try {
        localStorage.removeItem(cacheKey);
      } catch (error) {
        if (DEBUG_CACHE) console.warn('Error removing expired cache:', error);
      }
    }
    return null;
  }

  // For models with timestamp validation, check server timestamps
  if (config.useTimestampValidation) {
    const serverTimestamps = await getServerTimestamps(model);
    if (serverTimestamps) {
      const cacheTimestamp = cached.timestamp;
      const serverLatest = Math.max(serverTimestamps.latest_created, serverTimestamps.latest_updated);

      if (serverLatest > cacheTimestamp) {
        memoryCache.delete(cacheKey);
        if (config.persistToLocalStorage) {
          try {
            localStorage.removeItem(cacheKey);
          } catch (error) {
            if (DEBUG_CACHE) console.warn('Error removing stale cache:', error);
          }
        }
        return null;
      }
    }
    // If timestamp check fails, continue with TTL-based cache (no additional logging needed)
  }

  return cached.data;
};

/**
 * Set cached data with timestamp
 * @param {string} model - Model name
 * @param {any} data - Data to cache
 * @param {object} params - Additional parameters
 */
export const setCachedData = (model, data, params = {}) => {
  const cacheKey = getCacheKey(model, params);
  const config = getCacheConfig(model);
  const cacheEntry = {
    data: data,
    timestamp: Date.now(),
    ttl: config.ttl
  };

  // Always store in memory
  memoryCache.set(cacheKey, cacheEntry);

  // Store in localStorage if enabled
  if (config.persistToLocalStorage) {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cacheEntry));
    } catch (error) {
      if (DEBUG_CACHE) console.warn('Error writing to localStorage cache:', error);
    }
  }
};

/**
 * Clear cache for a specific model
 * @param {string} model - Model name to clear cache for
 */
export const clearModelCache = (model) => {
  const pattern = getCacheKey(model);

  // Clear memory cache
  for (const key of memoryCache.keys()) {
    if (key.startsWith(pattern)) {
      memoryCache.delete(key);
    }
  }

  // Clear localStorage cache
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(pattern)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    if (DEBUG_CACHE) console.warn('Error clearing localStorage cache:', error);
  }
};

/**
 * Clear all cache (memory + localStorage)
 */
export const clearAllCache = () => {
  // Clear memory cache
  memoryCache.clear();

  // Clear localStorage cache
  try {
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    if (DEBUG_CACHE) console.warn('Error clearing all cache:', error);
  }
};

/**
 * Get cache statistics for debugging
 * @returns {object} Cache statistics
 */
export const getCacheStats = () => {
  const memoryStats = { size: memoryCache.size, entries: Array.from(memoryCache.keys()) };

  let localStorageStats = { size: 0, entries: [] };
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(CACHE_PREFIX)) {
        localStorageStats.size++;
        localStorageStats.entries.push(key);
      }
    }
  } catch (error) {
    if (DEBUG_CACHE) console.warn('Error reading localStorage stats:', error);
  }

  return {
    memory: memoryStats,
    localStorage: localStorageStats,
    config: CACHE_CONFIG
  };
};

/**
 * Export the in-memory cache for external access (debugging)
 */
export { memoryCache };