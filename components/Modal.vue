<template>
  <div v-if="isVisible" class="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
    <div class="bg-white p-4 rounded-md shadow-md w-1/3">
      <h3 class="text-lg font-semibold mb-2">File Details</h3>
      <p>{{ fileId }}</p>
      <button @click="$emit('update:isVisible', false)" class="mt-4 bg-red-500 text-white py-1 px-4 rounded-md hover:bg-red-700">Close</button>
    </div>
  </div>
</template>

<script setup>
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
</script>

<style scoped>
/* Add any additional styles here */
</style>