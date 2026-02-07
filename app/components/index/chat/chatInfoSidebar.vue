<script setup lang="ts">
import {storeToRefs} from 'pinia'
import {useUiStore} from "~/stores/ui"

const uiStore = useUiStore()
const {user, isInfoSidebarOpen, name} = storeToRefs(uiStore)
const {t} = useI18n()
</script>

<template>
  <aside
      class="fixed inset-y-0 end-0 z-40 w-full sm:w-[350px] lg:w-[380px]
       bg-white dark:bg-gray-900 border-s border-gray-100
       dark:border-gray-800 shadow-xl transition-transform duration-300 ease-in-out"
      :class="[
        isInfoSidebarOpen ? 'translate-x-0' : '',
        !isInfoSidebarOpen ? 'ltr:translate-x-full rtl:-translate-x-full' : ''
      ]"
  >
    <div class="h-16 flex items-center px-4 border-b border-gray-50 dark:border-gray-800">
      <button @click="uiStore.isInfoSidebarOpen = false"
              class="p-2 size-10 flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
        <Icon name="lucide:x" class="dark:text-white size-6"/>
      </button>
      <h2 class="font-bold ms-2 dark:text-white">{{ t('User Info') }}</h2>
    </div>

    <div v-if="user" class="overflow-y-auto h-[calc(100vh-64px)] p-6 custom-scrollbar">
      <div class="flex flex-col items-center text-center space-y-4 mb-8">
        <div
            class="size-24 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl text-white font-bold shadow-lg overflow-hidden">
          <img v-if="user.profile?.avatar" class="h-full w-full object-cover" :src="user.profile.avatar.url" alt="">
          <span v-else>
            {{ user.name?.substring(0, 1).toUpperCase() }}
          </span>
        </div>

        <div>
          <h3 class="text-xl font-bold dark:text-white">{{ user.name }}</h3>
          <p v-if="user.profile?.username" class="text-sm text-gray-500 text-center mt-2" dir="ltr">
            @{{ user.profile.username }}
          </p>
        </div>
      </div>

      <div class="bg-gray-50/50 dark:bg-gray-800/50 p-4 rounded-2xl">
        <label class="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{{ t('Bio') }}</label>
        <p class="text-sm dark:text-gray-300 mt-1 leading-relaxed text-start">
          {{ user.profile?.bio || t('No bio available') }}
        </p>
      </div>
    </div>

    <div v-else class="h-full flex items-center justify-center">
      <Icon name="lucide:loader-2" class="animate-spin size-8 text-blue-500"/>
    </div>
  </aside>

</template>