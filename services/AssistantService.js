// services/AssistantService.js
let BASE_URL;

const CACHE_KEY = 'assistants-cache';
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function getBaseUrl() {
  if (!BASE_URL) {
    const config = useRuntimeConfig();
    BASE_URL = config.public.baseUrl;
  }
  return BASE_URL;
}


export default {
  async getAllAssistants() {
    try {
      // Check if the data is in localStorage and still valid
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data, timestamp } = JSON.parse(cachedData);
        const now = new Date().getTime();
        if (now - timestamp < CACHE_DURATION) {
          return data;
        }
      }

      // Fetch new data if no valid cache is found
      const response = await $fetch(`${getBaseUrl()}/assistants`);
      const data = response.data;

      // Store the new data in localStorage with a timestamp
      localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: new Date().getTime() }));

      return data;
    } catch (error) {
      console.error('Error fetching assistants:', error);
      throw error; // Propagate the error back to the caller
    }
  },

  async createAssistant(newAssistant) {
    try {
      const response = await $fetch(`${getBaseUrl()}/assistants`, {
        method: 'POST',
        body: JSON.stringify(newAssistant),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data; // Assuming response.data contains the newly created assistant
    } catch (error) {
      console.error('Error creating assistant:', error);
      throw error; // Propagate the error back to the caller
    }
  },

  async updateAssistant(id, updatedAssistant) {
    try {
      const response = await $fetch(`${getBaseUrl()}/assistants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedAssistant),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response.data; // Assuming response.data contains the updated assistant
    } catch (error) {
      console.error(`Error updating assistant with ID ${id}:`, error);
      throw error; // Propagate the error back to the caller
    }
  },

  async deleteAssistant(id) {
    try {
      const response = await $fetch(`${getBaseUrl()}/assistants/${id}`, {
        method: 'DELETE'
      });
      return response.data; // Assuming response.data contains success/failure message
    } catch (error) {
      console.error(`Error deleting assistant with ID ${id}:`, error);
      throw error; // Propagate the error back to the caller
    }
  }
};