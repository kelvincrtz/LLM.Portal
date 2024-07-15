<!-- AssistantView.vue -->
<template>
    <div class="container mx-auto p-4">
      <h1 class="text-2xl font-bold mb-4">Assistant Management</h1>
  
      <!-- Form for creating or updating assistants -->
      <form @submit.prevent="submitForm">
        <div class="mb-4">
          <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
          <input v-model="form.name" type="text" id="name" name="name"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50">
        </div>
  
        <div class="mb-4">
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea v-model="form.description" id="description" name="description" rows="3"
            class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"></textarea>
        </div>

        <div class="mb-4">
          <label for="file" class="block text-sm font-medium text-gray-700">Upload File</label>
          <input type="file" id="file" ref="fileInput" @change="handleFileChange"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
        </div>
  
        <div>
          <button type="submit"
            class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            Save
          </button>
        </div>
      </form>
  
      <!-- Display existing assistants -->
      <div class="mt-8">
        <h2 class="text-xl font-bold mb-4">Assistants List</h2>
  
     <!-- Paginated List -->
     <ul>
        <li v-for="(assistant, index) in paginatedAssistants" :key="assistant.id" class="mb-2">
          <div class="flex justify-between items-center bg-white shadow-md rounded-md p-4">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-medium">{{ assistant.name }}</h3>
              <p class="text-sm text-gray-600">ID: {{ assistant.id }}</p>
            </div>
            <p class="text-sm text-gray-600 mb-2">{{ assistant.instructions }}</p>
            <div>
              <button @click="editAssistant(index)" class="text-indigo-600 hover:text-indigo-900">Edit</button>
              <button @click="deleteAssistant(index)" class="text-red-600 hover:text-red-900">Delete</button>
            </div>
          </div>
        </li>
      </ul>

      <!-- Pagination Controls using Pagination component -->
      <Pagination v-if="totalPages > 1" :currentPage="currentPage" :totalPages="totalPages" @page-changed="gotoPage" />
    </div>
  </div>
