// services/AssistantService.js
let BASE_URL;

const VECTOR_STORES_CACHE_KEY = 'vector-store-cache';
const VECTOR_FILES_CACHE_KEY = 'vector-file-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours'

function getBaseUrl() {
  if (!BASE_URL) {
    const config = useRuntimeConfig();
    BASE_URL = config.public.baseUrl;
  }
  return BASE_URL;
}


export default {
  async listVectorStores() {
    try {
      // Check if the data is in localStorage and still valid
      const cachedData = localStorage.getItem(VECTOR_STORES_CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = new Date().getTime();
        if (now - timestamp < CACHE_DURATION) {
          return data;
        }
      }

      const response = await $fetch(`${getBaseUrl()}/vector_stores`);
      const data = response.message;

      // Store the new data in localStorage with a timestamp
      localStorage.setItem(VECTOR_STORES_CACHE_KEY, JSON.stringify({ data, timestamp: new Date().getTime() }));
      return data;
    } catch (error) {
      console.error('Error fetching vector stores:', error);
      throw error; // Propagate the error back to the caller
    }
  },

  async listVectorFiles() {
    try {
      // Check if the data is in localStorage and still valid
      const cachedData = localStorage.getItem(VECTOR_FILES_CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = new Date().getTime();
        if (now - timestamp < CACHE_DURATION) {
          return data;
        }
      }

      const data = await $fetch(`${getBaseUrl()}/files`);

      // Store the new data in localStorage with a timestamp
      localStorage.setItem(VECTOR_FILES_CACHE_KEY, JSON.stringify({ data, timestamp: new Date().getTime() }));
      return data;
    } catch (error) {
      console.error('Error fetching vector files:', error);
      throw error; // Propagate the error back to the caller
    }
  },
};