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

function getCachedData() {
  const cachedData = localStorage.getItem(CACHE_KEY);
  if (cachedData) {
    const { data, timestamp } = JSON.parse(cachedData);
    const now = new Date().getTime();
    if (now - timestamp < CACHE_DURATION) {
      return data;
    }
  }
  return null;
}

function updateCache(data) {
  localStorage.setItem(CACHE_KEY, JSON.stringify({ data, timestamp: new Date().getTime() }));
}

export default {
  async getAllAssistants() {
    try {
      const cachedData = getCachedData();
      if (cachedData) {
        return cachedData;
      }

      const response = await $fetch(`${getBaseUrl()}/assistants`);
      const data = response.data;

      updateCache(data);
      return data;
    } catch (error) {
      console.error('Error fetching assistants:', error);
      throw error;
    }
  },

  async createAssistant(newAssistant) {
    try {
      const createdAssistant = await $fetch(`${getBaseUrl()}/assistants`, {
        method: 'POST',
        body: JSON.stringify(newAssistant),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const cachedData = getCachedData();
      if (cachedData) {
        const updatedData = [createdAssistant, ...cachedData];
        updateCache(updatedData);
      } else {
        updateCache([createdAssistant]);
      }

      return createdAssistant;
    } catch (error) {
      console.error('Error creating assistant:', error);
      throw error;
    }
  },

  async updateAssistant(id, updatedAssistant) {
    try {
      const updatedAssistantData = await $fetch(`${getBaseUrl()}/assistants/${id}`, {
        method: 'PUT',
        body: JSON.stringify(updatedAssistant),
        headers: {
          'Content-Type': 'application/json'
        }
      });

      const cachedData = getCachedData();
      if (cachedData) {
        const updatedData = cachedData.map(assistant =>
          assistant.id === id ? updatedAssistantData : assistant
        );
        updateCache(updatedData);
      }

      return updatedAssistantData;
    } catch (error) {
      console.error(`Error updating assistant with ID ${id}:`, error);
      throw error;
    }
  },

  async deleteAssistant(id) {
    try {
      await $fetch(`${getBaseUrl()}/assistants/${id}`, { method: 'DELETE' });

      const cachedData = getCachedData();
      if (cachedData) {
        const updatedData = cachedData.filter(assistant => assistant.id !== id);
        updateCache(updatedData);
      }
    } catch (error) {
      console.error('Error deleting assistant:', error);
      throw error;
    }
  }
};