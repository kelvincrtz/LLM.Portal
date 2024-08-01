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
      
      <!-- Divider Line -->
      <div class="divider"></div>

      <!-- Chat Content -->
      <div class="chat-content">
        <!-- Selected Assistant Name -->
        <div class="chat-header p-4 border-b border-gray-300">
          <h2 class="text-xl font-semibold">
            {{ selectedAssistant ? selectedAssistant.name : 'No Assistant Selected' }}
          </h2>
        </div>
        
        <!-- Messages -->
        <div ref="messagesContainer" id="messagesContainer" class="messages">
          <div v-for="(message, index) in messages" :key="index" :class="message.role">
            <p v-html="formatMessage(message.content)"></p>
          </div>
          <!-- Loading Animation -->
          <div v-if="loading" class="loading-animation">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
          </div>
        </div>
        
        <!-- Input Box -->
        <div class="input-box">
          <input v-model="newMessage" @keyup.enter="sendMessage" placeholder="Type a message..." class="input-field focus:border-indigo-500 focus:ring focus:ring-indigo-200" />
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

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue';
import AssistantService from '@/services/AssistantService';
import ThreadService from '@/services/ThreadService';
import Pagination from './Pagination.vue';

// Constants
const PAGE_SIZE = 5;

const initialThreads = [
  { id: 'thread_q5N8EIG7wNaztUhPcnpLtCCA', name: 'Thread with data', description: 'Thread with JSON' },
  { id: 'thread_ySUjQDaLklC3RPOjrDk7BT3q', name: 'About weather thread', description: 'Weather questions and facts' },
  { id: 'thread_BsHPvqkm5MwlLiBagex4jGqz', name: 'About NZ weather', description: 'New Zealand weather info' },
];

const newMessage = ref('');
const messages = ref([]);
const assistants = ref([]);
const threads = ref(initialThreads);

const assistantPage = ref(1);
const threadPage = ref(1);
const pageSize = ref(PAGE_SIZE);

const selectedAssistant = ref(null);
const selectedThread = ref(null);

const file = ref(null);

const loading = ref(false);

// Methods
const sendMessage = async () => {
  if (newMessage.value.trim() === '') return;

  if (!selectedAssistant.value) {
    console.error('No assistant selected.');
    return;
  }

  loading.value = true;

  const requestPayload = {
    role: 'user',
    content: newMessage.value,
    assistant_id: selectedAssistant.value.id,
    model: 'gpt-3.5-turbo'
  };

  const userMessage = {
    role: 'user',
    content: newMessage.value
  };
  messages.value.push(userMessage);
  newMessage.value = '';
  file.value = null;

  try {
    let response;

    if (selectedThread.value) {
      response = await ThreadService.continueThread(selectedThread.value.id, requestPayload);
    } else {
      response = await ThreadService.startNewThread(requestPayload);
      selectedThread.value = response.thread;
      const initialMessage = {
        role: response.initialMessage.role,
        content: response.initialMessage.content
      };
      messages.value.push(initialMessage);
    }

    if (response && response.content && response.content.length > 0) {
      const botMessageContent = response.content.map(item => item.text.value).join(' ');
      const botMessage = {
        role: response.role,
        content: botMessageContent
      };
      messages.value.push(botMessage);
    } else {
      console.error('Invalid response format:', response);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  } finally {
    loading.value = false;
  }
};

const formatMessage = (message) => {
  if (Array.isArray(message)) {
    message = message.map(item => item.text.value).join(' ');
  }
  return message
    .replace(/\n/g, '<br>')
    .replace(/ {2,}/g, match => '&nbsp;'.repeat(match.length));
};

const selectThread = async (thread) => {
  selectedThread.value = thread;
  await loadThreadMessages(thread.id);
};

const loadThreadMessages = async (threadId) => {
  try {
    const response = await ThreadService.getThreadMessages(threadId);
    messages.value = response.message;
  } catch (error) {
    console.error('Error loading thread messages:', error);
  }
};

const changeThreadPage = (page) => {
  threadPage.value = page;
  updateThreadPagination();
};

const handleFileUpload = (event) => {
  const uploadedFile = event.target.files[0];
  if (uploadedFile) {
    file.value = uploadedFile;
  }
};

const triggerFileInput = () => {
  document.querySelector('#fileInput').click();
};

const loadAssistants = async () => {
  try {
    assistants.value = await AssistantService.getAllAssistants();
    updatePagination();
  } catch (error) {
    console.error('Error loading assistants:', error);
  }
};

const updatePagination = () => {
  const start = (assistantPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedAssistants.value = assistants.value.slice(start, end);
  assistantTotalPages.value = Math.ceil(assistants.value.length / pageSize.value);
};

const updateThreadPagination = () => {
  const start = (threadPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  paginatedThreads.value = threads.value.slice(start, end);
  threadTotalPages.value = Math.ceil(threads.value.length / pageSize.value);
};

const selectAssistant = (assistant) => {
  selectedAssistant.value = assistant;
};

const changeAssistantPage = (page) => {
  assistantPage.value = page;
  updatePagination();
};

const scrollToBottom = () => {
  nextTick(() => {
    const messagesContainer = document.querySelector('#messagesContainer');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    } else {
      console.error('Messages container is null');
    }
  });
};

// Watchers
watch(messages, () => {
  scrollToBottom();
}, { deep: true });

const paginatedAssistants = computed(() => {
  const start = (assistantPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return assistants.value.slice(start, end);
});

const assistantTotalPages = computed(() => Math.ceil(assistants.value.length / pageSize.value));

const paginatedThreads = computed(() => {
  const start = (threadPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return threads.value.slice(start, end);
});

const threadTotalPages = computed(() => Math.ceil(threads.value.length / pageSize.value));

onMounted(() => {
  loadAssistants();
  // loadThreads(); // Implement and call this if needed
});
</script>
  
<style scoped>
.chat-container {
  @apply flex justify-center items-center h-screen bg-gray-100;
}

.chat-box {
  width: 90%;
  height: 90%;
  @apply bg-white shadow-lg rounded-lg overflow-hidden flex;
}

.left-sidebar {
  @apply w-1/3 p-4 bg-white shadow-lg overflow-y-auto flex flex-col;
}

.assistant-view, .threads-view {
  @apply flex-1;
}

.assistant-view ul, .threads-view ul {
  @apply list-none p-0;
}

.assistant-view li, .threads-view li {
  @apply cursor-pointer p-2 mb-2 rounded hover:bg-gray-100;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Add a subtle shadow */
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

.loading-animation {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 50px; /* Adjust height as needed */
}

.dot {
  width: 10px;
  height: 10px;
  margin: 0 5px;
  background-color: #667eea;
  border-radius: 50%;
  animation: bounce 1.4s infinite both;
}

.dot:nth-child(1) {
  animation-delay: -0.32s;
}

.dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

/* Divider Line */
.divider {
  @apply w-px bg-gray-300;
}
</style>