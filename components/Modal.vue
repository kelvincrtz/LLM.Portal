<!-- components/FileModal.vue -->
<template>
    <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div class="bg-white p-4 rounded-lg shadow-lg w-1/2">
        <h2 class="text-lg font-semibold mb-2">File Details</h2>
        <p><strong>File ID:</strong> {{ fileId }}</p>
        <button @click="closeModal" class="mt-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Close
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      fileId: String,
      isVisible: Boolean,
    },
    methods: {
      closeModal() {
        this.$emit('update:isVisible', false);
      },
    },
  };
  </script>
  
  <style scoped>
  /* Add any additional styles for the modal here */
  </style>