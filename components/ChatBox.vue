<template>
    <div class="chat-container">
      <div class="chat-box">
        <div class="messages">
          <div v-for="(message, index) in messages" :key="index" :class="message.role">
            <p v-if="!isCodeBlock(message.content)" v-html="formatMessage(message.content)"></p>
            <pre v-else><code>{{ message.content }}</code></pre>
          </div>
        </div>
        <div class="input-box">
          <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." />
          <button @click="sendMessage">Send</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import chatGPTService from '~/services/CompletionService';
  
  export default {
    data() {
      return {
        messages: [],
        newMessage: ''
      };
    },
    methods: {
      async sendMessage() {
        if (this.newMessage.trim() === '') return;

        const userMessage = { role: 'user', content: this.newMessage };
        this.messages.push(userMessage);
        this.newMessage = '';
        
        try {
          const response = await chatGPTService.sendMessage(userMessage.content);
          const botMessageContent = response.choices && response.choices[0] && response.choices[0].message && response.choices[0].message.content;

          if (botMessageContent) {
            const botMessage = { role: 'assistant', content: botMessageContent };
            this.messages.push(botMessage);
          } else {
            console.error('Invalid response format:', response);
          }

        } catch (error) {
          console.error('Error fetching message:', error);
        }
      },
      formatMessage(message) {
        // Preserve spaces and line breaks
        return message.replace(/\n/g, '<br>').replace(/  /g, '&nbsp;&nbsp;');
      },
      isCodeBlock(message) {
        // Simple check for code blocks (can be improved based on your needs)
        return message.includes('```');
      }
    }
  };
  </script>
  
  <style scoped>
  .chat-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f0f0;
  }
  
  .chat-box {
    max-width: 800px; /* Increase max-width for a larger chat box */
    width: 100%;
    height: 90vh; /* Increase height for better use of screen space */
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  
  .messages {
    flex-grow: 1;
    padding: 20px;
    overflow-y: auto; /* Enable scrolling */
    display: flex;
    flex-direction: column;
    gap: 10px;
    background-color: #f9f9f9;
    word-wrap: break-word; /* Handle long words */
  }
  
  .user p,
  .user pre {
    align-self: flex-end;
    background-color: #e0f7fa;
    color: #00796b;
    padding: 10px;
    border-radius: 15px 15px 0 15px;
    margin: 0;
    white-space: pre-wrap; /* Preserve whitespace */
  }
  
  .assistant p,
  .assistant pre {
    align-self: flex-start;
    background-color: #333; /* Dark background for assistant */
    color: white; /* White text for contrast */
    padding: 10px;
    border-radius: 15px 15px 15px 0;
    margin: 0;
    white-space: pre-wrap; /* Preserve whitespace */
  }
  
  .input-box {
    display: flex;
    padding: 10px;
    border-top: 1px solid #ccc;
  }
  
  .input-box input {
    flex: 1;
    padding: 10px;
    border-radius: 20px;
    border: 1px solid #ccc;
    margin-right: 10px;
    outline: none;
    font-size: 16px;
  }
  
  .input-box button {
    padding: 10px 20px;
    border: none;
    background-color: #007bff;
    color: white;
    border-radius: 20px;
    cursor: pointer;
    font-size: 16px;
  }
  
  .input-box button:hover {
    background-color: #0056b3;
  }
  
  /* Code block styling */
  pre {
    background-color: #2d2d2d; /* Dark background for code blocks */
    color: #f8f8f2; /* Light color for code text */
    border-radius: 5px;
    padding: 10px;
    overflow-x: auto;
  }
  
  code {
    font-family: 'Courier New', Courier, monospace;
    white-space: pre;
  }
  </style>