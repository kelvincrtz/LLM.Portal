<template>
    <div class="flex min-h-screen bg-gray-100">
      <!-- Assistant List -->
      <div class="w-1/4 p-4 bg-white border-r border-gray-300">
        <h2 class="text-xl font-semibold mb-4">Assistants</h2>
        <ul>
          <li
            v-for="assistant in paginatedAssistants"
            :key="assistant.id"
            @click="selectAssistant(assistant)"
            :class="{'bg-gray-200': selectedAssistant && selectedAssistant.id === assistant.id}"
            class="cursor-pointer p-2 mb-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            <h3 class="font-medium">{{ assistant.name || 'Name undefined' }}</h3>
            <p class="text-sm text-gray-500">{{ assistant.model }}</p>
          </li>
        </ul>
        <Pagination 
          :current-page="currentPage" 
          :total-pages="totalPages" 
          @page-changed="changePage"
        />
      </div>
  
      <!-- Interaction Section -->
      <div class="w-3/4 p-4">
        <div class="mb-4">
          <h2 class="text-xl font-semibold mb-4">
            {{ selectedAssistant ? selectedAssistant.name : 'No Assistant Selected' }}
          </h2>
          <div v-if="selectedAssistant">
            <input
              v-model="topic"
              placeholder="Enter a topic..."
              class="w-full p-2 mb-4 border border-gray-300 rounded focus:outline-none focus:border-indigo-500"
            />
            
            <p class="text-gray-500 text-sm mb-4">Examples: saving the planet, car maintenance, healthy eating, productivity tips</p>

            <button @click="generateResponse" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
              Generate JSON Response
            </button>
            <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>

            <!-- Loading Animation -->
            <div v-if="loading" class="loading-animation">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>

          </div>
        </div>
        <div v-if="response" class="p-4 bg-white border border-gray-300 rounded shadow-lg">
          <h3 class="text-lg font-semibold mb-2">Generated JSON Response</h3>
          <pre v-if="!isEditing" class="whitespace-pre-wrap break-words">{{ formattedResponse }}</pre>
          <textarea
            v-if="isEditing"
            v-model="response"
            class="w-full p-2 border border-gray-300 rounded bg-gray-100"
            rows="40"
          ></textarea>
          <div class="mt-4">
            <button
              v-if="!isEditing"
              @click="isEditing = true"
              class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-700 mr-2"
            >
              Edit JSON
            </button>
            <button
              v-if="isEditing"
              @click="saveEdit"
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 mr-2"
            >
              Save Edit
            </button>
            <button
              v-if="isEditing"
              @click="cancelEdit"
              class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 mr-2"
            >
              Cancel
            </button>
            <button
              @click="generateResponse"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Generate New Response
            </button>
          </div>
        </div>
      </div>
  
      <!-- Alert for saved response -->
      <div v-if="showAlert" class="fixed bottom-4 right-4 p-4 bg-green-500 text-white rounded shadow-lg">
        Response saved successfully!
      </div>
    </div>
  </template>

<script setup>
import { ref, computed } from 'vue';
import Pagination from './Pagination.vue';
import ThreadService from '@/services/ThreadService';

const assistants = ref([
  { id: 'asst_dFN2Ws0M7YbhWjXEyIqifYpQ', name: 'Assistant with json', model: 'gpt-4' },
  { id: '', name: 'Assistant 2', model: 'gpt-3.5' },
  { id: '', name: 'Assistant 3', model: 'gpt-3.5' },
  { id: '', name: 'Assistant 4', model: 'gpt-3.5' },
  { id: '', name: 'Assistant 5', model: 'gpt-3.5' },
  { id: '', name: 'Assistant 6', model: 'gpt-3.5' },
  { id: '', name: 'Assistant 7', model: 'gpt-3.5' },
  { id: '', name: 'Assistant 8', model: 'gpt-3.5' },
  { id: '', name: 'Assistant 9', model: 'gpt-3.5' },
  { id: '', name: 'Assistant 10', model: 'gpt-3.5' },
  { id: '', name: 'Assistant 11', model: 'gpt-3.5' },
  { id: '', name: 'Assistant 12', model: 'gpt-3.5' },
  { id: '', name: 'Assistant 13', model: 'gpt-3.5' },
  { id: '', name: 'Assistant 14', model: 'gpt-3.5' },
  // Add more assistants as needed
]);

