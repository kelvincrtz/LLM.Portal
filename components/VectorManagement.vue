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
              class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-700"
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
        <div v-if="activeTab === 'stores'" class="flex">
          <!-- Left Side: List of Stores -->
          <div class="w-1/3 pr-4">
            <div v-if="vectorStores.length > 0">
              <div
                v-for="store in paginatedVectorStores"
                :key="store.id"
                class="bg-white p-4 mb-4 rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105"
                @click="selectStore(store)"
              >
                <h3 class="text-lg font-medium mb-1">{{ store.name }}</h3>
                <p class="text-sm text-gray-600">Size: {{ formattedSize(store.bytes) }}</p>
              </div>
              <!-- Pagination Controls -->
              <Pagination 
                :current-page="currentVectorStorePage" 
                :total-pages="totalVectorStorePages" 
                @page-changed="changeVectorStorePage"
              />
            </div>
            <div v-else>
              <p class="text-gray-600">No vector stores found.</p>
            </div>
          </div>

          <!-- Right Side: Store Details -->
          <div class="w-2/3 pl-4">
            <div v-if="selectedStore" class="bg-white p-6 rounded-lg shadow-lg">
              <h3 class="text-2xl font-semibold mb-4">{{ selectedStore.name }}</h3>
              <div class="text-lg mb-2"><span class="font-semibold">ID:</span> {{ selectedStore.id }}</div>
              <div class="text-lg mb-2"><span class="font-semibold">Created at:</span> {{ formatDate(selectedStore.createdAt) }}</div>
              <div class="text-lg mb-2"><span class="font-semibold">Size:</span> {{ formattedSize(selectedStore.bytes) }}</div>
              <div class="mt-4">
                <h4 class="text-xl font-semibold mb-2">Files Attached:</h4>
                <ul class="list-disc list-inside">
                  <li v-for="file in selectedStore.files" :key="file.id" class="text-lg text-gray-600">
                    {{ file.name }} ({{ file.type }})
                    <button @click="removeFile(selectedStore.id, file.id)" class="text-red-500 ml-2">Delete</button>
                  </li>
                </ul>
              </div>
              <div class="mt-4">
                <h4 class="text-xl font-semibold mb-2">Assistants Using This Store:</h4>
                <ul class="list-disc list-inside">
                  <li v-for="assistant in selectedStore.assistants" :key="assistant.id" class="text-lg text-gray-600">
                    {{ assistant.name }}
                  </li>
                </ul>
              </div>
            </div>
            <div v-else>
              <p class="text-gray-600">Select a store to see its details.</p>
            </div>
          </div>
        </div>

        <!-- Vector Files Content -->
        <div v-if="activeTab === 'files'" class="flex">
          <!-- Left Side: List of Files -->
          <div class="w-1/3 pr-4">
            <div v-if="vectorFiles.length > 0">
              <div
                v-for="file in paginatedVectorFiles"
                :key="file.id"
                class="bg-white p-4 mb-4 rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105"
                @click="selectFile(file)"
              >
                <h3 class="text-lg font-medium mb-1">{{ file.filename }}</h3>
                <p class="text-sm text-gray-600">Size: {{ formattedSize(file.bytes) }}</p>
              </div>
              <!-- Pagination Controls -->
              <Pagination 
                :current-page="currentVectorFilePage" 
                :total-pages="totalVectorFilePages" 
                @page-changed="changeVectorFilePage"
              />
            </div>
            <div v-else>
              <p class="text-gray-600">No vector files found.</p>
            </div>
          </div>

          <!-- Right Side: File Details -->
          <div class="w-2/3 pl-4">
            <div v-if="selectedFile" class="bg-white p-6 rounded-lg shadow-lg">
              <h3 class="text-2xl font-semibold mb-4">{{ selectedFile.filename }}</h3>
              <div class="text-lg mb-2"><span class="font-semibold">ID:</span> {{ selectedFile.id }}</div>
              <div class="text-lg mb-2"><span class="font-semibold">Size:</span> {{ formattedSize(selectedFile.bytes) }}</div>
              <div class="text-lg mb-2"><span class="font-semibold">Created at:</span> {{ formatDate(selectedFile.createdAt) }}</div>
              <div class="text-lg mb-2"><span class="font-semibold">Purpose:</span> {{ selectedFile.purpose }}</div>
              <div class="text-lg mb-2"><span class="font-semibold">Vector Store ID:</span> {{ selectedFile.vectorStoreId || 'No Vector Store Id' }}</div>
              <button @click="deleteFile(selectedFile.id)" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700 mt-4">
                Delete
              </button>
            </div>
            <div v-else>
              <p class="text-gray-600">Select a file to see its details.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
</template>
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import Pagination from './Pagination.vue';
  import VectorService from '@/services/VectorService';
  
  const activeTab = ref('stores');
  const selectedFile = ref(null);
  const selectedStore = ref(null);
  
  const vectorStores = ref([]);
  const vectorFiles = ref([]);

  // Pagination settings for Vector Stores
  const itemsPerVectorPageStore = 10;
  const currentVectorStorePage = ref(1);

  // Pagination settings for Vector Files
  const itemsPerVectorPageFile = 10;
  const currentVectorFilePage = ref(1);

  const fetchVectorStores = async () => {
    try {
      const data = await VectorService.listVectorStores();
      vectorStores.value = data.message;
    } catch (error) {
      console.error('Failed to fetch vector stores.', error);
    }
  };

  const fetchVectorFiles = async () => {
    try {
      const data = await VectorService.listVectorFiles();
      vectorFiles.value = data.data;
    } catch (error) {
      console.error('Failed to fetch vector files.', error);
    }
  };

  // Fetch vector stores
  onMounted(async () => {
    await fetchVectorStores();
    await fetchVectorFiles();
  });

  const paginatedVectorStores = computed(() => {
    const start = (currentVectorStorePage.value - 1) * itemsPerVectorPageStore;
    const end = start + itemsPerVectorPageStore;
    return vectorStores.value.slice(start, end);
  });

  const totalVectorStorePages = computed(() => Math.ceil(vectorStores.value.length / itemsPerVectorPageStore));

  function changeVectorStorePage(page) {
    currentVectorStorePage.value = page;
  }
  
  const totalVectorFilePages = computed(() => Math.ceil(vectorFiles.value.length / itemsPerVectorPageFile));
  
  const paginatedVectorFiles = computed(() => {
    const start = (currentVectorFilePage.value - 1) * itemsPerVectorPageFile;
    const end = start + itemsPerVectorPageFile;
    return vectorFiles.value.slice(start, end);
  });
  
  function changeVectorFilePage(page) {
    currentVectorFilePage.value = page;
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

  const selectFile = (file) => {
    selectedFile.value = file;
  };

  const selectStore = (store) => {
    selectedStore.value = store;
  };

  // Utility function to format file size
  const formattedSize = (bytes) => {
    if (bytes < 1024) {
      return `${bytes} Bytes`; // Display in bytes if less than 1 KB
    } else if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`; // Display in KB if less than 1 MB
    } else {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`; // Display in MB if 1 MB or more
    }
  };

  // Utility function to format Unix timestamp to readable date
  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Convert seconds to milliseconds
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  </script>
  
  <style scoped>
  /* Additional custom styling */
  </style>