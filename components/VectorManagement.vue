<template>
    <div class="min-h-screen bg-gray-100 p-4">
      <div class="container mx-auto">
        <!-- Tabs for switching between Vector Stores and Vector Files -->
        <div class="flex justify-between items-center mb-6">
          <div>
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
          <!-- Conditional button rendering based on active tab -->
          <div class="flex space-x-4">
            <button
              v-if="activeTab === 'stores'"
              @click="createStore"
              class="px-4 py-2 bg-green-700 text-white rounded hover:bg-green-800"
            >
              Create New Vector Store
            </button>
            <button
              v-if="activeTab === 'files'"
              @click="createFile"
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
            >
              Create New Vector File
            </button>
          </div>
        </div>
  
        <!-- Vector Stores Content -->
        <div v-if="activeTab === 'stores'">
          <div v-if="vectorStores.length > 0">
            <div
              v-for="store in paginatedVectorStores"
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
                    <button @click="removeFile(store.id, file.id)" class="text-red-500 ml-2">Delete</button>
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
            <!-- Pagination Controls -->
            <Pagination 
              :current-page="currentStorePage" 
              :total-pages="totalStorePages" 
              @page-changed="changeStorePage"
            />
          </div>
          <div v-else>
            <p class="text-gray-600">No vector stores found.</p>
          </div>
        </div>
  
        <!-- Vector Files Content -->
        <div v-if="activeTab === 'files'">
          <div v-if="vectorFiles.length > 0">
            <div
              v-for="file in paginatedVectorFiles"
              :key="file.id"
              class="bg-white p-4 mb-4 border border-gray-300 rounded shadow-sm"
            >
              <h3 class="text-lg font-medium">{{ file.name }}</h3>
              <p class="text-sm text-gray-600">ID: {{ file.id }}</p>
              <p class="text-sm text-gray-600">Type: {{ file.type }}</p>
              <p class="text-sm text-gray-600">Size: {{ file.size }} MB</p>
              <button @click="deleteFile(file.id)" class="text-red-500 mt-2">Delete</button>
            </div>
            <!-- Pagination Controls -->
            <Pagination 
              :current-page="currentFilePage" 
              :total-pages="totalFilePages" 
              @page-changed="changeFilePage"
            />
          </div>
          <div v-else>
            <p class="text-gray-600">No vector files found.</p>
          </div>
        </div>
      </div>
    </div>
  </template>
  <script setup>
  import { ref, computed } from 'vue';
  import Pagination from './Pagination.vue'; // Ensure you have a Pagination component
  
  const activeTab = ref('stores');
  
  // Example static data for Vector Stores
  const vectorStores = ref([
    {
      id: 'store_1',
      name: 'Vector Store 1',
      description: 'Description for Vector Store 1',
      files: [
        { id: 'file_1', name: 'File 1', type: 'txt' },
        { id: 'file_2', name: 'File 2', type: 'json' }
      ],
      assistants: [
        { id: 'assistant_1', name: 'Assistant A' },
        { id: 'assistant_2', name: 'Assistant B' }
      ]
    },
    {
      id: 'store_2',
      name: 'Vector Store 2',
      description: 'Description for Vector Store 2',
      files: [
        { id: 'file_3', name: 'File 3', type: 'csv' }
      ],
      assistants: [
        { id: 'assistant_3', name: 'Assistant C' }
      ]
    },
    // Add more example stores if needed
  ]);
  
  // Example static data for Vector Files
  const vectorFiles = ref([
    { id: 'file_1', name: 'File 1', type: 'txt', size: 1.2 },
    { id: 'file_2', name: 'File 2', type: 'json', size: 2.3 },
    { id: 'file_3', name: 'File 3', type: 'csv', size: 3.4 },
    { id: 'file_4', name: 'File 4', type: 'xml', size: 1.5 },
    { id: 'file_5', name: 'File 5', type: 'txt', size: 4.6 },
    { id: 'file_6', name: 'File 6', type: 'json', size: 2.7 },
    // Add more example files if needed
  ]);
  
  // Pagination settings for Vector Stores
  const itemsPerPageStore = 2;
  const currentStorePage = ref(1);
  const totalStorePages = computed(() => Math.ceil(vectorStores.value.length / itemsPerPageStore));
  
  const paginatedVectorStores = computed(() => {
    const start = (currentStorePage.value - 1) * itemsPerPageStore;
    const end = start + itemsPerPageStore;
    return vectorStores.value.slice(start, end);
  });
  
  function changeStorePage(page) {
    currentStorePage.value = page;
  }
  
  // Pagination settings for Vector Files
  const itemsPerPageFile = 3;
  const currentFilePage = ref(1);
  const totalFilePages = computed(() => Math.ceil(vectorFiles.value.length / itemsPerPageFile));
  
  const paginatedVectorFiles = computed(() => {
    const start = (currentFilePage.value - 1) * itemsPerPageFile;
    const end = start + itemsPerPageFile;
    return vectorFiles.value.slice(start, end);
  });
  
  function changeFilePage(page) {
    currentFilePage.value = page;
  }
  
  // CRUD operations for Vector Stores
  const newFileName = ref('');
  
  const createStore = () => {
    const newStore = {
      id: `store_${vectorStores.value.length + 1}`,
      name: `New Vector Store ${vectorStores.value.length + 1}`,
      description: 'Description for new store',
      files: [],
      assistants: []
    };
    vectorStores.value.push(newStore);
  };
  
  const renameStore = (storeId) => {
    const store = vectorStores.value.find(store => store.id === storeId);
    if (store) {
      const newName = prompt('Enter new name for the vector store:', store.name);
      if (newName) store.name = newName;
    }
  };
  
  const addFile = (storeId) => {
    const store = vectorStores.value.find(store => store.id === storeId);
    if (store && newFileName.value.trim()) {
      const newFile = {
        id: `file_${store.files.length + 1}`,
        name: newFileName.value,
        type: 'txt'
      };
      store.files.push(newFile);
      newFileName.value = '';
    }
  };
  
  const removeFile = (storeId, fileId) => {
    const store = vectorStores.value.find(store => store.id === storeId);
    if (store) {
      store.files = store.files.filter(file => file.id !== fileId);
    }
  };
  
  // CRUD operations for Vector Files
  const createFile = () => {
    const newFile = {
      id: `file_${vectorFiles.value.length + 1}`,
      name: `New File ${vectorFiles.value.length + 1}`,
      type: 'txt',
      size: Math.random() * 10 // Random size for example
    };
    vectorFiles.value.push(newFile);
  };
  
  const deleteFile = (fileId) => {
    vectorFiles.value = vectorFiles.value.filter(file => file.id !== fileId);
  };
  </script>
  
  <style scoped>
  /* Additional custom styling */
  </style>