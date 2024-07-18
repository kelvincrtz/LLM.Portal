// services/FileService.js
let BASE_URL;

function getBaseUrl() {
  if (!BASE_URL) {
    const config = useRuntimeConfig();
    BASE_URL = config.public.baseUrl;
  }
  return BASE_URL;
}


export default {
  async uploadFile(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'assistants');

      const response = await $fetch(`${getBaseUrl()}/files/upload`, {
        method: 'POST',
        body: formData,
        headers: {
          // Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, // Replace with your actual API key
        },
      });

      return response; // Assuming response.data contains the newly created file
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  },

  async listFiles() {
    try {
      const response = await $fetch(`${getBaseUrl()}/api/files`, {
        headers: {
          // Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });

      return response; // Assuming response.data is an array
    } catch (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
  },

  async getFile(fileId) {
    try {
      const response = await $fetch(`${getBaseUrl()}/api/files/${fileId}`, {
        headers: {
          // Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });

      return response; // Assuming response.data contains the file
    } catch (error) {
      console.error('Error fetching file:', error);
      throw error;
    }
  },

  async deleteFile(fileId) {
    try {
      const response = await $fetch(`${getBaseUrl()}/${fileId}`, {
        method: 'DELETE',
        headers: {
          // Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      });

      return response; // Assuming response.data contains success/failure message
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  },
};