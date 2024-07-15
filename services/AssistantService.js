const BASE_URL = 'http://localhost:7100/api'; // Base URL of your local API TODO: Change this later

export default {
  async getAllAssistants() {
    try {
      const response = await $fetch(`${BASE_URL}/assistants`);
      return response.data; // Assuming response.data is an array of assistants
    } catch (error) {
      console.error('Error fetching assistants:', error);
      throw error; // Propagate the error back to the caller
    }
  },

  async createAssistant(newAssistant) {
    try {
      const response = await $fetch(`${BASE_URL}/assistants`, {
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
      const response = await $fetch(`${BASE_URL}/assistants/${id}`, {
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
      const response = await $fetch(`${BASE_URL}/assistants/${id}`, {
        method: 'DELETE'
      });
      return response.data; // Assuming response.data contains success/failure message
    } catch (error) {
      console.error(`Error deleting assistant with ID ${id}:`, error);
      throw error; // Propagate the error back to the caller
    }
  }
};