</template>
  
  <script>
  import AssistantsPagination from './Pagination.vue'; // Adjust path as necessary
  import AssistantService from '@/services/AssistantService'; // Adjust path as necessary

  export default {
    components: {
        AssistantsPagination
    },
    data() {
      return {
        form: {
          name: '',
          description: '',
          file: null
        },
        assistants: [
          { id: 1, name: 'Assistant 1', description: 'Description of Assistant 1' },
          { id: 2, name: 'Assistant 2', description: 'Description of Assistant 2' },
          // Initialize with sample data or fetch from API
        ],
        editingIndex: -1,
        pageSize: 5, // Number of assistants per page
        currentPage: 1 // Current page
      };
    },
    computed: {
      // Calculate paginated assistants based on currentPage and pageSize
      paginatedAssistants() {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        return this.assistants.slice(startIndex, startIndex + this.pageSize);
      },
      // Calculate total number of pages
      totalPages() {
        return Math.ceil(this.assistants.length / this.pageSize);
      }
    },
    async created() {
      // Fetch assistants data from the service on component creation
      await this.fetchAssistants();
    },
    methods: {
      async fetchAssistants() {
      try {
        this.assistants = await AssistantService.getAllAssistants();
        } catch (error) {
          console.error('Error fetching assistants:', error);
        }
      },

      async submitForm() {
        try {
          const newAssistant = {
            name: this.form.name,
            description: this.form.description,
            file: this.form.file // Adjust as per your actual file handling logic
          };
          await AssistantService.createAssistant(newAssistant);
          this.clearForm();
          await this.fetchAssistants(); // Refresh the list after creating a new assistant
        } catch (error) {
          console.error('Error creating assistant:', error);
        }
      },

      async editAssistant(index) {
        try {
          const id = this.assistants[index].id;
          const updatedAssistant = {
            name: this.form.name,
            description: this.form.description,
            file: this.form.file // Adjust as per your actual file handling logic
          };
          await AssistantService.updateAssistant(id, updatedAssistant);
          this.clearForm();
          await this.fetchAssistants(); // Refresh the list after updating an assistant
        } catch (error) {
          console.error('Error updating assistant:', error);
        }
      },

      async deleteAssistant(index) {
        try {
          const id = this.assistants[index].id;
          await AssistantService.deleteAssistant(id);
          this.assistants.splice(index, 1);
        } catch (error) {
          console.error('Error deleting assistant:', error);
        }
      },

      clearForm() {
        // Clear form fields
        this.form.name = '';
        this.form.description = '';
        this.form.file = null;
        this.editingIndex = -1;
        // Reset file input if needed
      },

      handleFileChange(event) {
        // Handle file change event
        this.form.file = event.target.files[0];
      },

      gotoPage(page) {
        this.currentPage = page;
      }
    }
  };
  </script>
  
  <style scoped>
  .container {
    max-width: 800px;
  }
  
  .bg-white {
    background-color: #ffffff;
  }
  
  .shadow-md {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .rounded-md {
    border-radius: 0.375rem; /* Equivalent to 6px */
  }
  
  .p-4 {
    padding: 1rem; /* Equivalent to 16px */
  }
  
  .mb-4 {
    margin-bottom: 1rem; /* Equivalent to 16px */
  }
  
  .block {
    display: block;
  }
  
  .text-sm {
    font-size: 0.875rem; /* Equivalent to 14px */
  }
  
  .font-medium {
    font-weight: 500;
  }
  
  .text-gray-700 {
    color: #4a5568;
  }
  
  .border-gray-300 {
    border-color: #e2e8f0;
  }
  
  .shadow-sm {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }
  
  .focus:border-indigo-500 {
    border-color: #667eea;
    box-shadow: 0 0 0 1px #667eea;
  }
  
  .focus:ring {
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
  
  .focus:ring-opacity-50 {
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }
  
  .inline-flex {
    display: inline-flex;
  }
  
  .items-center {
    align-items: center;
  }
  
  .px-4 {
    padding-left: 1rem;
    padding-right: 1rem;
  }
  
  .py-2 {
    padding-top: 0.5rem;
    padding-bottom: 0.5rem;
  }
  
  .border {
    border-width: 1px;
  }
  
  .border-transparent {
    border-color: transparent;
  }
  
  .text-white {
    color: #ffffff;
  }
  
  .bg-indigo-600 {
    background-color: #5a67d8;
  }
  
  .hover\:bg-indigo-700:hover {
    background-color: #4c51bf;
  }
  
  .focus\:outline-none:focus {
    outline: none;
  }
  
  .focus\:ring-2:focus {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5);
  }
  
  .focus\:ring-offset-2:focus {
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.5);
  }
  
  .focus\:ring-indigo-500:focus {
    box-shadow: 0 0 0 2px #667eea;
  }
  
  .text-indigo-600 {
    color: #667eea;
  }
  
  .hover\:text-indigo-900:hover {
    color: #4c51bf;
  }
  
  .text-red-600 {
    color: #e53e3e;
  }
  
  .hover\:text-red-900:hover {
    color: #9b2c2c;
  }
  
  .text-xl {
    font-size: 1.25rem; /* Equivalent to 20px */
  }
  
  .text-lg {
    font-size: 1.125rem; /* Equivalent to 18px */
  }
  
  .flex {
    display: flex;
  }
  
  .justify-between {
    justify-content: space-between;
  }
  
  
  .text-gray-600 {
    color: #718096;
  }
  
  .text-md {
    font-size: 1rem; /* Equivalent to 16px */
  }
  
  .font-bold {
    font-weight: 700;
  }
  
  .hover\:text-indigo-600:hover {
    color: #667eea;
  }
  
  .hover\:text-red-600:hover {
    color: #e53e3e;
  }
  
  </style>