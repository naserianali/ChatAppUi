<script setup lang="ts">
import {useIntersectionObserver} from '@vueuse/core'
import {storeToRefs} from 'pinia'
import {useUiStore} from "~/stores/ui"
import {usePresenceStore} from "~/stores/presence"
import {useChat} from "~/composables/useChat";

const uiStore = useUiStore()
const presenceStore = usePresenceStore()

const {activeChatId, user: selectedUser} = storeToRefs(uiStore)
const messagesContainer = ref<HTMLElement | null>(null)
const topTrigger = ref<HTMLElement | null>(null)
const bottomTrigger = ref<HTMLElement | null>(null)

const {
  messages,
  isLoading,
  isFetchingMore,
  hasMoreOlder,
  hasMoreNewer,
  nextCursor,
  prevCursor,
  user,
  fetchMessages,
  handleMessageSent,
  onMessageVisible,
  handleJumpToParent
} = useChat(activeChatId, messagesContainer)

const realTimeUser = computed(() => {
  if (!selectedUser.value) return {}

  return {
    ...selectedUser.value,
    is_online: presenceStore.isOnline(selectedUser.value.id),
    last_seen_at: presenceStore.localLastSeenUpdates[selectedUser.value.id] || selectedUser.value.last_seen_at
  }
})

useIntersectionObserver(topTrigger, ([{isIntersecting}]) => {
  if (isIntersecting && hasMoreOlder.value && !isFetchingMore.value && !isLoading.value) {
    fetchMessages(nextCursor.value, 'up')
  }
})

useIntersectionObserver(bottomTrigger, ([{isIntersecting}]) => {
  if (isIntersecting && hasMoreNewer.value && !isFetchingMore.value && !isLoading.value) {
    fetchMessages(prevCursor.value, 'down')
  }
})
</script>

<template>
  <div class="flex flex-col h-full w-full bg-white dark:bg-gray-900 overflow-hidden relative">
    <IndexChatHeader
        :user="realTimeUser"
        :active-chat-id="activeChatId"
        @back="uiStore.setActiveChat(null, null)"
    />

    <main ref="messagesContainer"
          class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-black/40 custom-scrollbar">

      <div v-if="isLoading && !isFetchingMore" class="flex items-center justify-center py-20">
        <Icon name="lucide:loader-2" class="animate-spin size-8 text-blue-500"/>
      </div>

      <template v-else>
        <div ref="topTrigger" class="h-4 w-full flex items-center justify-center">
          <Icon v-if="isFetchingMore && hasMoreOlder" name="lucide:loader-2" class="animate-spin size-5 text-blue-400"/>
        </div>

        <IndexChatMessageItem
            v-for="msg in messages"
            :id="`msg-${msg.id}`"
            :key="msg.id"
            :message="msg"
            :is-own="msg.sender_id === user?.id"
            @visible="onMessageVisible"
            @jump-to-parent="handleJumpToParent"
        />

        <div ref="bottomTrigger" class="h-10 w-full flex items-center justify-center">
          <Icon v-if="isFetchingMore && hasMoreNewer" name="lucide:loader-2" class="animate-spin size-5 text-blue-400"/>
        </div>
      </template>
    </main>

    <footer v-if="activeChatId" class="px-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 h-16">
      <IndexChatSendMessage @message-sent="handleMessageSent"/>
    </footer>
  </div>
</template>

<style scoped>
.custom-scrollbar {
  overflow-anchor: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}

:deep(.highlight-anim) {
  animation: highlight 3s ease-in-out forwards;
}

@keyframes highlight {
  0% {
    background-color: rgba(59, 130, 246, 0.4);
  }
  100% {
    background-color: transparent;
  }
}
</style>