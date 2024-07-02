<template>
    <div>
        <div class="grid grid-cols-4 gap-5">
            <div v-for = "p in products" :key="p.id">
                <NuxtLink :to="`/products/${p.id}`">{{ p.title }}</NuxtLink> 
                <ProductCard :product = "p" /> 
            </div>
        </div>
    </div>
</template>

<script setup>
    definePageMeta({
        layout: 'products'
    })

    // fetch the products
    const { data: products } = await useFetch('https://fakestoreapi.com/products')
    
    useHead({
        title: 'Open AI | Merch',
        meta: [
            { name : 'description', content: 'Open AI Merchy'}
        ]
    })
</script>

<style scoped>

</style>