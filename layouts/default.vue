<template>
    <div>
        <header class="shadow-sm bg-white">
            <nav class="container mx-auto p-4 flex justify-between">
                <NuxtLink to ="/" class="font-bold">LLM Portal</NuxtLink>
                <ul class="flex gap-4">
                    <li><NuxtLink to="/">Chatbox</NuxtLink></li>
                    <li><NuxtLink to="/persona">Persona</NuxtLink></li>
                    <li><NuxtLink to="/designGenerator">LD Generator</NuxtLink></li>
                    <li><NuxtLink to="/products" class="btn">Vector Management</NuxtLink></li>
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