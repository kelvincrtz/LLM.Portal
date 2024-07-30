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

function updateCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: new Date().getTime() }));
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
      updateCache(data);

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
  
      // Get the current cached data
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data } = JSON.parse(cachedData);
  
         // Add the newly created assistant to the beginning of the cached data
        const updatedData = [response, ...data];
  
        // Update the cache with the new data
        updateCache(updatedData);
  
        console.log('Cache updated with new assistant:', updatedData); // Debugging statement
      } else {
        // If no cache exists, create it
        updateCache([response]);
      }
      return response; // Assuming response.data contains the newly created assistant
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
      
      // Get the current cached data
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data } = JSON.parse(cachedData);

        // Update the assistant in the cached data
        const updatedData = data.map(assistant =>
          assistant.id === id ? response : assistant
        );

        // Update the cache with the new data
        updateCache(updatedData);
      }

      return response; // Assuming response.data contains the updated assistant
    } catch (error) {
      console.error(`Error updating assistant with ID ${id}:`, error);
      throw error; // Propagate the error back to the caller
    }
  },

  async deleteAssistant(id) {
    try {
      // Make the delete request
      await $fetch(`${getBaseUrl()}/assistants/${id}`, { method: 'DELETE' });

      // Get the current cached data
      const cachedData = localStorage.getItem(CACHE_KEY);
      if (cachedData) {
        const { data } = JSON.parse(cachedData);

        // Remove the deleted assistant from the cached data
        const updatedData = data.filter(assistant => assistant.id !== id);

        // Update the cache with the new data
        updateCache(updatedData);
      }
    } catch (error) {
      console.error('Error deleting assistant:', error);
      throw error; // Propagate the error back to the caller
    }
  }
};