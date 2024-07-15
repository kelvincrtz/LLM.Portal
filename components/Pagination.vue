<!-- Pagination.vue -->
<template>
  <nav aria-label="Pagination">
    <ul class="flex justify-center space-x-2">
      <li v-for="page in totalPages" :key="page" :class="{ 'font-bold': page === currentPage }">
        <a href="#" @click.prevent="gotoPage(page)"
          class="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-100">
          {{ page }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script>
export default {
  props: {
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    }
  },
  methods: {
    gotoPage(page) {
      this.$emit('page-changed', page);
    }
  }
};
</script>

<style scoped>
/* Add any necessary tailwind styles for pagination if needed */
</style>