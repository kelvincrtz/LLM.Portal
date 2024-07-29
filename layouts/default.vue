<template>
    <div class="flex">
      <!-- Side Navbar -->
      <header class="bg-gray-900 text-white w-64 min-h-screen shadow-md">
        <nav class="p-6">
          <div class="mb-8">
            <NuxtLink to="/home" class="text-3xl font-bold text-indigo-400 hover:text-indigo-300 transition-colors duration-300">LLM Portal</NuxtLink>
          </div>
          <ul class="space-y-4">
            <li>
              <NuxtLink to="/" class="block py-2 px-4 rounded hover:bg-indigo-600 transition-colors duration-300">Chatbox</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/persona" class="block py-2 px-4 rounded hover:bg-indigo-600 transition-colors duration-300">Persona</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/designGenerator" class="block py-2 px-4 rounded hover:bg-indigo-600 transition-colors duration-300">LD Generator</NuxtLink>
            </li>
            <li>
              <NuxtLink to="/vectorManagement" class="block py-2 px-4 rounded hover:bg-indigo-600 transition-colors duration-300">Vector Management</NuxtLink>
            </li>
          </ul>
        </nav>
      </header>
  
      <!-- Output the page content -->
      <div class="flex-1 p-8 bg-gray-100">
        <slot />
      </div>
    </div>
  </template>
  
  <style scoped>
  .router-link-exact-active {
    background-color: #5a67d8;
    font-weight: bold;
  }
  </style>