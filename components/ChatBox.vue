<template>
  <div class="chat-container">
    <div class="chat-box">
      <!-- Assistant and Threads View -->
      <div class="left-sidebar">
        <!-- Assistant View -->
        <div class="assistant-view">
          <h2 class="text-xl font-semibold mb-4">Assistants</h2>
          <ul>
            <li 
              v-for="assistant in paginatedAssistants" 
              :key="assistant.id" 
              @click="selectAssistant(assistant)"
              :class="{'selected': selectedAssistant && selectedAssistant.id === assistant.id}"
              class="cursor-pointer p-2 mb-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              <h3 class="font-medium">
                {{ assistant.name ? assistant.name : 'Name undefined' }}
              </h3>
              <p class="text-sm text-gray-500">{{ assistant.model }}</p>
            </li>
          </ul>
          <Pagination 
            :current-page="assistantPage" 
            :total-pages="assistantTotalPages" 
            @page-changed="changeAssistantPage"
          />
        </div>

        <!-- Threads View -->
        <div class="threads-view">
          <h2 class="text-xl font-semibold mb-4">Threads</h2>
          <ul>
            <li 
              v-for="thread in paginatedThreads" 
              :key="thread.id" 
              @click="selectThread(thread)"
              :class="{'selected': selectedThread && selectedThread.id === thread.id}"
              class="cursor-pointer p-2 mb-2 border border-gray-300 rounded hover:bg-gray-100"
            >
              <h3 class="font-medium">{{ thread.name }}</h3>
              <p class="text-sm text-gray-500">{{ thread.description }}</p>
            </li>
          </ul>
          <Pagination 
            :current-page="threadPage" 
            :total-pages="threadTotalPages" 
            @page-changed="changeThreadPage"
          />
        </div>
      </div>

      <!-- Chat Content -->
      <div class="chat-content">
        <!-- Selected Assistant Name -->
        <div class="chat-header p-4 border-b border-gray-300">
          <h2 class="text-xl font-semibold">
            {{ selectedAssistant ? selectedAssistant.name : 'No Assistant Selected' }}
          </h2>
        </div>
        
        <!-- Messages -->
        <div ref="messagesContainer" class="messages">
          <div v-for="(message, index) in messages" :key="index" :class="message.role">
            <p v-html="formatMessage(message.content)"></p>
            <!-- If you have specific handling for code blocks, you can adjust this part -->
            <!-- <pre v-if="isCodeBlock(message.content)"><code>{{ message.content }}</code></pre> -->
          </div>
        </div>
        
        <!-- Input Box -->
        <div class="input-box">
          <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." class="input-field" />
          <div class="action-buttons">
            <button @click="sendMessage" class="send-button">Send</button>
            <button @click="triggerFileInput" class="file-button">+</button>
            <input type="file" ref="fileInput" @change="handleFileUpload" class="file-input" />
          </div>
        </div>

      </div>
    </div>
  </div>
