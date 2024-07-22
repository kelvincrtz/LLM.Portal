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
  async listVectorStores() {
    try {
      const response = await $fetch(`${getBaseUrl()}/vector_stores`);
      return response;
    } catch (error) {
      console.error('Error fetching vector stores:', error);
      throw error; // Propagate the error back to the caller
    }
  },
};