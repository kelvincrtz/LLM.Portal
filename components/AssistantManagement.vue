<template>
  <div class="min-h-screen bg-gray-100 p-4 flex justify-center">
    <div class="w-full max-w-7xl bg-white p-6 rounded-lg shadow-md">
      <!-- Heading -->
      <div class="p-4 bg-white border-b border-gray-300 rounded-t-lg">
        <h1 class="text-2xl font-semibold">Persona Management</h1>
      </div>

      <div class="p-4">
        <div class="flex flex-col lg:flex-row lg:space-x-4">
          <div class="flex-1 mb-4 lg:mb-0">
            <h2 class="text-xl font-semibold mb-2">Add/Edit Persona</h2>
            <form @submit.prevent="submitForm" class="space-y-4">
              <!-- Name Field -->
              <div>
                <label for="name" class="block mb-2 font-medium">Name</label>
                <input
                  type="text"
                  id="name"
                  v-model="form.name"
                  class="border border-gray-300 p-2 rounded w-full"
                  required
                />
              </div>

              <!-- Instructions Field -->
              <div>
                <label for="instructions" class="block mb-2 font-medium">Instructions</label>
                <textarea
                  id="instructions"
                  v-model="form.instructions"
                  class="border border-gray-300 p-2 rounded w-full"
                  rows="4"
                ></textarea>
              </div>

              <!-- Models Field -->
              <div>
                <label for="model" class="block mb-2 font-medium">Model</label>
                <select v-model="form.model" class="w-full p-2 border border-gray-300 rounded" required>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4-turbo">GPT-4-turbo</option>
                  <option value="gpt-4">GPT-4</option>
                  <option value="gpt-3.5-turbo">GPT-3.5-turbo</option>
                  <!-- Add more models as necessary -->
                </select>
              </div>

              <!-- Files Field -->
              <div>
                <label for="files" class="block mb-2 font-medium">Files</label>
                <input
                  type="file"
                  id="files"
                  multiple
                  @change="handleFileChange"
                  class="border border-gray-300 p-2 rounded w-full"
                />
              </div>

              <div>
                <label for="vectorStore" class="block mb-2 font-medium">Vector Stores</label>
                <div class="space-y-2">
                  <div
                    v-for="vectorStore in paginatedVectorStores"
                    :key="vectorStore.id"
                    class="p-3 border border-gray-300 rounded cursor-pointer hover:bg-gray-100"
                    @click="selectVectorStore(vectorStore.id)"
                  >
                    <h3 class="text-md font-semibold">{{ vectorStore.name }}</h3>
                    <p class="text-sm text-gray-500">ID: {{ vectorStore.id }}</p>
                    <p class="text-sm text-gray-500">Files: {{ vectorStore.fileCounts.total }}</p>
                  </div>
                </div>
                <Pagination
                  :current-page="currentPageVectorStore"
                  :total-pages="totalPagesVectorStore"
                  @page-changed="gotoPageVectorStore"
                />
              </div>

              <div>
                <label for="tools" class="block mb-2 font-medium">Tools</label>
                <select v-model="form.tools" class="w-full p-2 border border-gray-300 rounded">
                  <option value="file_search">File Search</option>
                  <option value="code_interpreter">Code Interpreter</option>
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
                <h3 class="text-lg font-semibold">{{ assistant.name || 'name undefined' }}</h3>
                <p class="text-sm text-gray-500">ID : {{ assistant.id }}</p>
                <p>Model: {{ assistant.model }}</p>

                <div v-if="isJSON(assistant.instructions)">
                  <pre v-html="formatJSON(assistant.instructions)"></pre>
                </div>

                <div v-else>
                  <p class="text-sm text-gray-500">Instructions:</p>
                  <div class="whitespace-pre-line">
                    <p>{{ formattedInstructions(assistant) }}</p>
                    <button v-if="shouldShowMore(assistant)" @click="toggleInstructions(assistant.id)" class="text-blue-500">see more</button>
                    <button v-if="expandedInstructions[assistant.id]" @click="toggleInstructions(assistant.id)" class="text-blue-500">see less</button>
                  </div>
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
            <Modal :file-id="selectedFileId" :is-visible="isModalVisible" @update:is-visible="isModalVisible = $event" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import Pagination from './Pagination.vue'; // Adjust path as necessary
import AssistantService from '@/services/AssistantService'; // Adjust path as necessary
import FileService from '@/services/FileService';
import VectorService from '@/services/VectorService';

const isModalVisible = ref(false);
const selectedFileId = ref(null);

const form = ref({
  name: '',
  instructions: '',
  model: 'gpt-4o',
  files: [],
  tools: '',
  vectorStore: ''
});

const assistants = ref([]);
const vectorStores = ref([]);
const editingIndex = ref(-1);

const currentPage = ref(1);
const pageSize = ref(4);

const currentPageVectorStore = ref(1);
const pageSizeVectorStore = ref(4);

