<template>
    <div class="min-h-screen bg-gray-100 p-4">
      <div class="container mx-auto">
        <!-- Tabs for switching between Vector Stores and Vector Files -->
        <div class="flex mb-6">
          <button
            :class="{'bg-blue-500 text-white': activeTab === 'stores', 'bg-gray-200': activeTab !== 'stores'}"
            @click="activeTab = 'stores'"
            class="py-2 px-4 rounded-l-lg border border-gray-300 focus:outline-none"
          >
            Vector Stores
          </button>
          <button
            :class="{'bg-blue-500 text-white': activeTab === 'files', 'bg-gray-200': activeTab !== 'files'}"
            @click="activeTab = 'files'"
            class="py-2 px-4 rounded-r-lg border border-gray-300 focus:outline-none"
          >
            Vector Files
          </button>
        </div>
  
        <!-- Vector Stores Content -->
        <div v-if="activeTab === 'stores'">
          <div v-if="vectorStores.length > 0">
            <div
              v-for="store in vectorStores"
              :key="store.id"
              class="bg-white p-4 mb-4 border border-gray-300 rounded shadow-sm"
            >
              <h3 class="text-lg font-medium">{{ store.name }}</h3>
              <p class="text-sm text-gray-600">ID: {{ store.id }}</p>
              <p class="text-sm text-gray-600">Description: {{ store.description }}</p>
              
              <!-- Additional Information -->
              <div class="mt-4">
                <h4 class="font-semibold">Files Attached:</h4>
                <ul>
                  <li v-for="file in store.files" :key="file.id" class="text-sm text-gray-600">
                    {{ file.name }} ({{ file.type }})
                  </li>
                </ul>
              </div>
              <div class="mt-4">
                <h4 class="font-semibold">Assistants Using This Store:</h4>
                <ul>
                  <li v-for="assistant in store.assistants" :key="assistant.id" class="text-sm text-gray-600">
                    {{ assistant.name }}
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div v-else>
            <p class="text-gray-600">No vector stores found.</p>
          </div>
        </div>
  
        <!-- Vector Files Content -->
        <div v-if="activeTab === 'files'">
          <div v-if="vectorFiles.length > 0">
            <div
              v-for="file in vectorFiles"
              :key="file.id"
              class="bg-white p-4 mb-4 border border-gray-300 rounded shadow-sm"
            >
              <h3 class="text-lg font-medium">{{ file.name }}</h3>
              <p class="text-sm text-gray-600">ID: {{ file.id }}</p>
              <p class="text-sm text-gray-600">Type: {{ file.type }}</p>
              <p class="text-sm text-gray-600">Size: {{ file.size }} MB</p>
            </div>
          </div>
          <div v-else>
            <p class="text-gray-600">No vector files found.</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  const activeTab = ref('stores');
  
  // Example data for Vector Stores
  const vectorStores = ref([
    {
      id: 'store_1',
      name: 'Store A',
      description: 'Description of Store A',
      files: [
        { id: 'file_1', name: 'File A', type: 'CSV' },
        { id: 'file_2', name: 'File B', type: 'JSON' }
      ],
      assistants: [
        { id: 'asst_1', name: 'Assistant 1' },
        { id: 'asst_2', name: 'Assistant 2' }
      ]
    },
    {
      id: 'store_2',
      name: 'Store B',
      description: 'Description of Store B',
      files: [
        { id: 'file_3', name: 'File C', type: 'TXT' },
        { id: 'file_4', name: 'File D', type: 'PDF' }
      ],
      assistants: [
        { id: 'asst_3', name: 'Assistant 3' }
      ]
    }
  ]);
  
  // Example data for Vector Files
  const vectorFiles = ref([
    { id: 'file_1', name: 'File A', type: 'CSV', size: 10 },
    { id: 'file_2', name: 'File B', type: 'JSON', size: 5 },
    { id: 'file_3', name: 'File C', type: 'TXT', size: 2 },
    { id: 'file_4', name: 'File D', type: 'PDF', size: 15 }
  ]);
  </script>
  
  <style scoped>
  /* Additional custom styling */
  </style>