</template>
  <script>
  import AssistantService from '@/services/AssistantService';
  import ThreadService from '@/services/ThreadService';
  import Pagination from './Pagination.vue';

  export default {
    components: {
      Pagination,
    },

    data() {
      return {
        newMessage: '',
        messages: [],
        assistants: [
          { id: 'asst_dFN2Ws0M7YbhWjXEyIqifYpQ', name: 'Assistant 1', description: 'Description of Assistant 1' },
          { id: 'asst_RdiEte1pFnR77JuUBEpGtrJA', name: 'Assistant 2', description: 'Rain Assistant 2' },
          { id: '', name: 'Assistant 3', description: 'Description of Assistant 3' },
          { id: '', name: 'Assistant 4', description: 'Description of Assistant 4' },
          { id: '', name: 'Assistant 5', description: 'Description of Assistant 5' },
          // Add more assistants as needed
        ],
        threads: [
          { id: 'thread_q5N8EIG7wNaztUhPcnpLtCCA', name: 'Thread with data', description: 'Description of Thread 1 with data' },
          { id: 'thread_ySUjQDaLklC3RPOjrDk7BT3q', name: 'About weather thread', description: 'Description of Thread 2 data' },
          { id: 'thread_BsHPvqkm5MwlLiBagex4jGqz', name: 'About NZ weather', description: 'Description of Thread 3 data' },
          // Add more threads as needed
        ],

        assistantPage: 1,
        threadPage: 1,
        pageSize: 5,

        selectedAssistant: null,
        selectedThread: null,

        file: null,
      };
    },

    async created() {
      await this.loadAssistants();
      await this.loadThreads();
    },

    methods: {
      async sendMessage() {
        if (this.newMessage.trim() === '') return;

        if (!this.selectedAssistant) {
            console.error('No assistant selected.');
            return;
        }

        // Create the request payload
        const requestPayload = {
            role: 'user',
            content: this.newMessage,
            assistant_id: this.selectedAssistant.id, // Include the selected assistant ID
            model: 'gpt-3.5-turbo' // TODO: 
        };

        // Add the user message to the messages array
        const userMessage = {
            role: 'user',
            content: this.newMessage
        };
        this.messages.push(userMessage);
        this.newMessage = ''; // Clear the input field
        this.file = null; // Clear the file input

        try {
          let response;

          if (this.selectedThread) {
              // Continue the existing thread
              response = await ThreadService.continueThread(this.selectedThread.id, requestPayload);
          } else {
              // Create a new thread
              response = await ThreadService.startNewThread(requestPayload);

              // After creating a new thread, set it as the selected thread
              this.selectedThread = response.thread; // Assuming the API response contains the new thread details
              
              // Optionally, update your messages to include the initial response
              const initialMessage = {
                  role: response.initialMessage.role,
                  content: response.initialMessage.content
              };
              this.messages.push(initialMessage);
          }

          console.log('API Response:', response); // Log the response to inspect it

          // Handle the response format correctly
          if (response && response.content && response.content.length > 0) {
              const botMessageData = response; // Directly use the response

              // Extract content from the array
              const botMessageContent = botMessageData.content.map(item => item.text.value).join(' ');
              const botMessage = {
                  role: botMessageData.role,
                  content: botMessageContent
              };

              // Add the bot message to the messages array
              this.messages.push(botMessage);
          } else {
              console.error('Invalid response format:', response);
          }
          } catch (error) {
              console.error('Error sending message:', error);
          }
      },

      formatMessage(message) {
        if (Array.isArray(message)) {
          // Join array content into a single string
          message = message.map(item => item.text.value).join(' ');
        }

        // Convert new lines and spaces into HTML
        return message.replace(/\n/g, '<br>').replace(/  /g, '&nbsp;&nbsp;');
      },

      isCodeBlock(message) {
        // return message.startsWith('```') && content.endsWith('```');
        // Implement logic if you have specific markers for code blocks
        // For this example, assume it's not a code block
        // return false;
      },

      selectThread(thread) {
        this.selectedThread = thread;
        // Load messages for the selected thread
        this.loadThreadMessages(thread.id); // Load messages for the selected thread
      },

      async loadThreadMessages(threadId) {
        try {
          const response = await ThreadService.getThreadMessages(threadId);
          this.messages = response.message;
        } catch (error) {
          console.error('Error loading thread messages:', error);
        }
      },
      
      //changeAssistantPage(page) {
      //  console.log('Changing Assistant Page to:', page); // Debug message
      //  this.assistantPage = page;
      //},

      changeThreadPage(page) {
        console.log('Changing Thread Page to:', page); // Debug message
        this.threadPage = page;
      },

      handleFileUpload(event) {
        const file = event.target.files[0];
        if (file) {
          this.file = file;
        }
      },

      triggerFileInput() {
        this.$refs.fileInput.click();
      },

      async loadAssistants() {
        const allAssistants = await AssistantService.getAllAssistants();
        this.assistants = allAssistants;
        this.updatePagination();
      },
      
      updatePagination() {
        // Update paginated assistants based on current page
        const start = (this.assistantPage - 1) * 10; // Assuming 10 per page
        const end = start + 10;
        this.paginatedAssistants = this.assistants.slice(start, end);
        this.assistantTotalPages = Math.ceil(this.assistants.length / 10);
      },

      updateThreadPagination() {
        const start = (this.threadPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        this.paginatedThreads = this.threads.slice(start, end);
        this.threadTotalPages = Math.ceil(this.threads.length / this.pageSize);
      },

      selectAssistant(assistant) {
        this.selectedAssistant = assistant;
      },

      changeAssistantPage(page) {
        this.assistantPage = page;
        this.updatePagination();
      },

      scrollToBottom() {
        const messagesContainer = this.$refs.messagesContainer;
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      },
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
      },
      paginatedAssistants() {
        const start = (this.assistantPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.assistants.slice(start, end);
      },
      assistantTotalPages() {
        return Math.ceil(this.assistants.length / this.pageSize);
      },
      paginatedThreads() {
        const start = (this.threadPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.threads.slice(start, end);
      },
      threadTotalPages() {
        return Math.ceil(this.threads.length / this.pageSize);
      },
    },
    
    updated() {
        this.scrollToBottom();
      }
  };
  </script>
  
  <style scoped>
  .chat-container {
    @apply flex justify-center items-center h-screen bg-gray-100;
  }

  .chat-box {
    width: 90%;
    height: 90%;
    @apply bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden flex;
  }

  .left-sidebar {
    @apply w-1/3 p-4 border-r border-gray-300 overflow-y-auto bg-gray-100 flex flex-col;
  }
  
  .assistant-view, .threads-view {
    @apply flex-1;
  }
  
  .assistant-view ul, .threads-view ul {
    @apply list-none p-0;
  }
  
  .assistant-view li, .threads-view li {
    @apply cursor-pointer p-2 mb-2 border border-gray-300 rounded hover:bg-gray-100;
  }
  
  .assistant-view li.selected, .threads-view li.selected {
    @apply bg-gray-200;
  }
  
  .chat-content {
    @apply flex flex-col flex-1;
  }
  
  .chat-header {
    @apply bg-white;
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
    @apply flex items-center p-4 border-t border-gray-300;
  }
  
  .input-box .input-field {
    @apply flex-1 py-2 px-4 rounded-full border border-gray-300 focus:outline-none focus:ring focus:ring-blue-200;
  }
  
  .input-box .action-buttons {
    @apply flex items-center gap-2 ml-4;
  }
  
  .input-box .send-button {
    @apply py-2 px-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200;
  }
  
  .input-box .file-button {
    @apply py-2 px-4 bg-blue-500 text-white rounded-full hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200;
  }
  
  input[type="file"] {
    @apply hidden;
  }
  
  /* Code block styling */
  pre {
    @apply bg-gray-900 text-white rounded-lg p-4 overflow-x-auto;
  }
  
  code {
    @apply font-mono;
  }
  </style>