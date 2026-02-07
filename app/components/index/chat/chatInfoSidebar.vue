<script setup lang="ts">
import {useUiStore} from "~/stores/ui";

const uiStore = useUiStore()
const {t} = useI18n()
</script>

<template>
  <aside
      class="fixed inset-y-0 end-0 z-40 w-full sm:w-[350px] lg:w-[380px]
       bg-white dark:bg-gray-900 border-s border-gray-100
       dark:border-gray-800 shadow-xl transition-transform duration-300 ease-in-out"
      :class="[
        uiStore.isInfoSidebarOpen ? 'translate-x-0' : '',
        !uiStore.isInfoSidebarOpen ? 'ltr:translate-x-full rtl:-translate-x-full' : ''
      ]"
  >
    <div class="h-16 flex items-center px-4 border-b border-gray-50 dark:border-gray-800">
      <button @click="uiStore.isInfoSidebarOpen = false"
              class="p-2 size-10 flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
        <Icon name="lucide:x" class=" dark:text-white size-6"/>
      </button>
      <h2 class="font-bold ms-2 dark:text-white">{{ t('User Info') }}</h2>
    </div>

    <div class="overflow-y-auto h-[calc(100vh-64px)] p-6 custom-scrollbar">
      <div class="flex flex-col items-center text-center space-y-4 mb-8">
        <div
            class="size-24 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl text-white font-bold shadow-lg">
          {{ uiStore.name?.substring(0, 1).toUpperCase() }}
        </div>
        <div>
          <h3 class="text-xl font-bold dark:text-white">{{ uiStore.name }}</h3>
          <p class="text-sm text-gray-500 ltr:text-left rtl:text-right" dir="ltr">@username_placeholder</p>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-4 mb-8">
        <div
            class="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl text-center border border-transparent hover:border-blue-500/30 transition-all cursor-pointer">
          <span class="block text-xl font-bold dark:text-white">124</span>
          <span class="text-xs text-gray-500">{{ t('Media') }}</span>
        </div>
        <div
            class="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl text-center border border-transparent hover:border-blue-500/30 transition-all cursor-pointer">
          <span class="block text-xl font-bold dark:text-white">12</span>
          <span class="text-xs text-gray-500">{{ t('Files') }}</span>
        </div>
      </div>

      <div class="space-y-6">
        <div class="bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-2xl">
          <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ t('Bio') }}</label>
          <p class="text-sm dark:text-gray-300 mt-1 leading-relaxed">
            Available for new projects and collaborations.
          </p>
        </div>

        <div class="pt-4 border-t dark:border-gray-800">
          <button
              class="flex items-center gap-3 w-full p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-2xl transition-all group">
            <div
                class="size-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Icon name="lucide:slash" class="size-5"/>
            </div>
            <span class="font-bold text-sm">{{ t('Block User') }}</span>
          </button>
        </div>
      </div>
    </div>
  </aside>

  <Transition name="fade">
    <div
        v-if="uiStore.isInfoSidebarOpen"
        @click="uiStore.isInfoSidebarOpen = false"
        class="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-30 lg:hidden"
    ></div>
  </Transition>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>