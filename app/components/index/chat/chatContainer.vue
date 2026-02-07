<script setup lang="ts">
import {useIntersectionObserver} from '@vueuse/core'
import {storeToRefs} from 'pinia'
import {useUiStore} from "~/stores/ui";

const {$echo} = useNuxtApp()
const uiStore = useUiStore()
const {activeChatId, name} = storeToRefs(uiStore)

const user = useCookie<any>('user').value
const token = useCookie('token').value

const messagesContainer = ref<HTMLElement | null>(null)
const topTrigger = ref<HTMLElement | null>(null)
const messages = ref<any[]>([])
const isLoading = ref(false)
const isFetchingMore = ref(false)
const isInitialLoading = ref(true)
const currentPage = ref(1)
const lastPage = ref(1)

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

    const msg = messages.value.find(m => m.id === messageId)
    if (msg) msg.read_at = new Date().toISOString()

  } catch (err) {
    console.error(`Failed to mark message ${messageId} as read`, err)
  }
}

const onMessageVisible = (messageId: string) => {
  const msg = messages.value.find(m => m.id === messageId)
  if (msg && msg.sender_id !== user?.id) {
    markAsRead(messageId)
  }
}
const scrollToBottom = () => nextTick(() => {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
})

const handleScroll = () => {
  if (messagesContainer.value && activeChatId.value && !isInitialLoading.value) {
    uiStore.setScrollPosition(activeChatId.value, messagesContainer.value.scrollTop)
  }
}

const handleIncomingMessage = (newMessage: any) => {
  if (!newMessage || !newMessage.id) return;
  const exists = messages.value.some(m => m && m.id === newMessage.id)

  if (!exists) {
    messages.value.push(newMessage)
    if (newMessage.sender_id === user?.id || isNearBottom()) {
      scrollToBottom()
    }
  }
}
const isNearBottom = () => {
  if (!messagesContainer.value) return false
  const container = messagesContainer.value
  return container.scrollHeight - container.scrollTop - container.clientHeight < 150
}

const fetchMessages = async (page = 1) => {
  if (!activeChatId.value) return
  const isLoadMore = page > 1
  isLoadMore ? (isFetchingMore.value = true) : (isLoading.value = true, isInitialLoading.value = true)

  try {
    const res = await $fetch<any>(getBaseUrl(1, RouteEnum.GetConversation, {conversationId: activeChatId.value}), {
      params: {page},
      headers: {Authorization: 'Bearer ' + token}
    })

    if (res?.data) {
      const container = messagesContainer.value
      const prevH = container?.scrollHeight || 0
      const prevT = container?.scrollTop || 0

      if (isLoadMore) {
        messages.value = [...res.data, ...messages.value]
        await nextTick()
        if (container) container.scrollTop = container.scrollHeight - prevH + prevT
      } else {
        messages.value = res.data
        await nextTick()
        const saved = uiStore.chatScrollPositions?.[activeChatId.value]
        setTimeout(() => {
          if (container) container.scrollTop = (saved && saved > 0) ? saved : container.scrollHeight
          isInitialLoading.value = false
        }, 50)
      }
      currentPage.value = res.pagination.current_page
      lastPage.value = res.pagination.total_pages
    }
  } finally {
    isLoading.value = false
    isFetchingMore.value = false
  }
}

useIntersectionObserver(topTrigger, ([{isIntersecting}]) => {
  if (isIntersecting && !isLoading.value && !isFetchingMore.value && currentPage.value < lastPage.value) {
    fetchMessages(currentPage.value + 1)
  }
})

const setupEcho = (id: string) => {
  const channel = $echo.private(`conversations.${id}`)
  channel
      .listen('MessageSent', (e: any) => {
        handleIncomingMessage(e.message || e)
      })
  channel.listen('MessageReadEvent', (e: any) => {
    const msg = messages.value.find(m => m.id === e.message_id)
    if (msg) {
      if (!msg.message_reads) msg.message_reads = []
      const alreadyRead = msg.message_reads.some(r => r.user_id === e.user_id)
      if (!alreadyRead) {
        msg.message_reads.push({
          user_id: e.user_id,
          read_at: new Date().toISOString()
        })
      }
    }
  })
}

const leaveEcho = (id: string) => {
  $echo.leave(`conversations.${id}`)
}

watch(activeChatId, (newId, oldId) => {
  if (oldId) leaveEcho(oldId)
  messages.value = []
  if (newId) {
    setupEcho(newId)
    fetchMessages(1)
  }
}, {immediate: true})

onUnmounted(() => {
  if (activeChatId.value) leaveEcho(activeChatId.value)
})
</script>

<template>
  <div class="flex flex-col h-full w-full bg-white dark:bg-gray-900 overflow-hidden">
    <IndexChatHeader
        :name="name"
        :active-chat-id="activeChatId"
        @back="uiStore.setActiveChat(null, null)"
    />

    <main
        ref="messagesContainer"
        @scroll="handleScroll"
        class="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50 dark:bg-black/40 custom-scrollbar"
    >
      <IndexChatEmptyState v-if="!activeChatId"/>

      <div v-else-if="isLoading && !isFetchingMore" class="flex justify-center py-10">
        <Icon name="lucide:loader-2" class="animate-spin size-8 text-blue-500"/>
      </div>

      <template v-else>
        <div ref="topTrigger" class="h-4 w-full flex items-center justify-center shrink-0">
          <Icon v-if="isFetchingMore" name="lucide:loader-2" class="animate-spin size-4 text-gray-400"/>
        </div>

        <IndexChatMessageItem
            v-for="msg in messages"
            :key="msg.id"
            :message="msg"
            :is-own="msg.sender_id === user?.id"
            @visible="onMessageVisible"
        />
      </template>
    </main>

    <footer v-if="activeChatId" class="p-3 md:p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0">
      <IndexChatSendMessage @message-sent="handleIncomingMessage"/>
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
  background: rgba(156, 163, 175, 0.2);
  border-radius: 10px;
}
</style>