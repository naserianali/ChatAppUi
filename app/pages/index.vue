<template>
  <div class="flex h-screen overflow-hidden bg-gray-100 dark:bg-black" :dir="$i18n.locale === 'fa' ? 'rtl' : 'ltr'">

    <aside
        :class="[
        'border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out shrink-0',
        uiStore.activeChatId ? 'hidden md:flex md:w-[350px] lg:w-[400px]' : 'flex w-full md:w-[350px] lg:w-[400px]'
      ]"
    >
      <IndexSidebar/>
    </aside>

    <main class="relative flex-1 min-w-0 bg-white dark:bg-gray-900 overflow-hidden">
      <div
          :class="[
          'h-full mx-auto transition-all duration-500 ease-in-out',
          uiStore.isInfoSidebarOpen ? 'max-w-full' : 'max-w-[800px] lg:max-w-[1000px]'
        ]"
      >
        <IndexChatContainer/>
      </div>
    </main>

    <div
        :class="[
        'transition-all duration-300 ease-in-out border-l border-gray-200 dark:border-gray-800 overflow-hidden shrink-0',
        uiStore.isInfoSidebarOpen ? 'w-[100px] lg:w-[380px]' : 'w-0'
      ]"
    >
      <div class="w-[380px]"> <IndexChatInfoSidebar/>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {useUiStore} from "~/stores/ui";

const uiStore = useUiStore()
definePageMeta({
  layout: "default"
})
</script>