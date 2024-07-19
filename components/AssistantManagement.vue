<!-- AssistantView.vue -->
<template>
    <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Persona Management</h1>

    <div class="flex flex-col lg:flex-row lg:space-x-4">
      <div class="flex-1 mb-4 lg:mb-0">
        <h2 class="text-xl font-semibold mb-2">Add/Edit Persona</h2>
        <form @submit.prevent="submitForm" class="space-y-4">

          <div>
            <label class="block mb-2 font-medium">Name</label>
            <input v-model="form.name" type="text" class="w-full p-2 border border-gray-300 rounded" required />
          </div>

          <div>
            <label class="block mb-2 font-medium">Instructions</label>
            <textarea v-model="form.instructions" class="w-full p-2 border border-gray-300 rounded" rows="4" required></textarea>
          </div>

          <div>
            <label class="block mb-2 font-medium">Model</label>
            <select v-model="form.model" class="w-full p-2 border border-gray-300 rounded" required>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4-turbo">GPT-4-turbo</option>
              <option value="gpt-4">GPT-4</option>
              <option value="gpt-3.5-turbo">GPT-3.5-turbo</option>
              <!-- Add more models as necessary -->
            </select>
          </div>
          
          <div>
            <label class="block mb-2 font-medium">Files</label>
            <input type="file" multiple @change="handleFileChange" class="w-full p-2 border border-gray-300 rounded" />
          </div>

          <div>
            <label class="block mb-2 font-medium">Tools</label>
            <select v-model="form.tools" class="w-full p-2 border border-gray-300 rounded">
              <option value="file_search">File Search</option>
              <!-- Add more tools as necessary -->
            </select>
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
            <p>Model: {{ assistant.model }}</p>

            <div v-if="isJSON(assistant.instructions)">
              <pre v-html="formatJSON(assistant.instructions)"></pre>
            </div>

            <div v-else>
              <p class="text-sm text-gray-500">Instructions: {{ assistant.instructions }}</p>
            </div>

            <!-- Files List -->
            <div v-if="assistant.toolResources?.fileSearch?.vectorStoreIds?.length">
              <h4 class="text-md font-medium mt-2">Vector store:</h4>
              <ul class="list-disc pl-5 mt-1">
                <li v-for="(fileId, fileIndex) in assistant.toolResources.fileSearch.vectorStoreIds" :key="fileIndex">
                  <button @click="showModal(fileId)" class="text-sm text-gray-500 hover:underline">
                    {{ fileId }}
                  </button>
                </li>
              </ul>
            </div>
            <div v-else>
              <p class="text-sm text-gray-500">No files associated</p>
            </div>

            <div class="mt-2 space-x-2">
              <button @click="editAssistant(index + (currentPage - 1) * pageSize)" class="bg-yellow-500 text-white py-1 px-2 rounded-md shadow-sm hover:bg-yellow-700">
                Edit
              </button>

              <button @click="deleteAssistant(index + (currentPage - 1) * pageSize)" class="ml-2 bg-red-500 text-white py-1 px-2 rounded-md shadow-sm hover:bg-red-700">
                Delete
              </button>
            </div>
          </li>
        </ul>
        <Pagination :total-pages="totalPages" :current-page="currentPage" @page-changed="gotoPage" />

        <!-- Modal Component -->
        <Modal :fileId="selectedFileId" :isVisible="isModalVisible" @update:isVisible="isModalVisible = $event" />
      </div>
      
    </div>
  </div>
</template>
  
  <script>
  import AssistantsPagination from './Pagination.vue'; // Adjust path as necessary
  import AssistantService from '@/services/AssistantService'; // Adjust path as necessary
  import FileService from '@/services/FileService';
  import FileModal from '~/components/Modal.vue';

  const isModalVisible = ref(false);
  const selectedFileId = ref(null);

  function showModal(fileId) {
    selectedFileId.value = fileId;
    isModalVisible.value = true;
  }

  export default {
    components: {
        AssistantsPagination,
        FileModal
    },
    data() {
      return {
        form: {
          name: '',
          instructions: '', // Add instructions field
          model: 'gpt-4o', // Default value for model
          files: [], // Initialize as an empty array
          tools: ''
        },

        assistants: [],
        editingIndex: -1,

        pageSize: 4, // Number of assistants per page
        currentPage: 1 // Current page
      };
    },
    computed: {
      // Calculate paginated assistants based on currentPage and pageSize
      paginatedAssistants() {
        const start = (this.currentPage - 1) * this.pageSize;
        const end = start + this.pageSize;
        return this.assistants.slice(start, end);
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
          let uploadedFiles = [];

          if (this.form.files && this.form.files.length > 0) {
            console.log('Uploading files');

            // Upload all files in one go and store the results
            uploadedFiles = await FileService.uploadFile(this.form.files);
            console.log('Uploaded files', uploadedFiles);
            console.log('Files uploaded');
          }
          
          // Create an assistant with file search tool and the vector id
          const newAssistant = {
            name: this.form.name,
            instructions: this.form.instructions,
            model: this.form.model
          };

          if (this.form.tools) {
            newAssistant.tools = [{ type: this.form.tools }];

            if (this.form.tools === 'file_search') {
              newAssistant.tool_resources = {
                file_search: {
                  vector_store_ids: uploadedFiles.id.split(',').map(id => id.trim())
                }
              };
            }
          }
      
          // TODO: for debugging only 
          // console.log('New assistant req', newAssistant);

          if (this.editingIndex === -1) {
            console.log('Creating new assistant');
            await AssistantService.createAssistant(newAssistant);
          } else {
            console.log('Editing existing assistant');
            const id = this.assistants[this.editingIndex].id;
            console.log('Editing assistant ID:', id); // Log the ID
            await AssistantService.updateAssistant(id, newAssistant);
          }

          this.clearForm();
          await this.fetchAssistants();
        } catch (error) {
          console.error('Error submitting form:', error);
        }
      },

      async editAssistant(index) {
        console.log('Editing index:', index); // Add this line to log the index
        this.editingIndex = index;
        const assistant = this.assistants[index];
        this.form.name = assistant.name;
        this.form.instructions = assistant.instructions;
        this.form.model = assistant.model;
        this.form.file = null; // Clear the file input
        this.editingIndex = index;
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
        this.form.name = '';
        this.form.instructions = ''; // Clear instructions
        this.form.model = 'gpt-4o'; // Reset model to default
        this.form.file = null;
        this.editingIndex = -1;
      },

      handleFileChange(event) {
        this.form.files = Array.from(event.target.files);
      },

      gotoPage(page) {
        this.currentPage = page;
      },

      isJSON(str) {
        try {
          JSON.parse(str);
          return true;
        } catch (e) {
          return false;
        }
      },
      
      formatJSON(str) {
        return JSON.stringify(JSON.parse(str), null, 2);
      },

      formatInstructions(instructions) {
        // Split the instructions by the JSON part
        const regex = /(\{.*\})/s; // Regular expression to match the JSON part
        const parts = instructions.split(regex);

        return parts
          .map(part => {
            if (this.isJSON(part)) {
              return `<pre>${JSON.stringify(JSON.parse(part), null, 2)}</pre>`;
            } else {
              return `<p>${part}</p>`;
            }
          })
          .join('');
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