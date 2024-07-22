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
        <div class="messages">
          <div v-for="(message, index) in messages" :key="index" :class="message.role">
            <p v-if="!isCodeBlock(message.content)" v-html="formatMessage(message.content)"></p>
            <pre v-else><code>{{ message.content }}</code></pre>
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
  import chatGPTService from '~/services/CompletionService';
  import AssistantService from '@/services/AssistantService';
  import FileService from '@/services/FileService';
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
          { id: 1, name: 'Assistant 1', description: 'Description of Assistant 1' },
          { id: 2, name: 'Assistant 2', description: 'Description of Assistant 2' },
          { id: 3, name: 'Assistant 3', description: 'Description of Assistant 3' },
          { id: 4, name: 'Assistant 4', description: 'Description of Assistant 4' },
          { id: 5, name: 'Assistant 5', description: 'Description of Assistant 5' },
          // Add more assistants as needed
        ],
        threads: [
          { id: 1, name: 'Thread 1', description: 'Description of Thread 1' },
          { id: 2, name: 'Thread 2', description: 'Description of Thread 2' },
          { id: 3, name: 'Thread 3', description: 'Description of Thread 3' },
          { id: 4, name: 'Thread 4', description: 'Description of Thread 4' },
          { id: 5, name: 'Thread 5', description: 'Description of Thread 5' },
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
      await this.loadThreads(); // Assuming you have a similar service for threads
    },

    methods: {
      async sendMessage() {
        console.log('Send message button clicked');
        if (this.newMessage.trim() === '') return;

        const userMessage = { 
          role: 'user', 
          content: this.newMessage 
        };
        this.messages.push(userMessage);
        this.newMessage = '';
        this.file = null; // Clear the file input

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
        return message.startsWith('```') && content.endsWith('```');
      },

      selectThread(thread) {
        this.selectedThread = thread;
        // Load messages for the selected thread
        this.messages = thread.messages || [];
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
      async loadThreads() {
        // Implement similar logic for threads
      },
      selectAssistant(assistant) {
        this.selectedAssistant = assistant;
      },
      changeAssistantPage(page) {
        this.assistantPage = page;
        this.updatePagination();
      },
      triggerFileInput() {
        this.$refs.fileInput.click();
      },
      handleFileUpload(event) {
        const file = event.target.files[0];
        this.selectedFile = file;
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
    }
  };
  </script>
  
  <style scoped>
  .chat-container {
    @apply flex justify-center items-center h-screen bg-gray-100;
  }
  
  .chat-box {
    @apply w-4/5 h-5/6 bg-white border border-gray-300 rounded-lg shadow-md overflow-hidden flex;
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