<template>
    <div class="min-h-screen bg-gray-100 p-4">
      <div class="container mx-auto">
        <h1 class="text-2xl font-bold mb-4">Vector Management</h1>
  
        <!-- Vector Stores List -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold mb-2">Vector Stores</h2>
          <ul>
            <li
              v-for="store in vectorStores"
              :key="store.id"
              class="bg-white p-4 mb-2 border border-gray-300 rounded shadow-sm"
            >
              <h3 class="text-lg font-medium">{{ store.name }}</h3>
              <p class="text-sm text-gray-600">ID: {{ store.id }}</p>
              <p class="text-sm text-gray-600">Description: {{ store.description }}</p>
            </li>
          </ul>
        </div>
  
        <!-- Vector Files List -->
        <div>
          <h2 class="text-xl font-semibold mb-2">Vector Files</h2>
          <ul>
            <li
              v-for="file in vectorFiles"
              :key="file.id"
              class="bg-white p-4 mb-2 border border-gray-300 rounded shadow-sm"
            >
              <h3 class="text-lg font-medium">{{ file.name }}</h3>
              <p class="text-sm text-gray-600">ID: {{ file.id }}</p>
              <p class="text-sm text-gray-600">Type: {{ file.type }}</p>
              <p class="text-sm text-gray-600">Size: {{ file.size }} MB</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  
  // Example data for vector stores
  const vectorStores = ref([
    { id: 'store_1', name: 'Store A', description: 'Description of Store A' },
    { id: 'store_2', name: 'Store B', description: 'Description of Store B' },
    { id: 'store_3', name: 'Store C', description: 'Description of Store C' },
  ]);
  
  // Example data for vector files
  const vectorFiles = ref([
    { id: 'file_1', name: 'File A', type: 'CSV', size: 10 },
    { id: 'file_2', name: 'File B', type: 'JSON', size: 5 },
    { id: 'file_3', name: 'File C', type: 'TXT', size: 2 },
  ]);
  </script>
  
  <style scoped>
  /* Add any additional styling here */
  </style>