const expandedInstructions = ref({});

const fetchAssistants = async () => {
  try {
    assistants.value = await AssistantService.getAllAssistants();
  } catch (error) {
    console.error('Error fetching assistants:', error);
  }
};

const fetchVectorStores = async () => {
  try {
    const response = await VectorService.listVectorStores();
    console.log('Vector Stores:', response); // Log the response to verify structure
    vectorStores.value = response.message; // Adjust based on actual API response structure
  } catch (error) {
    console.error('Error fetching vector stores:', error);
  }
};

onMounted(async () => {
  await fetchAssistants();
  await fetchVectorStores();
});

const paginatedAssistants = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return assistants.value.slice(start, end);
});

const totalPages = computed(() => Math.ceil(assistants.value.length / pageSize.value));

const paginatedVectorStores = computed(() => {
  const start = (currentPageVectorStore.value - 1) * pageSizeVectorStore.value;
  const end = start + pageSizeVectorStore.value;
  return vectorStores.value.slice(start, end);
});

const totalPagesVectorStore = computed(() => Math.ceil(vectorStores.value.length / pageSizeVectorStore.value));

const submitForm = async () => {
  try {
    let uploadedFiles = [];

    if (form.value.files && form.value.files.length > 0) {
      console.log('Uploading files');
      uploadedFiles = await FileService.uploadFile(form.value.files);
      console.log('Uploaded files', uploadedFiles);
    }

    const newAssistant = {
      name: form.value.name,
      instructions: form.value.instructions,
      model: form.value.model
    };

    if (form.value.tools) {
      newAssistant.tools = [{ type: form.value.tools }];
      if (form.value.tools === 'file_search') {
        newAssistant.tool_resources = {
          file_search: {
            vector_store_ids: uploadedFiles.id.split(',').map(id => id.trim())
          }
        };
      }
    }

    if (editingIndex.value === -1) {
      console.log('Creating new assistant');
      await AssistantService.createAssistant(newAssistant);
    } else {
      console.log('Editing existing assistant');
      const id = assistants.value[editingIndex.value].id;
      await AssistantService.updateAssistant(id, newAssistant);
    }

    clearForm();
    await fetchAssistants();
  } catch (error) {
    console.error('Error submitting form:', error);
  }
};

const editAssistant = (index) => {
  editingIndex.value = index;
  const assistant = assistants.value[index];
  form.value.name = assistant.name;
  form.value.instructions = assistant.instructions;
  form.value.model = assistant.model;
  form.value.file = null;
};

const deleteAssistant = async (index) => {
  try {
    const id = assistants.value[index].id;
    await AssistantService.deleteAssistant(id);
    assistants.value.splice(index, 1);
  } catch (error) {
    console.error('Error deleting assistant:', error);
  }
};

const clearForm = () => {
  form.value.name = '';
  form.value.instructions = '';
  form.value.model = 'gpt-4o';
  form.value.file = null;
  editingIndex.value = -1;
};

const handleFileChange = (event) => {
  form.value.files = Array.from(event.target.files);
};

const gotoPage = (page) => {
  currentPage.value = page;
};

const gotoPageVectorStore = (page) => {
  currentPageVectorStore.value = page;
};

const selectVectorStore = (vectorStoreId) => {
  form.value.vectorStore = vectorStoreId;
};

const isJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch (e) {
    return false;
  }
};

const formatJSON = (str) => {
  return JSON.stringify(JSON.parse(str), null, 2);
};

const formatInstructions = (instructions) => {
  const regex = /(\{.*\})/s;
  const parts = instructions.split(regex);
  return parts
    .map(part => {
      if (isJSON(part)) {
        return `<pre>${JSON.stringify(JSON.parse(part), null, 2)}</pre>`;
      } else {
        return `<p>${part}</p>`;
      }
    })
    .join('');
};

const toggleInstructions = (assistantId) => {
  expandedInstructions.value = { ...expandedInstructions.value, [assistantId]: !expandedInstructions.value[assistantId] };
};

const shouldShowMore = (assistant) => {
  const limit = 100;
  return assistant.instructions.length > limit && !expandedInstructions.value[assistant.id];
};

const formattedInstructions = (assistant) => {
  const limit = 100;
  const cleanedInstructions = cleanText(assistant.instructions);
  if (expandedInstructions.value[assistant.id]) {
    return assistant.instructions;
  }
  if (cleanedInstructions.length <= limit) {
    return cleanedInstructions;
  }
  return `${cleanedInstructions.substring(0, limit)}...`;
};

const cleanText = (text) => {
  return text.replace(/\s\s+/g, ' ').replace(/(\r\n|\n|\r)/g, '\n');
};

const showModal = (fileId) => {
  selectedFileId.value = fileId;
  isModalVisible.value = true;
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
  
  .input-field:focus {
    border-color: #667eea; /* Tailwind's indigo-500 color */
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