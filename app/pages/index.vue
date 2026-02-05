<template>
  <div class="flex h-screen overflow-hidden bg-gray-100 dark:bg-black">
    <LanguageSwitcher/>

    <aside
        :class="[
        'border-r border-gray-200 dark:border-gray-800 transition-all duration-300',
        uiStore.activeChatId ? 'hidden md:flex' : 'flex w-full md:w-[350px] lg:w-[400px]'
      ]"
    >
      <IndexSidebar/>
    </aside>

    <main
        :class="[
        'flex-1 w-full relative flex flex-col h-full bg-white dark:bg-gray-900',
        !uiStore.activeChatId ? 'hidden md:flex' : 'flex'
      ]"
    >
      <IndexChatWindow/>
    </main>
  </div>
</template>

<script setup lang="ts">
import {useUiStore} from "~/stores/ui";

const uiStore = useUiStore()
</script>