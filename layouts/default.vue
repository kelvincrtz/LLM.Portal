<template>
    <div>
        <header class="shadow-sm bg-white">
            <nav class="container mx-auto p-4 flex justify-between">
                <NuxtLink to ="/" class="font-bold">Open AI Portal Demo</NuxtLink>
                <ul class="flex gap-4">
                    <li><NuxtLink to="/">Chatbox</NuxtLink></li>
                    <li><NuxtLink to="/about">Assistant Management</NuxtLink></li>
                    <li><NuxtLink to="/products" class="btn">Products</NuxtLink></li>
                </ul>
            </nav>
        </header>

        <!-- output the page content-->
        <div class="container mx-auto p-4">
            <slot />
        </div>
    </div>
</template> 


<style scoped>
    .router-link-exact-active {
        color: lightseagreen;
    }
</style>