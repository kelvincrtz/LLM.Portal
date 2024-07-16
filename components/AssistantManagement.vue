<!-- AssistantView.vue -->
<template>
    <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Persona Management</h1>

    <div class="flex flex-col lg:flex-row lg:space-x-4">
      <div class="flex-1 mb-4 lg:mb-0">
        <h2 class="text-xl font-semibold mb-2">Add/Edit Persona</h2>
        <form @submit.prevent="editingIndex === -1 ? submitForm() : editAssistant(editingIndex)" class="space-y-4">
          <div>
            <label class="block mb-2 font-medium">Name</label>
            <input v-model="form.name" type="text" class="w-full p-2 border border-gray-300 rounded" required />
          </div>
          <div>
            <label class="block mb-2 font-medium">Description</label>
            <textarea v-model="form.description" class="w-full p-2 border border-gray-300 rounded" rows="4" required></textarea>
          </div>
          <div>
            <label class="block mb-2 font-medium">Instructions</label>
            <textarea v-model="form.instructions" class="w-full p-2 border border-gray-300 rounded" rows="4" required></textarea>
          </div>
          <div>
            <label class="block mb-2 font-medium">File</label>
            <input type="file" @change="handleFileChange" class="w-full p-2 border border-gray-300 rounded" />
          </div>
          <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            {{ editingIndex === -1 ? 'Add Assistant' : 'Update Assistant' }}
          </button>
        </form>
      </div>

      <div class="flex-1">
        <h2 class="text-xl font-semibold mb-2">Persona List</h2>
        <ul>
          <li v-for="(assistant, index) in paginatedAssistants" :key="assistant.id" class="mb-4 p-4 border border-gray-300 rounded bg-white shadow">
            <h3 class="text-lg font-semibold">{{ assistant.name }}</h3>
            <p class="text-sm text-gray-500">ID : {{ assistant.id }}</p>
            <p>{{ assistant.description }}</p>
            <p class="text-sm text-gray-500">{{ assistant.instructions }}</p>
            <div class="mt-2 space-x-2">
              <button @click="editAssistant(index)" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Edit</button>
              <button @click="deleteAssistant(index)" class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
            </div>
          </li>
        </ul>
        <Pagination :total-pages="totalPages" :current-page="currentPage" @page-changed="gotoPage" />
      </div>
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
          { id: 1, name: 'Assistant 1', instructions: 'Instructions for Assistant 1' },
          { id: 2, name: 'Assistant 2', instructions: 'Instructions for Assistant 2' },
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
            instructions: this.form.instructions,
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