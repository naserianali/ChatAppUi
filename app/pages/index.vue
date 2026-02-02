<template>
  <div class="flex h-screen overflow-hidden bg-gray-100 dark:bg-black">
    <LanguageSwitcher/>
    <aside class="hidden md:flex w-80 border-r border-gray-200 dark:border-gray-800">
      <IndexSidebar />
    </aside>
    <main class="flex-1 relative flex flex-col">
      <IndexChatWindow/>
    </main>
  </div>
</template>
<script setup lang="ts">
</script>