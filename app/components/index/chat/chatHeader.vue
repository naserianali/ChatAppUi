<script setup lang="ts">
const props = defineProps<{
  name: string | null
  activeChatId: string | null
}>()

const emit = defineEmits(['back'])
const { t } = useI18n()
</script>

<template>
  <header class="h-16 flex items-center justify-between px-4 border-b dark:border-gray-800 shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
    <div v-if="activeChatId" class="flex items-center gap-3 min-w-0">
      <button @click="emit('back')" class="md:hidden p-2 -ms-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors shrink-0">
        <Icon name="lucide:arrow-left" class="size-6 dark:text-white" />
      </button>
      <div class="size-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shrink-0 shadow-sm">
        {{ name ? name.substring(0, 1).toUpperCase() : '?' }}
      </div>
      <div class="min-w-0">
        <h2 class="font-bold text-base md:text-lg dark:text-white truncate leading-tight">{{ name }}</h2>
        <span class="text-[10px] text-green-500 font-medium">Online</span>
      </div>
    </div>
    <div v-else class="text-gray-400 text-sm font-medium italic">{{ t("No conversation selected") }}</div>
  </header>
</template>