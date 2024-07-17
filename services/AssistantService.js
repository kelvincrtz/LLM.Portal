// services/AssistantService.js
let BASE_URL;

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
      const response = await $fetch(`${getBaseUrl()}/assistants`);
      return response.data; // Assuming response.data is an array of assistants
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