<template>
    <div class="chat-container">
      <div class="chat-box">
        <div class="messages">
          <div v-for="(message, index) in messages" :key="index" :class="message.messagesWithRoleClasses">
            <p v-if="!isCodeBlock(message.content)" v-html="formatMessage(message.content)" :class="message.textClasses"></p>
            <pre v-else><code>{{ message.content }}</code></pre>
          </div>
        </div>
        <div class="input-box">
          <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." class="input-field">
          <button @click="sendMessage" class="send-button">Send</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import chatGPTService from '@/services/chatGPTService';
  
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
    },
    computed: {
      // Dynamically set Tailwind CSS classes based on message role
      messagesWithRoleClasses() {
        return this.messages.map(message => ({
          ...message,
          roleClasses: {
            'text-right': message.role === 'user',
            'text-left': message.role === 'assistant',
            'bg-blue-100': message.role === 'user',
            'text-blue-800': message.role === 'user',
            'rounded-r-lg': message.role === 'user',
            'bg-gray-800': message.role === 'assistant',
            'text-white': message.role === 'assistant',
            'rounded-l-lg': message.role === 'assistant',
            'p-4': true,
            'm-0': true,
            'whitespace-pre-wrap': true,
          }
        }));
      },
      // Dynamically set Tailwind CSS classes based on message text
      textClasses() {
        return message => ({
          'bg-blue-100 text-blue-800': message.role === 'user',
          'bg-gray-800 text-white': message.role === 'assistant'
        });
      }
    }
  };
  </script>
  
  <style scoped>
  .chat-container {
    @apply flex justify-center items-center h-screen bg-gray-100;
  }
  
  .chat-box {
    @apply max-w-screen-md w-full h-5/6 bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden flex flex-col;
  }
  
  .messages {
    @apply flex-grow p-6 overflow-y-auto bg-gray-200 gap-4 whitespace-normal;
  }
  .user p, .user pre {
    @apply self-end bg-blue-100 text-blue-800 rounded-r-lg p-4 m-0 whitespace-pre-wrap;
  }
  
  .assistant p, .assistant pre {
  @apply self-start bg-gray-800 text-white rounded-l-lg p-4 m-0 whitespace-pre-wrap;
}
  
  .input-box {
    @apply flex p-4 border-t border-gray-300;
  }
  
  .input-box input {
    @apply flex-1 py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring focus:ring-blue-200;
  }
  
  .input-box button {
    @apply py-2 px-6 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200;
  }
  
  .input-box button:hover {
    @apply bg-blue-600;
  }
  
  /* Code block styling */
  pre {
    @apply bg-gray-900 text-white rounded-lg p-4 overflow-x-auto;
  }
  
  code {
    @apply font-mono;
  }
  </style>