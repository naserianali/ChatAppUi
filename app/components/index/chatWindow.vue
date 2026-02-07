<script setup lang="ts">
import {useIntersectionObserver} from '@vueuse/core'
import {storeToRefs} from 'pinia'
import {useUiStore} from "~/stores/ui";
import {RouteEnum} from "~/utils/api";

const {$echo} = useNuxtApp()
const uiStore = useUiStore()
const {activeChatId, user: selectedUser} = storeToRefs(uiStore)

const user = useCookie<any>('user').value
const token = useCookie('token').value

const messagesContainer = ref<HTMLElement | null>(null)
const topTrigger = ref<HTMLElement | null>(null)
const bottomTrigger = ref<HTMLElement | null>(null)
const messages = ref<any[]>([])

const isLoading = ref(false)
const isFetchingMore = ref(false)

const nextCursor = ref<string | null>(null)
const prevCursor = ref<string | null>(null)
const hasMoreOlder = ref(false)
const hasMoreNewer = ref(false)

const markAsRead = async (messageId: string) => {
  if (!activeChatId.value) return
  try {
    await $fetch(getBaseUrl(1, RouteEnum.MarkAsRead, {
      conversationId: activeChatId.value,
      messageId: messageId
    }), {
      method: 'PATCH',
      headers: {Authorization: 'Bearer ' + token}
    })
  } catch (err) {
  }
}

const onMessageVisible = (messageId: string) => {
  const msg = messages.value.find(m => m.id === messageId)
  if (msg && msg.sender_id !== user?.id && !msg.read_at) {
    markAsRead(messageId)
  }
}

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  })
}

const fetchMessages = async (cursor: string | null = null, direction: 'older' | 'newer' = 'older') => {
  if (!activeChatId.value || isFetchingMore.value) return

  const isInitial = !cursor && messages.value.length === 0
  if (isInitial) isLoading.value = true
  isFetchingMore.value = true

  try {
    const res = await $fetch<any>(getBaseUrl(1, RouteEnum.GetConversation, {conversationId: activeChatId.value}), {
      params: {
        cursor: cursor,
        per_page: 20,
        // If direction is newer, your backend logic needs to handle the cursor differently
        direction: direction
      },
      headers: {Authorization: 'Bearer ' + token}
    })

    if (res?.data) {
      const container = messagesContainer.value
      const prevH = container?.scrollHeight || 0
      const prevT = container?.scrollTop || 0

      if (isInitial) {
        messages.value = res.data
        nextCursor.value = res.pagination.next_cursor
        hasMoreOlder.value = res.pagination.has_more
        hasMoreNewer.value = false
        scrollToBottom()
      } else if (direction === 'older') {
        const newMsgs = res.data.filter((nm: any) => !messages.value.some(m => m.id === nm.id))
        messages.value = [...newMsgs, ...messages.value]
        nextCursor.value = res.pagination.next_cursor
        hasMoreOlder.value = res.pagination.has_more
        await nextTick()
        if (container) container.scrollTop = container.scrollHeight - prevH + prevT
      } else if (direction === 'newer') {
        const newMsgs = res.data.filter((nm: any) => !messages.value.some(m => m.id === nm.id))
        messages.value = [...messages.value, ...newMsgs]
        prevCursor.value = res.pagination.prev_cursor
        hasMoreNewer.value = res.pagination.has_more
      }
    }
  } finally {
    isLoading.value = false
    isFetchingMore.value = false
  }
}

const handleJumpToParent = async (parentId: string) => {
  const existingElement = document.getElementById(`msg-${parentId}`)
  if (existingElement) {
    existingElement.scrollIntoView({behavior: 'smooth', block: 'center'})
    return
  }

  try {
    isLoading.value = true
    const res = await $fetch<any>(getBaseUrl(1, RouteEnum.GetReplayPage, {
      conversationId: activeChatId.value,
      messageId: parentId
    }), {
      headers: {Authorization: 'Bearer ' + token}
    })

    if (res?.success && res.data?.data) {
      messages.value = res.data.data
      // Set cursors from the slice service
      nextCursor.value = res.data.meta.next_cursor
      prevCursor.value = res.data.meta.prev_cursor
      hasMoreOlder.value = !!res.data.meta.next_cursor
      hasMoreNewer.value = !!res.data.meta.prev_cursor

      await nextTick()
      const target = document.getElementById(`msg-${parentId}`)
      if (target) target.scrollIntoView({behavior: 'auto', block: 'center'})
    }
  } finally {
    isLoading.value = false
  }
}

useIntersectionObserver(topTrigger, ([{isIntersecting}]) => {
  if (isIntersecting && hasMoreOlder.value && !isFetchingMore.value) {
    fetchMessages(nextCursor.value, 'older')
  }
})

useIntersectionObserver(bottomTrigger, ([{isIntersecting}]) => {
  if (isIntersecting && hasMoreNewer.value && !isFetchingMore.value) {
    fetchMessages(prevCursor.value, 'newer')
  }
})

const setupEcho = (id: string) => {
  const channel = $echo.private(`conversations.${id}`)
  channel.listen('MessageSent', (e: any) => {
    if (!hasMoreNewer.value) {
      messages.value.push(e.message || e)
      scrollToBottom()
    }
  })
}

watch(activeChatId, (newId) => {
  messages.value = []
  hasMoreOlder.value = false
  hasMoreNewer.value = false
  if (newId) {
    fetchMessages(null)
    setTimeout(() => setupEcho(newId), 500)
  }
}, {immediate: true})
</script>

<template>
  <div class="flex flex-col h-full w-full bg-white dark:bg-gray-900 overflow-hidden relative">
    <IndexChatHeader :user="selectedUser" :active-chat-id="activeChatId" @back="uiStore.setActiveChat(null, null)"/>

    <main ref="messagesContainer"
          class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-black/40 custom-scrollbar">
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
    </main>

    <footer v-if="activeChatId" class="px-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 h-16">
      <IndexChatSendMessage @message-sent="fetchMessages(null)"/>
    </footer>
  </div>
</template>

<style scoped>
.custom-scrollbar {
  overflow-anchor: none;
  scroll-behavior: smooth;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.1);
  border-radius: 10px;
}
</style>