const assistantsPerPage = 10;
const currentPage = ref(1);
const totalPages = ref(Math.ceil(assistants.value.length / assistantsPerPage));

const selectedAssistant = ref(null);
const topic = ref('');
const response = ref('');
const error = ref('');
const showAlert = ref(false);
const isEditing = ref(false);

const loading = ref(false);

const paginatedAssistants = computed(() => {
  const start = (currentPage.value - 1) * assistantsPerPage;
  const end = start + assistantsPerPage;
  return assistants.value.slice(start, end);
});

function selectAssistant(assistant) {
  selectedAssistant.value = assistant;
  error.value = '';
}

async function generateResponse() {
  if (!topic.value) {
    error.value = 'Topic cannot be empty!';
    return;
  }

  error.value = '';
  response.value = ''; // Clear previous response if any

    loading.value = true; // Set loading to true before the request

    // Create the request payload
    const requestPayload = {
        role: 'user',
        content: topic.value,
        assistant_id: 'asst_dFN2Ws0M7YbhWjXEyIqifYpQ', // Include the selected assistant ID
        model: 'gpt-3.5-turbo' // TODO: 
    };

    console.log('Request inspect part 1:', requestPayload); // Log the response to inspect it

    try {
        const apiResponse = await ThreadService.startJsonThread(requestPayload);
        console.log('API Response:', apiResponse); // Log the API response

        // Handle the response format correctly
        if (apiResponse) {
            response.value = JSON.stringify(apiResponse, null, 2);
            loading.value = false; // Set loading to false after the response
            console.log('Formatted Response:', response.value);
        } else {
            console.error('Invalid response format:', apiResponse);
        }
    } catch (error) {
        console.error('Error while fetching response:', error);
    }
}

function saveEdit() {
  isEditing.value = false;
  showAlert.value = true;
  setTimeout(() => showAlert.value = false, 3000);
}

function cancelEdit() {
  isEditing.value = false;
}

function changePage(page) {
  currentPage.value = page;
}

const formattedResponse = computed(() => {
  try {
    return JSON.stringify(JSON.parse(response.value), null, 2);
  } catch {
    return response.value;
  }
});
</script>

<style scoped>
.flex {
  display: flex;
}
.min-h-screen {
  min-height: 100vh;
}
.bg-gray-100 {
  background-color: #f3f4f6;
}
.bg-white {
  background-color: #fff;
}
.border-r {
  border-right-width: 1px;
}
.border-gray-300 {
  border-color: #d1d5db;
}
.bg-gray-200 {
  background-color: #e5e7eb;
}
.hover\:bg-gray-100:hover {
  background-color: #f9fafb;
}
.hover\:bg-blue-700:hover {
  background-color: #1d4ed8;
}
.hover\:bg-green-700:hover {
  background-color: #15803d;
}
.hover\:bg-yellow-700:hover {
  background-color: #ca8a04;
}
.rounded {
  border-radius: 0.375rem;
}
.shadow-lg {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
.fixed {
  position: fixed;
}
.bottom-4 {
  bottom: 1rem;
}
.right-4 {
  right: 1rem;
}
.text-xl {
  font-size: 1.25rem;
}
.font-semibold {
  font-weight: 600;
}
.mb-4 {
  margin-bottom: 1rem;
}
.p-4 {
  padding: 1rem;
}
.border {
  border-width: 1px;
}
.p-2 {
  padding: 0.5rem;
}
.whitespace-pre-wrap {
  white-space: pre-wrap;
}
.break-words {
  word-break: break-word;
}
.mt-4 {
  margin-top: 1rem;
}
.mt-2 {
  margin-top: 0.5rem;
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
</style>