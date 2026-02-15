<script setup lang="ts">
import { useUiStore } from "~/stores/ui";
import { usePresenceStore } from "~/stores/presence";
import { useTimeAgo } from '@vueuse/core';
import type { UserType } from "~/types/user.type";

const uiStore = useUiStore()
const presenceStore = usePresenceStore()

const props = defineProps<{
  user: UserType | any
  activeChatId: string | null
}>()

const emit = defineEmits(['back'])
const { t } = useI18n()

/**
 * 1. REAL-TIME ONLINE CHECK
 * We check the Pinia store directly. Because presenceStore.onlineUserIds is reactive,
 * this will update instantly when Reverb fires the 'joining' or 'leaving' events.
 */
const isOnline = computed(() => {
  if (!props.user?.id) return false
  return presenceStore.isOnline(props.user.id)
})

/**
 * 2. LAST SEEN LOGIC
 * If the user isn't in the database yet (new user) or we just saw them leave,
 * we prioritize the local update from app.vue.
 */
const displayLastSeen = computed(() => {
  if (!props.user?.id) return null
  return presenceStore.localLastSeenUpdates[props.user.id] || props.user.last_seen_at
})

const timeAgo = useTimeAgo(displayLastSeen)
</script>

<template>
  <header
      class="h-16 flex items-center justify-between px-4 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-10">
    <div v-if="activeChatId" class="flex items-center gap-3 min-w-0 flex-1">
      <button @click="emit('back')"
              class="md:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
        <Icon name="lucide:arrow-left" class="size-6 dark:text-gray-300"/>
      </button>

      <div
          class="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity overflow-hidden"
          @click="uiStore.toggleInfoSidebar()"
      >
        <div
            class="size-10 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold shrink-0 overflow-hidden shadow-sm relative">
          <NuxtPicture
              v-if="user?.profile?.avatar?.url"
              :src="user.profile.avatar.url"
              :alt="user.name || 'User avatar'"
              format="avif,webp"
              :img-attrs="{ class: 'h-full w-full object-cover' }"
          />
          <span v-else class="h-fit">
            {{ user?.name ? user.name.substring(0, 1).toUpperCase() : '?' }}
          </span>

          <span v-if="isOnline"
                class="absolute bottom-0 right-0 size-3 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full"></span>
        </div>

        <div class="min-w-0">
          <h2 class="font-bold text-base md:text-lg dark:text-white truncate">{{ user.name }}</h2>

          <p v-if="isOnline" class="text-[10px] text-green-500 font-bold uppercase tracking-wide">
            {{ t('Online') }}
          </p>
          <p v-else class="text-[10px] text-gray-400 font-medium truncate">
            <span v-if="displayLastSeen">
              {{ t('Last seen') }} {{ timeAgo }}
            </span>
            <span v-else>
              {{ t('Offline') }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <div v-if="activeChatId" class="flex items-center gap-2">
      <button @click="uiStore.toggleInfoSidebar()"
              class="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
        <Icon name="lucide:info" class="size-5"/>
      </button>
    </div>
  </header>
</template>