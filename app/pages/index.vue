<template>
  <div class="flex h-screen overflow-hidden bg-gray-100 dark:bg-black" :dir="$i18n.locale === 'fa' ? 'rtl' : 'ltr'">

    <aside
        :class="[
        'border-r border-gray-200 dark:border-gray-800 transition-all duration-300',
        uiStore.activeChatId ? 'hidden md:flex' : 'flex w-full md:w-[350px] lg:w-[400px]'
      ]"
    >
      <IndexSidebar/>
    </aside>

    <main
        class="flex-1 min-w-0 bg-white dark:bg-gray-900 relative transition-all duration-300"
        :class="[
    uiStore.isInfoSidebarOpen
      ? 'ltr:lg:mr-[380px] rtl:lg:ml-[380px]'
      : 'mr-0 ml-0'
  ]"
    >
      <IndexChatContainer/>
    </main>

    <IndexChatInfoSidebar/>
  </div>
</template>

<script setup lang="ts">
import {useUiStore} from "~/stores/ui";

const uiStore = useUiStore()
definePageMeta({
  layout: "default"
})
</script>