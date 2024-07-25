<template>
    <div class="flex min-h-screen bg-gray-100">
      <!-- Assistant List -->
      <div class="w-1/4 p-4 bg-white border-r border-gray-300">
        <h2 class="text-xl font-semibold mb-4">Assistants</h2>
        <ul>
          <li
            v-for="assistant in assistants"
            :key="assistant.id"
            @click="selectAssistant(assistant)"
            :class="{'bg-gray-200': selectedAssistant && selectedAssistant.id === assistant.id}"
            class="cursor-pointer p-2 mb-2 border border-gray-300 rounded hover:bg-gray-100"
          >
            <h3 class="font-medium">{{ assistant.name || 'Name undefined' }}</h3>
            <p class="text-sm text-gray-500">{{ assistant.model }}</p>
          </li>
        </ul>
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
            <button @click="generateResponse" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700">
              Generate JSON Response
            </button>
            <p v-if="error" class="text-red-500 mt-2">{{ error }}</p>
          </div>
        </div>
        <div v-if="response" class="p-4 bg-white border border-gray-300 rounded shadow-lg">
          <h3 class="text-lg font-semibold mb-2">Generated JSON Response</h3>
          <pre class="whitespace-pre-wrap break-words bg-gray-100 p-4 rounded">{{ response }}</pre>
          <div class="mt-4">
            <button @click="saveResponse" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-700 mr-2">
              Save Response
            </button>
            <button @click="generateResponse" class="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-700">
              Generate New Response
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { ref } from 'vue';

const assistants = ref([
  { id: 1, name: 'Assistant 1', model: 'gpt-4' },
  { id: 2, name: 'Assistant 2', model: 'gpt-3.5' },
  // Add more assistants as needed
]);

const selectedAssistant = ref(null);
const topic = ref('');
const response = ref('');
const error = ref('');

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

  // Simulate fetching a detailed JSON response
  const simulatedResponse = {
    assistant: selectedAssistant.value.name,
    topic: topic.value,
    generatedAt: new Date().toISOString(),
    data: {
      summary: `This is a summary for the topic "${topic.value}".`,
      details: {
        sections: [
          {
            title: "Introduction",
            content: "This section provides an introduction to the topic.",
            items: [
              { id: 1, description: "Key point 1 about the topic." },
              { id: 2, description: "Key point 2 about the topic." }
            ]
          },
          {
            title: "Main Content",
            content: "This section dives deep into the main content of the topic.",
            items: [
              { id: 3, description: "Detailed point 1." },
              { id: 4, description: "Detailed point 2." },
              { id: 5, description: "Detailed point 3." }
            ]
          },
          {
            title: "Conclusion",
            content: "This section provides a conclusion and summary of the topic.",
            items: [
              { id: 6, description: "Final key point." }
            ]
          }
        ],
        relatedTopics: [
          { id: 1, name: "Related topic 1" },
          { id: 2, name: "Related topic 2" },
          { id: 3, name: "Related topic 3" }
        ],
        references: [
          { id: 1, source: "Reference 1", link: "https://example.com/reference1" },
          { id: 2, source: "Reference 2", link: "https://example.com/reference2" },
          { id: 3, source: "Reference 3", link: "https://example.com/reference3" }
        ]
      }
    }
  };

  response.value = JSON.stringify(simulatedResponse, null, 2);
}

function saveResponse() {
  console.log('Response saved:', response.value);
  alert('Response saved!');
}
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
.focus\:outline-none:focus {
  outline: 0;
}
.focus\:border-indigo-500:focus {
  border-color: #6366f1;
}
.bg-blue-500 {
  background-color: #3b82f6;
}
.bg-green-500 {
  background-color: #10b981;
}
.bg-yellow-500 {
  background-color: #f59e0b;
}
.text-white {
  color: #fff;
}
.text-red-500 {
  color: #ef4444;
}
.whitespace-pre-wrap {
  white-space: pre-wrap;
}
.break-words {
  word-break: break-word;
}
.mt-2 {
  margin-top: 0.5rem;
}
.mt-4 {
  margin-top: 1rem;
}
</style>