let BASE_URL;

function getBaseUrl() {
  if (!BASE_URL) {
    const config = useRuntimeConfig();
    BASE_URL = config.public.baseUrl;
  }
  return BASE_URL;
}


export default {
  async startNewThread(request) {
    try {
      const response = await $fetch(`${getBaseUrl()}/threads`, {
        method: 'POST',
        body: JSON.stringify(request),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error('Error creating new thread:', error);
      throw error;
    }
  },

  async continueThread(id, request) {
    try {
      const response = await $fetch(`${getBaseUrl()}/threads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(request),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response;
    } catch (error) {
      console.error(`Error continuing thread with ID ${id}:`, error);
      throw error;
    }
  },

  async deleteThread(id) {
    try {
      const response = await $fetch(`${getBaseUrl()}/threads/${id}`, {
        method: 'DELETE'
      });
      return response;
    } catch (error) {
      console.error(`Error deleting thread with ID ${id}:`, error);
      throw error;
    }
  },

  // messages
  async getThreadMessages(threadId) {
    try {
      const response = await $fetch(`${getBaseUrl()}/messages/${threadId}`);
      //console.log(response.message);
      return response;
    } catch (error) {
      console.error('Error listing message thread:', error);
      throw error; // Propagate the error back to the caller
    }
  },
};