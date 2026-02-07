<script setup lang="ts">
import {useUiStore} from "~/stores/ui";

const uiStore = useUiStore()
const props = defineProps<{
  name: string | null
  activeChatId: string | null
}>()
const emit = defineEmits(['back'])
const {t} = useI18n()
</script>

<template>
  <header class="h-16 flex items-center justify-between px-4 border-b ...">
    <div v-if="activeChatId" class="flex items-center gap-3 min-w-0 flex-1">
      <button @click="emit('back')" class="md:hidden ...">
        <Icon name="lucide:arrow-left" class="size-6"/>
      </button>

      <div
          class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
          @click="uiStore.toggleInfoSidebar()"
      >
        <div
            class="size-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold  shadow-sm">
          <span class="h-fit">
            {{ name ? name.substring(0, 1).toUpperCase() : '?' }}
          </span>
        </div>
        <div class="min-w-0">
          <h2 class="font-bold text-base md:text-lg dark:text-white truncate">{{ name }}</h2>
          <span class="text-[10px] text-green-500 font-medium">Online</span>
        </div>
      </div>
    </div>

    <div v-if="activeChatId" class="flex items-center gap-2">
      <button @click="uiStore.toggleInfoSidebar()" class="p-2 text-gray-400 hover:text-gray-600">
        <Icon name="lucide:info" class="size-5"/>
      </button>
    </div>
  </header>
</template>