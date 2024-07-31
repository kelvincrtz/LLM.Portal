let BASE_URL;

const VECTOR_STORES_CACHE_KEY = 'vector-store-cache';
const VECTOR_FILES_CACHE_KEY = 'vector-file-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getBaseUrl() {
  if (!BASE_URL) {
    const config = useRuntimeConfig();
    BASE_URL = config.public.baseUrl;
  }
  return BASE_URL;
}

function getCachedData(key) {
  const cachedData = localStorage.getItem(key);
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    const now = new Date().getTime();
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  return null;
}

function updateCache(key, data) {
  if (data) {
    localStorage.setItem(key, JSON.stringify({ data, timestamp: new Date().getTime() }));
  } else {
    console.error('Attempted to update cache with invalid data:', data);
  }
}

export default {
  async listVectorStores() {
    try {
      // Check if the data is in cache and still valid
      const cachedData = getCachedData(VECTOR_STORES_CACHE_KEY);
      if (cachedData) {
        return cachedData;
      }

      // Fetch new data if no valid cache is found
      const response = await $fetch(`${getBaseUrl()}/vector_stores`);
      const data = response.message;

      // Store the new data in localStorage with a timestamp
      updateCache(VECTOR_STORES_CACHE_KEY, data);

      return data;
    } catch (error) {
      console.error('Error fetching vector stores:', error);
      throw error; // Propagate the error back to the caller
    }
  },

  async listVectorFiles() {
    try {
      // Check if the data is in cache and still valid
      const cachedData = getCachedData(VECTOR_FILES_CACHE_KEY);
      if (cachedData) {
        return cachedData;
      }

      // Fetch new data if no valid cache is found
      const data = await $fetch(`${getBaseUrl()}/files`);

      // Store the new data in localStorage with a timestamp
      updateCache(VECTOR_FILES_CACHE_KEY, data);

      return data;
    } catch (error) {
      console.error('Error fetching vector files:', error);
      throw error; // Propagate the error back to the caller
    }
  },
};