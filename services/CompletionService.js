export default {
   // chat completions
    async sendMessage(message) {
      const { public: { apiKey } } = useRuntimeConfig();
      const uri = 'https://api.openai.com/v1/chat/completions';
  
      const data = {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: message }]
      };
  
      try {
        const response = await $fetch(uri, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: data
        });
  
        return response;
      } catch (error) {
        console.error('Error fetching message:', error);
        throw error;
      }
    }
    
  };