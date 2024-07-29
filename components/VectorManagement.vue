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
  import { ref, onMounted } from 'vue';
  import VectorService from '@/services/VectorService';
  
  const activeTab = ref('stores');
  const vectorStores = ref([]);
  const vectorFiles = ref([]);
  
  const fetchData = async () => {
    vectorStores.value = await VectorService.getVectorStores();
    vectorFiles.value = await VectorService.getVectorFiles();
  };
  
  onMounted(() => {
    fetchData();
  });
  </script>
  
  <style scoped>
  /* Additional custom styling */
  </style>