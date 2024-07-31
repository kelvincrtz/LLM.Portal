<template>
    <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
      <div class="bg-white p-4 rounded-md shadow-md w-1/3">
        <h3 class="text-lg font-semibold mb-2">Vector Store Details</h3>
        <div v-if="vectorStore">
          <p><strong>ID:</strong> {{ vectorStore.id }}</p>
          <p><strong>Name:</strong> {{ vectorStore.name }}</p>
          <p><strong>Created At:</strong> {{ formatDate(vectorStore.createdAt) }}</p>
          <p><strong>Size:</strong> {{ formattedSize(vectorStore.bytes) }}</p>
          <p><strong>Files:</strong> {{ vectorStore.fileCounts.total }}</p>
        </div>
        <div v-else>
          <p>Loading...</p>
        </div>
        <button @click="$emit('update:isVisible', false)" class="mt-4 bg-red-500 text-white py-1 px-4 rounded-md hover:bg-red-700">Close</button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, watch, onMounted } from 'vue';
  
  const props = defineProps({
    fileId: {
      type: String,
      required: true
    },
    isVisible: {
      type: Boolean,
      required: true
    }
  });
  
  const emit = defineEmits(['update:isVisible']);
  
  const vectorStore = ref(null);
  
  const getCachedVectorStore = (fileId) => {
    const cache = localStorage.getItem('vector-store-cache');
    if (cache) {
        try {
        const cachedData = JSON.parse(cache);
        // Assuming cachedData is an array of vector stores
        return cachedData.data.find(store => store.id === fileId) || null;
        } catch (error) {
        console.error('Error parsing vector store cache:', error);
        return null;
        }
    }
    return null;
  };


  
  watch(() => props.fileId, (newFileId) => {
    if (props.isVisible) {
      vectorStore.value = getCachedVectorStore(newFileId);
    }
  });
  
  onMounted(() => {
    if (props.isVisible) {
      vectorStore.value = getCachedVectorStore(props.fileId);
    }
  });

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
  /* Add any additional styles here */
  </style>