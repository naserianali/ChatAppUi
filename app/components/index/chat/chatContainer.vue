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
const isInitialLoading = ref(true)
const currentPage = ref(1)
const lastPage = ref(1)
const perPage = ref(18)

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
    console.error(err)
  }
}

const onMessageVisible = (messageId: string) => {
  const msg = messages.value.find(m => m.id === messageId)
  if (msg && msg.sender_id !== user?.id && !msg.read_at) {
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
    if (currentPage.value === 1) {
      messages.value.push(newMessage)
      if (newMessage.sender_id === user?.id || isNearBottom()) {
        scrollToBottom()
      }
    }
  }
}

const isNearBottom = () => {
  if (!messagesContainer.value) return false
  const container = messagesContainer.value
  return container.scrollHeight - container.scrollTop - container.clientHeight < 150
}

const fetchMessages = async (page = 1, direction: 'up' | 'down' = 'up') => {
  // Prevent duplicate overlapping calls
  if (!activeChatId.value || isLoading.value || isFetchingMore.value) return

  const isInitial = messages.value.length === 0
  isInitial ? (isLoading.value = true, isInitialLoading.value = true) : (isFetchingMore.value = true)

  try {
    const res = await $fetch<any>(getBaseUrl(1, RouteEnum.GetConversation, {conversationId: activeChatId.value}), {
      params: {
        page: page,
        per_page: perPage.value
      },
      headers: {Authorization: 'Bearer ' + token}
    })

    if (res?.data) {
      const container = messagesContainer.value
      const prevH = container?.scrollHeight || 0
      const prevT = container?.scrollTop || 0

      if (isInitial) {
        messages.value = res.data
        await nextTick()
        const saved = uiStore.chatScrollPositions?.[activeChatId.value]
        setTimeout(() => {
          if (container) container.scrollTop = (saved && saved > 0) ? saved : container.scrollHeight
          isInitialLoading.value = false
        }, 50)
      } else if (direction === 'up') {
        // Filter out any duplicates that might already exist in the array
        const newMsgs = res.data.filter((nm: any) => !messages.value.some(m => m.id === nm.id))
        messages.value = [...newMsgs, ...messages.value]
        await nextTick()
        if (container) container.scrollTop = container.scrollHeight - prevH + prevT
      } else if (direction === 'down') {
        const newMsgs = res.data.filter((nm: any) => !messages.value.some(m => m.id === nm.id))
        messages.value = [...messages.value, ...newMsgs]
      }

      currentPage.value = res.pagination.current_page
      lastPage.value = res.pagination.total_pages
    }
  } finally {
    isLoading.value = false
    isFetchingMore.value = false
  }
}

const handleJumpToParent = async (parentId: string) => {
  const element = document.getElementById(`msg-${parentId}`)
  if (element) {
    element.scrollIntoView({behavior: 'smooth', block: 'center'})
    element.classList.add('ring-2', 'ring-primary-500')
    setTimeout(() => element.classList.remove('ring-2', 'ring-primary-500'), 2000)
  } else {
    try {
      // Show loader immediately
      isLoading.value = true

      const res = await $fetch<any>(getBaseUrl(1, RouteEnum.GetReplayPage, {
        conversationId: activeChatId.value,
        messageId: parentId
      }), {
        headers: {Authorization: 'Bearer ' + token}
      })

      if (res.data) {
        // Reset state BEFORE fetching to ensure fetchMessages treats it as an initial load
        messages.value = []
        currentPage.value = 1
        perPage.value = res.data.per_page

        // Manual trigger
        await fetchMessages(1)

        await nextTick()
        setTimeout(() => {
          const newEl = document.getElementById(`msg-${parentId}`)
          if (newEl) {
            newEl.scrollIntoView({behavior: 'auto', block: 'center'})
            newEl.classList.add('ring-2', 'ring-primary-500')
            setTimeout(() => newEl.classList.remove('ring-2', 'ring-primary-500'), 2000)
          }
          perPage.value = 18
        }, 200)
      }
    } catch (e) {
      console.error(e)
    } finally {
      isLoading.value = false
    }
  }
}

useIntersectionObserver(topTrigger, ([{isIntersecting}]) => {
  if (isIntersecting && !isLoading.value && !isFetchingMore.value && currentPage.value < lastPage.value) {
    fetchMessages(currentPage.value + 1, 'up')
  }
})

useIntersectionObserver(bottomTrigger, ([{isIntersecting}]) => {
  if (isIntersecting && !isLoading.value && !isFetchingMore.value && currentPage.value > 1) {
    fetchMessages(currentPage.value - 1, 'down')
  }
})

const activeChannel = ref<any>(null)

const setupEcho = (id: string) => {
  if (activeChannel.value) {
    $echo.leave(`conversations.${activeChannel.value}`)
  }

  activeChannel.value = id
  const channel = $echo.private(`conversations.${id}`)

  channel.listen('MessageSent', (e: any) => {
    handleIncomingMessage(e.message || e)
  })

  channel.listen('MessageReadEvent', (e: any) => {
    const msg = messages.value.find(m => m.id === e.message_id)
    if (msg) {
      if (!msg.message_reads) msg.message_reads = []
      if (!msg.message_reads.some((r: any) => r.user_id === e.user_id)) {
        msg.message_reads.push({user_id: e.user_id, read_at: new Date().toISOString()})
      }
    }
  })
}

watch(activeChatId, (newId) => {
  messages.value = []
  perPage.value = 18
  currentPage.value = 1
  if (newId) {
    fetchMessages(1)
    setTimeout(() => setupEcho(newId), 500)
  }
}, {immediate: true})

onUnmounted(() => {
  if (activeChatId.value) $echo.leave(`conversations.${activeChatId.value}`)
})
</script>

<template>
  <div class="flex flex-col h-full w-full bg-white dark:bg-gray-900 overflow-hidden">
    <IndexChatHeader
        :user="selectedUser"
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
          <Icon v-if="isFetchingMore && currentPage < lastPage" name="lucide:loader-2"
                class="animate-spin size-4 text-gray-400"/>
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

        <div ref="bottomTrigger" class="h-4 w-full flex items-center justify-center shrink-0">
          <Icon v-if="isFetchingMore && currentPage > 1" name="lucide:loader-2"
                class="animate-spin size-4 text-gray-400"/>
        </div>
      </template>
    </main>

    <footer v-if="activeChatId" class="px-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 shrink-0 h-16">
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